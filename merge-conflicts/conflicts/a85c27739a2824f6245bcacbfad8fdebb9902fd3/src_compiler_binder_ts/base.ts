/// <reference path="parser.ts"/>

/* @internal */
module ts {
    export let bindTime = 0;

    export const enum ModuleInstanceState {
        NonInstantiated = 0,
        Instantiated    = 1,
        ConstEnumOnly   = 2
    }

    export function getModuleInstanceState(node: Node): ModuleInstanceState {
        // A module is uninstantiated if it contains only 
        // 1. interface declarations, type alias declarations
        if (node.kind === SyntaxKind.InterfaceDeclaration || node.kind === SyntaxKind.TypeAliasDeclaration) {
            return ModuleInstanceState.NonInstantiated;
        }
        // 2. const enum declarations
        else if (isConstEnumDeclaration(node)) {
            return ModuleInstanceState.ConstEnumOnly;
        }
        // 3. non-exported import declarations
        else if ((node.kind === SyntaxKind.ImportDeclaration || node.kind === SyntaxKind.ImportEqualsDeclaration) && !(node.flags & NodeFlags.Export)) {
            return ModuleInstanceState.NonInstantiated;
        }
        // 4. other uninstantiated module declarations.
        else if (node.kind === SyntaxKind.ModuleBlock) {
            let state = ModuleInstanceState.NonInstantiated;
            forEachChild(node, n => {
                switch (getModuleInstanceState(n)) {
                    case ModuleInstanceState.NonInstantiated:
                        // child is non-instantiated - continue searching
                        return false;
                    case ModuleInstanceState.ConstEnumOnly:
                        // child is const enum only - record state and continue searching
                        state = ModuleInstanceState.ConstEnumOnly;
                        return false;
                    case ModuleInstanceState.Instantiated:
                        // child is instantiated - record state and stop
                        state = ModuleInstanceState.Instantiated;
                        return true;
                }
            });
            return state;
        }
        else if (node.kind === SyntaxKind.ModuleDeclaration) {
            return getModuleInstanceState((<ModuleDeclaration>node).body);
        }
        else {
            return ModuleInstanceState.Instantiated;
        }
    }

    export function bindSourceFile(file: SourceFile): void {
        let start = new Date().getTime();
        bindSourceFileWorker(file);
        bindTime += new Date().getTime() - start;
    }

    function bindSourceFileWorker(file: SourceFile): void {
        let parent: Node;
        let container: Node;
        let blockScopeContainer: Node;
        let lastContainer: Node;
        let symbolCount = 0;
        let Symbol = objectAllocator.getSymbolConstructor();

        if (!file.locals) {
            file.locals = {};
            container = file;
            setBlockScopeContainer(file, /*cleanLocals*/ false);
            bind(file);
            file.symbolCount = symbolCount;
        }

        function createSymbol(flags: SymbolFlags, name: string): Symbol {
            symbolCount++;
            return new Symbol(flags, name);
        }

        function setBlockScopeContainer(node: Node, cleanLocals: boolean) {
            blockScopeContainer = node;
            if (cleanLocals) {
                blockScopeContainer.locals = undefined;
            }
        }

        function addDeclarationToSymbol(symbol: Symbol, node: Declaration, symbolKind: SymbolFlags) {
            symbol.flags |= symbolKind;
            if (!symbol.declarations) symbol.declarations = [];
            symbol.declarations.push(node);
            if (symbolKind & SymbolFlags.HasExports && !symbol.exports) symbol.exports = {};
            if (symbolKind & SymbolFlags.HasMembers && !symbol.members) symbol.members = {};
            node.symbol = symbol;
            if (symbolKind & SymbolFlags.Value && !symbol.valueDeclaration) symbol.valueDeclaration = node;
        }

        // Should not be called on a declaration with a computed property name,
        // unless it is a well known Symbol.
        function getDeclarationName(node: Declaration): string {
            if (node.name) {
                if (node.kind === SyntaxKind.ModuleDeclaration && node.name.kind === SyntaxKind.StringLiteral) {
                    return '"' + (<LiteralExpression>node.name).text + '"';
                }
                if (node.name.kind === SyntaxKind.ComputedPropertyName) {
                    let nameExpression = (<ComputedPropertyName>node.name).expression;
                    Debug.assert(isWellKnownSymbolSyntactically(nameExpression));
                    return getPropertyNameForKnownSymbolName((<PropertyAccessExpression>nameExpression).name.text);
                }
                return (<Identifier | LiteralExpression>node.name).text;
            }
            switch (node.kind) {
                case SyntaxKind.ConstructorType:
                case SyntaxKind.Constructor:
                    return "__constructor";
                case SyntaxKind.FunctionType:
                case SyntaxKind.CallSignature:
                    return "__call";
                case SyntaxKind.ConstructSignature:
                    return "__new";
                case SyntaxKind.IndexSignature:
                    return "__index";
                case SyntaxKind.ExportDeclaration:
                    return "__export";
                case SyntaxKind.ExportAssignment:
                    return (<ExportAssignment>node).isExportEquals ? "export=" : "default";
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.ClassDeclaration:
                    return node.flags & NodeFlags.Default ? "default" : undefined;
            }
        }

        function getDisplayName(node: Declaration): string {
            return node.name ? declarationNameToString(node.name) : getDeclarationName(node);
        }

        function declareSymbol(symbols: SymbolTable, parent: Symbol, node: Declaration, includes: SymbolFlags, excludes: SymbolFlags): Symbol {
            Debug.assert(!hasDynamicName(node));

            // The exported symbol for an export default function/class node is always named "default"
            let name = node.flags & NodeFlags.Default && parent ? "default" : getDeclarationName(node);

            let symbol: Symbol;
            if (name !== undefined) {
                symbol = hasProperty(symbols, name) ? symbols[name] : (symbols[name] = createSymbol(0, name));
                if (symbol.flags & excludes) {
                    if (node.name) {
                        node.name.parent = node;
                    }

                    // Report errors every position with duplicate declaration
                    // Report errors on previous encountered declarations
                    let message = symbol.flags & SymbolFlags.BlockScopedVariable
                        ? Diagnostics.Cannot_redeclare_block_scoped_variable_0 
                        : Diagnostics.Duplicate_identifier_0;

                    forEach(symbol.declarations, declaration => {
                        file.bindDiagnostics.push(createDiagnosticForNode(declaration.name || declaration, message, getDisplayName(declaration)));
                    });
                    file.bindDiagnostics.push(createDiagnosticForNode(node.name || node, message, getDisplayName(node)));

                    symbol = createSymbol(0, name);
                }
            }
            else {
                symbol = createSymbol(0, "__missing");
            }
            addDeclarationToSymbol(symbol, node, includes);
            symbol.parent = parent;

            if ((node.kind === SyntaxKind.ClassDeclaration || node.kind === SyntaxKind.ClassExpression) && symbol.exports) {
                // TypeScript 1.0 spec (April 2014): 8.4
                // Every class automatically contains a static property member named 'prototype', 
                // the type of which is an instantiation of the class type with type Any supplied as a type argument for each type parameter.
                // It is an error to explicitly declare a static property member with the name 'prototype'.
                let prototypeSymbol = createSymbol(SymbolFlags.Property | SymbolFlags.Prototype, "prototype");
                if (hasProperty(symbol.exports, prototypeSymbol.name)) {
                    if (node.name) {
                        node.name.parent = node;
                    }
                    file.bindDiagnostics.push(createDiagnosticForNode(symbol.exports[prototypeSymbol.name].declarations[0],
                        Diagnostics.Duplicate_identifier_0, prototypeSymbol.name));
                }
                symbol.exports[prototypeSymbol.name] = prototypeSymbol;
                prototypeSymbol.parent = symbol;
            }

            return symbol;
        }

        function declareModuleMember(node: Declaration, symbolKind: SymbolFlags, symbolExcludes: SymbolFlags) {
            let hasExportModifier = getCombinedNodeFlags(node) & NodeFlags.Export;
            if (symbolKind & SymbolFlags.Alias) {
                if (node.kind === SyntaxKind.ExportSpecifier || (node.kind === SyntaxKind.ImportEqualsDeclaration && hasExportModifier)) {
                    declareSymbol(container.symbol.exports, container.symbol, node, symbolKind, symbolExcludes);
                }
                else {
                    declareSymbol(container.locals, undefined, node, symbolKind, symbolExcludes);
                }
            }
            else {
                // Exported module members are given 2 symbols: A local symbol that is classified with an ExportValue,
                // ExportType, or ExportContainer flag, and an associated export symbol with all the correct flags set
                // on it. There are 2 main reasons:
                //
                //   1. We treat locals and exports of the same name as mutually exclusive within a container. 
                //      That means the binder will issue a Duplicate Identifier error if you mix locals and exports
                //      with the same name in the same container.
                //      TODO: Make this a more specific error and decouple it from the exclusion logic.
                //   2. When we checkIdentifier in the checker, we set its resolved symbol to the local symbol,
                //      but return the export symbol (by calling getExportSymbolOfValueSymbolIfExported). That way
                //      when the emitter comes back to it, it knows not to qualify the name if it was found in a containing scope.
                if (hasExportModifier || container.flags & NodeFlags.ExportContext) {
                    let exportKind = (symbolKind & SymbolFlags.Value ? SymbolFlags.ExportValue : 0) |
                        (symbolKind & SymbolFlags.Type ? SymbolFlags.ExportType : 0) |
                        (symbolKind & SymbolFlags.Namespace ? SymbolFlags.ExportNamespace : 0);
                    let local = declareSymbol(container.locals, undefined, node, exportKind, symbolExcludes);
                    local.exportSymbol = declareSymbol(container.symbol.exports, container.symbol, node, symbolKind, symbolExcludes);
                    node.localSymbol = local;
                }
                else {
                    declareSymbol(container.locals, undefined, node, symbolKind, symbolExcludes);
                }
            }
        }

        // All container nodes are kept on a linked list in declaration order. This list is used by the getLocalNameOfContainer function
        // in the type checker to validate that the local name used for a container is unique.
        function bindChildren(node: Node, symbolKind: SymbolFlags, isBlockScopeContainer: boolean) {
            if (symbolKind & SymbolFlags.HasLocals) {
                node.locals = {};
            }

            let saveParent = parent;
            let saveContainer = container;
            let savedBlockScopeContainer = blockScopeContainer;
            parent = node;
            if (symbolKind & SymbolFlags.IsContainer) {
                container = node;

                if (lastContainer) {
                    lastContainer.nextContainer = container;
                }

                lastContainer = container;
            }

            if (isBlockScopeContainer) {
                // in incremental scenarios we might reuse nodes that already have locals being allocated
                // during the bind step these locals should be dropped to prevent using stale data.
                // locals should always be dropped unless they were previously initialized by the binder
                // these cases are:
                // - node has locals (symbolKind & HasLocals) !== 0
                // - node is a source file
                setBlockScopeContainer(node, /*cleanLocals*/  (symbolKind & SymbolFlags.HasLocals) === 0 && node.kind !== SyntaxKind.SourceFile);
            }

            forEachChild(node, bind);
            container = saveContainer;
            parent = saveParent;
            blockScopeContainer = savedBlockScopeContainer;
        }

        function bindDeclaration(node: Declaration, symbolKind: SymbolFlags, symbolExcludes: SymbolFlags, isBlockScopeContainer: boolean) {
            switch (container.kind) {
                case SyntaxKind.ModuleDeclaration:
                    declareModuleMember(node, symbolKind, symbolExcludes);
                    break;
                case SyntaxKind.SourceFile:
                    if (isExternalModule(<SourceFile>container)) {
                        declareModuleMember(node, symbolKind, symbolExcludes);
                        break;
                    }
                case SyntaxKind.FunctionType:
                case SyntaxKind.ConstructorType:
                case SyntaxKind.CallSignature:
                case SyntaxKind.ConstructSignature:
                case SyntaxKind.IndexSignature:
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.MethodSignature:
                case SyntaxKind.Constructor:
                case SyntaxKind.GetAccessor:
                case SyntaxKind.SetAccessor:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.ArrowFunction:
                    declareSymbol(container.locals, undefined, node, symbolKind, symbolExcludes);
                    break;
                case SyntaxKind.ClassExpression:
                case SyntaxKind.ClassDeclaration:
                    if (node.flags & NodeFlags.Static) {
                        declareSymbol(container.symbol.exports, container.symbol, node, symbolKind, symbolExcludes);
                        break;
                    }
                case SyntaxKind.TypeLiteral:
                case SyntaxKind.ObjectLiteralExpression:
                case SyntaxKind.InterfaceDeclaration:
                    declareSymbol(container.symbol.members, container.symbol, node, symbolKind, symbolExcludes);
                    break;
                case SyntaxKind.EnumDeclaration:
                    declareSymbol(container.symbol.exports, container.symbol, node, symbolKind, symbolExcludes);
                    break;
            }
            bindChildren(node, symbolKind, isBlockScopeContainer);
        }

        function isAmbientContext(node: Node): boolean {
            while (node) {
                if (node.flags & NodeFlags.Ambient) return true;
                node = node.parent;
            }
            return false;
        }

        function hasExportDeclarations(node: ModuleDeclaration | SourceFile): boolean {
            var body = node.kind === SyntaxKind.SourceFile ? node : (<ModuleDeclaration>node).body;
            if (body.kind === SyntaxKind.SourceFile || body.kind === SyntaxKind.ModuleBlock) {
                for (let stat of (<Block>body).statements) {
                    if (stat.kind === SyntaxKind.ExportDeclaration || stat.kind === SyntaxKind.ExportAssignment) {
                        return true;
                    }
                }
            }
            return false;
        }

        function setExportContextFlag(node: ModuleDeclaration | SourceFile) {
            // A declaration source file or ambient module declaration that contains no export declarations (but possibly regular
            // declarations with export modifiers) is an export context in which declarations are implicitly exported.
            if (isAmbientContext(node) && !hasExportDeclarations(node)) {
                node.flags |= NodeFlags.ExportContext;
            }
            else {
                node.flags &= ~NodeFlags.ExportContext;
            }
        }

        function bindModuleDeclaration(node: ModuleDeclaration) {
            setExportContextFlag(node);
            if (node.name.kind === SyntaxKind.StringLiteral) {
                bindDeclaration(node, SymbolFlags.ValueModule, SymbolFlags.ValueModuleExcludes, /*isBlockScopeContainer*/ true);
            }
            else {
                let state = getModuleInstanceState(node);
                if (state === ModuleInstanceState.NonInstantiated) {
                    bindDeclaration(node, SymbolFlags.NamespaceModule, SymbolFlags.NamespaceModuleExcludes, /*isBlockScopeContainer*/ true);
                }
                else {
                    bindDeclaration(node, SymbolFlags.ValueModule, SymbolFlags.ValueModuleExcludes, /*isBlockScopeContainer*/ true);
                    let currentModuleIsConstEnumOnly = state === ModuleInstanceState.ConstEnumOnly;
                    if (node.symbol.constEnumOnlyModule === undefined) {
                        // non-merged case - use the current state
                        node.symbol.constEnumOnlyModule = currentModuleIsConstEnumOnly;
                    }
                    else {
                        // merged case: module is const enum only if all its pieces are non-instantiated or const enum
                        node.symbol.constEnumOnlyModule = node.symbol.constEnumOnlyModule && currentModuleIsConstEnumOnly;
                    }
                }
            }
        }

        function bindFunctionOrConstructorType(node: SignatureDeclaration) {
            // For a given function symbol "<...>(...) => T" we want to generate a symbol identical
            // to the one we would get for: { <...>(...): T }
            //
            // We do that by making an anonymous type literal symbol, and then setting the function 
            // symbol as its sole member. To the rest of the system, this symbol will be  indistinguishable 
            // from an actual type literal symbol you would have gotten had you used the long form.

            let symbol = createSymbol(SymbolFlags.Signature, getDeclarationName(node));
            addDeclarationToSymbol(symbol, node, SymbolFlags.Signature);
            bindChildren(node, SymbolFlags.Signature, /*isBlockScopeContainer:*/ false);

            let typeLiteralSymbol = createSymbol(SymbolFlags.TypeLiteral, "__type");
            addDeclarationToSymbol(typeLiteralSymbol, node, SymbolFlags.TypeLiteral);
            typeLiteralSymbol.members = {};
            typeLiteralSymbol.members[node.kind === SyntaxKind.FunctionType ? "__call" : "__new"] = symbol
        }

        function bindAnonymousDeclaration(node: Declaration, symbolKind: SymbolFlags, name: string, isBlockScopeContainer: boolean) {
            let symbol = createSymbol(symbolKind, name);
            addDeclarationToSymbol(symbol, node, symbolKind);
            bindChildren(node, symbolKind, isBlockScopeContainer);
        }

        function bindCatchVariableDeclaration(node: CatchClause) {
            bindChildren(node, /*symbolKind:*/ 0, /*isBlockScopeContainer:*/ true);
        }

        function bindBlockScopedDeclaration(node: Declaration, symbolKind: SymbolFlags, symbolExcludes: SymbolFlags) {
            switch (blockScopeContainer.kind) {
                case SyntaxKind.ModuleDeclaration:
                    declareModuleMember(node, symbolKind, symbolExcludes);
                    break;
                case SyntaxKind.SourceFile:
                    if (isExternalModule(<SourceFile>container)) {
                        declareModuleMember(node, symbolKind, symbolExcludes);
                        break;
                    }
                    // fall through.
                default:
                    if (!blockScopeContainer.locals) {
                        blockScopeContainer.locals = {};
                    }
                    declareSymbol(blockScopeContainer.locals, undefined, node, symbolKind, symbolExcludes);
            }
            bindChildren(node, symbolKind, /*isBlockScopeContainer*/ false);
        }

        function bindBlockScopedVariableDeclaration(node: Declaration) {
            bindBlockScopedDeclaration(node, SymbolFlags.BlockScopedVariable, SymbolFlags.BlockScopedVariableExcludes);
        }

        function getDestructuringParameterName(node: Declaration) {
            return "__" + indexOf((<SignatureDeclaration>node.parent).parameters, node);
        }

        function bind(node: Node) {
            node.parent = parent;
            
            switch (node.kind) {
                case SyntaxKind.TypeParameter:
                    bindDeclaration(<Declaration>node, SymbolFlags.TypeParameter, SymbolFlags.TypeParameterExcludes, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.Parameter:
                    bindParameter(<ParameterDeclaration>node);
                    break;
                case SyntaxKind.VariableDeclaration:
                case SyntaxKind.BindingElement:
                    if (isBindingPattern((<Declaration>node).name)) {
                        bindChildren(node, 0, /*isBlockScopeContainer*/ false);
                    }
                    else if (isBlockOrCatchScoped(<Declaration>node)) {
                        bindBlockScopedVariableDeclaration(<Declaration>node);
                    }
                    else {
                        bindDeclaration(<Declaration>node, SymbolFlags.FunctionScopedVariable, SymbolFlags.FunctionScopedVariableExcludes, /*isBlockScopeContainer*/ false);
                    }
                    break;
                case SyntaxKind.PropertyDeclaration:
                case SyntaxKind.PropertySignature:
                    bindPropertyOrMethodOrAccessor(<Declaration>node, SymbolFlags.Property | ((<PropertyDeclaration>node).questionToken ? SymbolFlags.Optional : 0), SymbolFlags.PropertyExcludes, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.PropertyAssignment:
                case SyntaxKind.ShorthandPropertyAssignment:
                    bindPropertyOrMethodOrAccessor(<Declaration>node, SymbolFlags.Property, SymbolFlags.PropertyExcludes, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.EnumMember:
                    bindPropertyOrMethodOrAccessor(<Declaration>node, SymbolFlags.EnumMember, SymbolFlags.EnumMemberExcludes, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.CallSignature:
                case SyntaxKind.ConstructSignature:
                case SyntaxKind.IndexSignature:
                    bindDeclaration(<Declaration>node, SymbolFlags.Signature, 0, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.MethodSignature:
                    // If this is an ObjectLiteralExpression method, then it sits in the same space
                    // as other properties in the object literal.  So we use SymbolFlags.PropertyExcludes
                    // so that it will conflict with any other object literal members with the same
                    // name.
                    bindPropertyOrMethodOrAccessor(<Declaration>node, SymbolFlags.Method | ((<MethodDeclaration>node).questionToken ? SymbolFlags.Optional : 0),
                        isObjectLiteralMethod(node) ? SymbolFlags.PropertyExcludes : SymbolFlags.MethodExcludes, /*isBlockScopeContainer*/ true);
                    break;
                case SyntaxKind.FunctionDeclaration:
                    bindDeclaration(<Declaration>node, SymbolFlags.Function, SymbolFlags.FunctionExcludes, /*isBlockScopeContainer*/ true);
                    break;
                case SyntaxKind.Constructor:
                    bindDeclaration(<Declaration>node, SymbolFlags.Constructor, /*symbolExcludes:*/ 0, /*isBlockScopeContainer:*/ true);
                    break;
                case SyntaxKind.GetAccessor:
                    bindPropertyOrMethodOrAccessor(<Declaration>node, SymbolFlags.GetAccessor, SymbolFlags.GetAccessorExcludes, /*isBlockScopeContainer*/ true);
                    break;
                case SyntaxKind.SetAccessor:
                    bindPropertyOrMethodOrAccessor(<Declaration>node, SymbolFlags.SetAccessor, SymbolFlags.SetAccessorExcludes, /*isBlockScopeContainer*/ true);
                    break;

                case SyntaxKind.FunctionType:
                case SyntaxKind.ConstructorType:
                    bindFunctionOrConstructorType(<SignatureDeclaration>node);
                    break;

                case SyntaxKind.TypeLiteral:
                    bindAnonymousDeclaration(<TypeLiteralNode>node, SymbolFlags.TypeLiteral, "__type", /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.ObjectLiteralExpression:
                    bindAnonymousDeclaration(<ObjectLiteralExpression>node, SymbolFlags.ObjectLiteral, "__object", /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.ArrowFunction:
                    bindAnonymousDeclaration(<FunctionExpression>node, SymbolFlags.Function, "__function", /*isBlockScopeContainer*/ true);
                    break;
                case SyntaxKind.ClassExpression:
                    bindAnonymousDeclaration(<ClassExpression>node, SymbolFlags.Class, "__class", /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.CatchClause:
                    bindCatchVariableDeclaration(<CatchClause>node);
                    break;
                case SyntaxKind.ClassDeclaration:
                    bindBlockScopedDeclaration(<Declaration>node, SymbolFlags.Class, SymbolFlags.ClassExcludes);
                    break;
                case SyntaxKind.InterfaceDeclaration:
                    bindDeclaration(<Declaration>node, SymbolFlags.Interface, SymbolFlags.InterfaceExcludes, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.TypeAliasDeclaration:
                    bindDeclaration(<Declaration>node, SymbolFlags.TypeAlias, SymbolFlags.TypeAliasExcludes, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.EnumDeclaration:
                    if (isConst(node)) {
                        bindDeclaration(<Declaration>node, SymbolFlags.ConstEnum, SymbolFlags.ConstEnumExcludes, /*isBlockScopeContainer*/ false);
                    }
                    else {
                        bindDeclaration(<Declaration>node, SymbolFlags.RegularEnum, SymbolFlags.RegularEnumExcludes, /*isBlockScopeContainer*/ false);
                    }
                    break;
                case SyntaxKind.ModuleDeclaration:
                    bindModuleDeclaration(<ModuleDeclaration>node);
                    break;
                case SyntaxKind.ImportEqualsDeclaration:
                case SyntaxKind.NamespaceImport:
                case SyntaxKind.ImportSpecifier:
                case SyntaxKind.ExportSpecifier:
                    bindDeclaration(<Declaration>node, SymbolFlags.Alias, SymbolFlags.AliasExcludes, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.ImportClause:
                    if ((<ImportClause>node).name) {
                        bindDeclaration(<Declaration>node, SymbolFlags.Alias, SymbolFlags.AliasExcludes, /*isBlockScopeContainer*/ false);
                    }
                    else {
                        bindChildren(node, 0, /*isBlockScopeContainer*/ false);
                    }
                    break;
                case SyntaxKind.ExportDeclaration:
                    if (!(<ExportDeclaration>node).exportClause) {
                        // All export * declarations are collected in an __export symbol
                        declareSymbol(container.symbol.exports, container.symbol, <Declaration>node, SymbolFlags.ExportStar, 0);
                    }
                    bindChildren(node, 0, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.ExportAssignment:
                    if ((<ExportAssignment>node).expression.kind === SyntaxKind.Identifier) {
                        // An export default clause with an identifier exports all meanings of that identifier
                        declareSymbol(container.symbol.exports, container.symbol, <Declaration>node, SymbolFlags.Alias, SymbolFlags.PropertyExcludes | SymbolFlags.AliasExcludes);
                    }
                    else {
                        // An export default clause with an expression exports a value
                        declareSymbol(container.symbol.exports, container.symbol, <Declaration>node, SymbolFlags.Property, SymbolFlags.PropertyExcludes | SymbolFlags.AliasExcludes);
                    }
                    bindChildren(node, 0, /*isBlockScopeContainer*/ false);
                    break;
                case SyntaxKind.SourceFile:
                    setExportContextFlag(<SourceFile>node);
                    if (isExternalModule(<SourceFile>node)) {
                        bindAnonymousDeclaration(<SourceFile>node, SymbolFlags.ValueModule, '"' + removeFileExtension((<SourceFile>node).fileName) + '"', /*isBlockScopeContainer*/ true);
                        break;
                    }
                case SyntaxKind.Block:
                    // do not treat function block a block-scope container
                    // all block-scope locals that reside in this block should go to the function locals.
                    // Otherwise this won't be considered as redeclaration of a block scoped local:
                    // function foo() {
                    //  let x;
                    //  let x;
                    // }
                    // 'let x' will be placed into the function locals and 'let x' - into the locals of the block
                    bindChildren(node, 0, /*isBlockScopeContainer*/ !isFunctionLike(node.parent));
                    break;
                case SyntaxKind.CatchClause:
                case SyntaxKind.ForStatement:
                case SyntaxKind.ForInStatement:
                case SyntaxKind.ForOfStatement:
                case SyntaxKind.CaseBlock:
                    bindChildren(node, 0, /*isBlockScopeContainer*/ true);
                    break;
                default:
                    let saveParent = parent;
                    parent = node;
                    forEachChild(node, bind);
                    parent = saveParent;
            }
        }

        function bindParameter(node: ParameterDeclaration) {
            if (isBindingPattern(node.name)) {
                bindAnonymousDeclaration(node, SymbolFlags.FunctionScopedVariable, getDestructuringParameterName(node), /*isBlockScopeContainer*/ false);
            }
            else {
                bindDeclaration(node, SymbolFlags.FunctionScopedVariable, SymbolFlags.ParameterExcludes, /*isBlockScopeContainer*/ false);
            }

            // If this is a property-parameter, then also declare the property symbol into the 
            // containing class.
            if (node.flags & NodeFlags.AccessibilityModifier &&
                node.parent.kind === SyntaxKind.Constructor &&
                (node.parent.parent.kind === SyntaxKind.ClassDeclaration || node.parent.parent.kind === SyntaxKind.ClassExpression)) {

                let classDeclaration = <ClassLikeDeclaration>node.parent.parent;
                declareSymbol(classDeclaration.symbol.members, classDeclaration.symbol, node, SymbolFlags.Property, SymbolFlags.PropertyExcludes);
            }
        }

        function bindPropertyOrMethodOrAccessor(node: Declaration, symbolKind: SymbolFlags, symbolExcludes: SymbolFlags, isBlockScopeContainer: boolean) {
            if (hasDynamicName(node)) {
                bindAnonymousDeclaration(node, symbolKind, "__computed", isBlockScopeContainer);
            }
            else {
                bindDeclaration(node, symbolKind, symbolExcludes, isBlockScopeContainer);
            }
        }
    }
}
