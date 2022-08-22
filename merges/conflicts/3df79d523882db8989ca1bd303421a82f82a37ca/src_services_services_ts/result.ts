/// <reference path="..\compiler\program.ts"/>
/// <reference path="..\compiler\commandLineParser.ts"/>

/// <reference path='types.ts' />
/// <reference path='utilities.ts' />
/// <reference path='breakpoints.ts' />
/// <reference path='classifier.ts' />
/// <reference path='completions.ts' />
/// <reference path='documentHighlights.ts' />
/// <reference path='documentRegistry.ts' />
/// <reference path='findAllReferences.ts' />
/// <reference path='goToDefinition.ts' />
/// <reference path='jsDoc.ts' />
/// <reference path='jsTyping.ts' />
/// <reference path='navigateTo.ts' />
/// <reference path='navigationBar.ts' />
/// <reference path='outliningElementsCollector.ts' />
/// <reference path='patternMatcher.ts' />
/// <reference path='preProcess.ts' />
/// <reference path='rename.ts' />
/// <reference path='signatureHelp.ts' />
/// <reference path='symbolDisplay.ts' />
/// <reference path='transpile.ts' />
/// <reference path='formatting\formatting.ts' />
/// <reference path='formatting\smartIndenter.ts' />
/// <reference path='codefixes\references.ts' />

namespace ts {
    /** The version of the language service API */
    export const servicesVersion = "0.5";

    function createNode(kind: SyntaxKind, pos: number, end: number, parent?: Node): NodeObject | TokenObject | IdentifierObject {
        const node = kind >= SyntaxKind.FirstNode ? new NodeObject(kind, pos, end) :
            kind === SyntaxKind.Identifier ? new IdentifierObject(kind, pos, end) :
                new TokenObject(kind, pos, end);
        node.parent = parent;
        return node;
    }

    class NodeObject implements Node {
        public kind: SyntaxKind;
        public pos: number;
        public end: number;
        public flags: NodeFlags;
        public parent: Node;
        public jsDocComments: JSDocComment[];
        public original: Node;
        public transformFlags: TransformFlags;
        public excludeTransformFlags: TransformFlags;
        private _children: Node[];

        constructor(kind: SyntaxKind, pos: number, end: number) {
            this.pos = pos;
            this.end = end;
            this.flags = NodeFlags.None;
            this.transformFlags = undefined;
            this.excludeTransformFlags = undefined;
            this.parent = undefined;
            this.kind = kind;
        }

        public getSourceFile(): SourceFile {
            return getSourceFileOfNode(this);
        }

        public getStart(sourceFile?: SourceFile, includeJsDocComment?: boolean): number {
            return getTokenPosOfNode(this, sourceFile, includeJsDocComment);
        }

        public getFullStart(): number {
            return this.pos;
        }

        public getEnd(): number {
            return this.end;
        }

        public getWidth(sourceFile?: SourceFile): number {
            return this.getEnd() - this.getStart(sourceFile);
        }

        public getFullWidth(): number {
            return this.end - this.pos;
        }

        public getLeadingTriviaWidth(sourceFile?: SourceFile): number {
            return this.getStart(sourceFile) - this.pos;
        }

        public getFullText(sourceFile?: SourceFile): string {
            return (sourceFile || this.getSourceFile()).text.substring(this.pos, this.end);
        }

        public getText(sourceFile?: SourceFile): string {
            if (!sourceFile) {
                sourceFile = this.getSourceFile();
            }
            return sourceFile.text.substring(this.getStart(sourceFile), this.getEnd());
        }

        private addSyntheticNodes(nodes: Node[], pos: number, end: number, useJSDocScanner?: boolean): number {
            scanner.setTextPos(pos);
            while (pos < end) {
                const token = useJSDocScanner ? scanner.scanJSDocToken() : scanner.scan();
                const textPos = scanner.getTextPos();
                if (textPos <= end) {
                    nodes.push(createNode(token, pos, textPos, this));
                }
                pos = textPos;
            }
            return pos;
        }

        private createSyntaxList(nodes: NodeArray<Node>): Node {
            const list = <NodeObject>createNode(SyntaxKind.SyntaxList, nodes.pos, nodes.end, this);
            list._children = [];
            let pos = nodes.pos;

            for (const node of nodes) {
                if (pos < node.pos) {
                    pos = this.addSyntheticNodes(list._children, pos, node.pos);
                }
                list._children.push(node);
                pos = node.end;
            }
            if (pos < nodes.end) {
                this.addSyntheticNodes(list._children, pos, nodes.end);
            }
            return list;
        }

        private createChildren(sourceFile?: SourceFile) {
            let children: Node[];
            if (this.kind >= SyntaxKind.FirstNode) {
                scanner.setText((sourceFile || this.getSourceFile()).text);
                children = [];
                let pos = this.pos;
                const useJSDocScanner = this.kind >= SyntaxKind.FirstJSDocTagNode && this.kind <= SyntaxKind.LastJSDocTagNode;
                const processNode = (node: Node) => {
                    const isJSDocTagNode = isJSDocTag(node);
                    if (!isJSDocTagNode && pos < node.pos) {
                        pos = this.addSyntheticNodes(children, pos, node.pos, useJSDocScanner);
                    }
                    children.push(node);
                    if (!isJSDocTagNode) {
                        pos = node.end;
                    }
                };
                const processNodes = (nodes: NodeArray<Node>) => {
                    if (pos < nodes.pos) {
                        pos = this.addSyntheticNodes(children, pos, nodes.pos, useJSDocScanner);
                    }
                    children.push(this.createSyntaxList(<NodeArray<Node>>nodes));
                    pos = nodes.end;
                };
                // jsDocComments need to be the first children
                if (this.jsDocComments) {
                    for (const jsDocComment of this.jsDocComments) {
                        processNode(jsDocComment);
                    }
                }
                // For syntactic classifications, all trivia are classcified together, including jsdoc comments.
                // For that to work, the jsdoc comments should still be the leading trivia of the first child.
                // Restoring the scanner position ensures that.
                pos = this.pos;
                forEachChild(this, processNode, processNodes);
                if (pos < this.end) {
                    this.addSyntheticNodes(children, pos, this.end);
                }
                scanner.setText(undefined);
            }
            this._children = children || emptyArray;
        }

        public getChildCount(sourceFile?: SourceFile): number {
            if (!this._children) this.createChildren(sourceFile);
            return this._children.length;
        }

        public getChildAt(index: number, sourceFile?: SourceFile): Node {
            if (!this._children) this.createChildren(sourceFile);
            return this._children[index];
        }

        public getChildren(sourceFile?: SourceFile): Node[] {
            if (!this._children) this.createChildren(sourceFile);
            return this._children;
        }

        public getFirstToken(sourceFile?: SourceFile): Node {
            const children = this.getChildren(sourceFile);
            if (!children.length) {
                return undefined;
            }

            const child = children[0];

            return child.kind < SyntaxKind.FirstNode ? child : child.getFirstToken(sourceFile);
        }

        public getLastToken(sourceFile?: SourceFile): Node {
            const children = this.getChildren(sourceFile);

            const child = lastOrUndefined(children);
            if (!child) {
                return undefined;
            }

            return child.kind < SyntaxKind.FirstNode ? child : child.getLastToken(sourceFile);
        }
    }

    class TokenOrIdentifierObject implements Token {
        public kind: SyntaxKind;
        public pos: number;
        public end: number;
        public flags: NodeFlags;
        public parent: Node;
        public jsDocComments: JSDocComment[];
        public __tokenTag: any;

        constructor(pos: number, end: number) {
            // Set properties in same order as NodeObject
            this.pos = pos;
            this.end = end;
            this.flags = NodeFlags.None;
            this.parent = undefined;
        }

        public getSourceFile(): SourceFile {
            return getSourceFileOfNode(this);
        }

        public getStart(sourceFile?: SourceFile, includeJsDocComment?: boolean): number {
            return getTokenPosOfNode(this, sourceFile, includeJsDocComment);
        }

        public getFullStart(): number {
            return this.pos;
        }

        public getEnd(): number {
            return this.end;
        }

        public getWidth(sourceFile?: SourceFile): number {
            return this.getEnd() - this.getStart(sourceFile);
        }

        public getFullWidth(): number {
            return this.end - this.pos;
        }

        public getLeadingTriviaWidth(sourceFile?: SourceFile): number {
            return this.getStart(sourceFile) - this.pos;
        }

        public getFullText(sourceFile?: SourceFile): string {
            return (sourceFile || this.getSourceFile()).text.substring(this.pos, this.end);
        }

        public getText(sourceFile?: SourceFile): string {
            return (sourceFile || this.getSourceFile()).text.substring(this.getStart(), this.getEnd());
        }

        public getChildCount(sourceFile?: SourceFile): number {
            return 0;
        }

        public getChildAt(index: number, sourceFile?: SourceFile): Node {
            return undefined;
        }

        public getChildren(sourceFile?: SourceFile): Node[] {
            return emptyArray;
        }

        public getFirstToken(sourceFile?: SourceFile): Node {
            return undefined;
        }

        public getLastToken(sourceFile?: SourceFile): Node {
            return undefined;
        }
    }

    class SymbolObject implements Symbol {
        flags: SymbolFlags;
        name: string;
        declarations: Declaration[];

        // Undefined is used to indicate the value has not been computed. If, after computing, the
        // symbol has no doc comment, then the empty string will be returned.
        documentationComment: SymbolDisplayPart[];

        constructor(flags: SymbolFlags, name: string) {
            this.flags = flags;
            this.name = name;
        }

        getFlags(): SymbolFlags {
            return this.flags;
        }

        getName(): string {
            return this.name;
        }

        getDeclarations(): Declaration[] {
            return this.declarations;
        }

        getDocumentationComment(): SymbolDisplayPart[] {
            if (this.documentationComment === undefined) {
                this.documentationComment = JsDoc.getJsDocCommentsFromDeclarations(this.declarations, this.name, !(this.flags & SymbolFlags.Property));
            }

            return this.documentationComment;
        }
    }

    class TokenObject extends TokenOrIdentifierObject {
        public kind: SyntaxKind;
        constructor(kind: SyntaxKind, pos: number, end: number) {
            super(pos, end);
            this.kind = kind;
        }
    }

    class IdentifierObject extends TokenOrIdentifierObject {
        constructor(kind: SyntaxKind, pos: number, end: number) {
            super(pos, end);
        }
    }
    IdentifierObject.prototype.kind = SyntaxKind.Identifier;

    class TypeObject implements Type {
        checker: TypeChecker;
        flags: TypeFlags;
        id: number;
        symbol: Symbol;
        constructor(checker: TypeChecker, flags: TypeFlags) {
            this.checker = checker;
            this.flags = flags;
        }
        getFlags(): TypeFlags {
            return this.flags;
        }
        getSymbol(): Symbol {
            return this.symbol;
        }
        getProperties(): Symbol[] {
            return this.checker.getPropertiesOfType(this);
        }
        getProperty(propertyName: string): Symbol {
            return this.checker.getPropertyOfType(this, propertyName);
        }
        getApparentProperties(): Symbol[] {
            return this.checker.getAugmentedPropertiesOfType(this);
        }
        getCallSignatures(): Signature[] {
            return this.checker.getSignaturesOfType(this, SignatureKind.Call);
        }
        getConstructSignatures(): Signature[] {
            return this.checker.getSignaturesOfType(this, SignatureKind.Construct);
        }
        getStringIndexType(): Type {
            return this.checker.getIndexTypeOfType(this, IndexKind.String);
        }
        getNumberIndexType(): Type {
            return this.checker.getIndexTypeOfType(this, IndexKind.Number);
        }
        getBaseTypes(): ObjectType[] {
            return this.flags & (TypeFlags.Class | TypeFlags.Interface)
                ? this.checker.getBaseTypes(<InterfaceType><Type>this)
                : undefined;
        }
        getNonNullableType(): Type {
            return this.checker.getNonNullableType(this);
        }
    }

    class SignatureObject implements Signature {
        checker: TypeChecker;
        declaration: SignatureDeclaration;
        typeParameters: TypeParameter[];
        parameters: Symbol[];
        thisParameter: Symbol;
        resolvedReturnType: Type;
        minArgumentCount: number;
        hasRestParameter: boolean;
        hasLiteralTypes: boolean;

        // Undefined is used to indicate the value has not been computed. If, after computing, the
        // symbol has no doc comment, then the empty string will be returned.
        documentationComment: SymbolDisplayPart[];

        constructor(checker: TypeChecker) {
            this.checker = checker;
        }
        getDeclaration(): SignatureDeclaration {
            return this.declaration;
        }
        getTypeParameters(): Type[] {
            return this.typeParameters;
        }
        getParameters(): Symbol[] {
            return this.parameters;
        }
        getReturnType(): Type {
            return this.checker.getReturnTypeOfSignature(this);
        }

        getDocumentationComment(): SymbolDisplayPart[] {
            if (this.documentationComment === undefined) {
                this.documentationComment = this.declaration ? JsDoc.getJsDocCommentsFromDeclarations(
                    [this.declaration],
                    /*name*/ undefined,
                    /*canUseParsedParamTagComments*/ false) : [];
            }

            return this.documentationComment;
        }
    }

    class SourceFileObject extends NodeObject implements SourceFile {
        public _declarationBrand: any;
        public fileName: string;
        public path: Path;
        public text: string;
        public scriptSnapshot: IScriptSnapshot;
        public lineMap: number[];

        public statements: NodeArray<Statement>;
        public endOfFileToken: Node;

        public amdDependencies: { name: string; path: string }[];
        public moduleName: string;
        public referencedFiles: FileReference[];
        public typeReferenceDirectives: FileReference[];

        public syntacticDiagnostics: Diagnostic[];
        public referenceDiagnostics: Diagnostic[];
        public parseDiagnostics: Diagnostic[];
        public bindDiagnostics: Diagnostic[];

        public isDeclarationFile: boolean;
        public isDefaultLib: boolean;
        public hasNoDefaultLib: boolean;
        public externalModuleIndicator: Node; // The first node that causes this file to be an external module
        public commonJsModuleIndicator: Node; // The first node that causes this file to be a CommonJS module
        public nodeCount: number;
        public identifierCount: number;
        public symbolCount: number;
        public version: string;
        public scriptKind: ScriptKind;
        public languageVersion: ScriptTarget;
        public languageVariant: LanguageVariant;
        public identifiers: Map<string>;
        public nameTable: Map<number>;
        public resolvedModules: Map<ResolvedModule>;
        public resolvedTypeReferenceDirectiveNames: Map<ResolvedTypeReferenceDirective>;
        public imports: LiteralExpression[];
        public moduleAugmentations: LiteralExpression[];
        private namedDeclarations: Map<Declaration[]>;

        constructor(kind: SyntaxKind, pos: number, end: number) {
            super(kind, pos, end);
        }

        public update(newText: string, textChangeRange: TextChangeRange): SourceFile {
            return updateSourceFile(this, newText, textChangeRange);
        }

        public getLineAndCharacterOfPosition(position: number): LineAndCharacter {
            return ts.getLineAndCharacterOfPosition(this, position);
        }

        public getLineStarts(): number[] {
            return getLineStarts(this);
        }

        public getPositionOfLineAndCharacter(line: number, character: number): number {
            return ts.getPositionOfLineAndCharacter(this, line, character);
        }

        public getNamedDeclarations(): Map<Declaration[]> {
            if (!this.namedDeclarations) {
                this.namedDeclarations = this.computeNamedDeclarations();
            }

            return this.namedDeclarations;
        }

        private computeNamedDeclarations(): Map<Declaration[]> {
            const result = createMap<Declaration[]>();

            forEachChild(this, visit);

            return result;

            function addDeclaration(declaration: Declaration) {
                const name = getDeclarationName(declaration);
                if (name) {
                    multiMapAdd(result, name, declaration);
                }
            }

            function getDeclarations(name: string) {
                return result[name] || (result[name] = []);
            }

            function getDeclarationName(declaration: Declaration) {
                if (declaration.name) {
                    const result = getTextOfIdentifierOrLiteral(declaration.name);
                    if (result !== undefined) {
                        return result;
                    }

                    if (declaration.name.kind === SyntaxKind.ComputedPropertyName) {
                        const expr = (<ComputedPropertyName>declaration.name).expression;
                        if (expr.kind === SyntaxKind.PropertyAccessExpression) {
                            return (<PropertyAccessExpression>expr).name.text;
                        }

                        return getTextOfIdentifierOrLiteral(expr);
                    }
                }

                return undefined;
            }

            function getTextOfIdentifierOrLiteral(node: Node) {
                if (node) {
                    if (node.kind === SyntaxKind.Identifier ||
                        node.kind === SyntaxKind.StringLiteral ||
                        node.kind === SyntaxKind.NumericLiteral) {

                        return (<Identifier | LiteralExpression>node).text;
                    }
                }

                return undefined;
            }

            function visit(node: Node): void {
                switch (node.kind) {
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.FunctionExpression:
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                        const functionDeclaration = <FunctionLikeDeclaration>node;
                        const declarationName = getDeclarationName(functionDeclaration);

                        if (declarationName) {
                            const declarations = getDeclarations(declarationName);
                            const lastDeclaration = lastOrUndefined(declarations);

                            // Check whether this declaration belongs to an "overload group".
                            if (lastDeclaration && functionDeclaration.parent === lastDeclaration.parent && functionDeclaration.symbol === lastDeclaration.symbol) {
                                // Overwrite the last declaration if it was an overload
                                // and this one is an implementation.
                                if (functionDeclaration.body && !(<FunctionLikeDeclaration>lastDeclaration).body) {
                                    declarations[declarations.length - 1] = functionDeclaration;
                                }
                            }
                            else {
                                declarations.push(functionDeclaration);
                            }

                            forEachChild(node, visit);
                        }
                        break;

                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.ClassExpression:
                    case SyntaxKind.InterfaceDeclaration:
                    case SyntaxKind.TypeAliasDeclaration:
                    case SyntaxKind.EnumDeclaration:
                    case SyntaxKind.ModuleDeclaration:
                    case SyntaxKind.ImportEqualsDeclaration:
                    case SyntaxKind.ExportSpecifier:
                    case SyntaxKind.ImportSpecifier:
                    case SyntaxKind.ImportEqualsDeclaration:
                    case SyntaxKind.ImportClause:
                    case SyntaxKind.NamespaceImport:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                    case SyntaxKind.TypeLiteral:
                        addDeclaration(<Declaration>node);
                        forEachChild(node, visit);
                        break;

                    case SyntaxKind.Parameter:
                        // Only consider parameter properties
                        if (!hasModifier(node, ModifierFlags.ParameterPropertyModifier)) {
                            break;
                        }
                    // fall through
                    case SyntaxKind.VariableDeclaration:
                    case SyntaxKind.BindingElement: {
                        const decl = <VariableDeclaration>node;
                        if (isBindingPattern(decl.name)) {
                            forEachChild(decl.name, visit);
                            break;
                        }
                        if (decl.initializer)
                            visit(decl.initializer);
                    }
                    case SyntaxKind.EnumMember:
                    case SyntaxKind.PropertyDeclaration:
                    case SyntaxKind.PropertySignature:
                        addDeclaration(<Declaration>node);
                        break;

                    case SyntaxKind.ExportDeclaration:
                        // Handle named exports case e.g.:
                        //    export {a, b as B} from "mod";
                        if ((<ExportDeclaration>node).exportClause) {
                            forEach((<ExportDeclaration>node).exportClause.elements, visit);
                        }
                        break;

                    case SyntaxKind.ImportDeclaration:
                        const importClause = (<ImportDeclaration>node).importClause;
                        if (importClause) {
                            // Handle default import case e.g.:
                            //    import d from "mod";
                            if (importClause.name) {
                                addDeclaration(importClause);
                            }

                            // Handle named bindings in imports e.g.:
                            //    import * as NS from "mod";
                            //    import {a, b as B} from "mod";
                            if (importClause.namedBindings) {
                                if (importClause.namedBindings.kind === SyntaxKind.NamespaceImport) {
                                    addDeclaration(<NamespaceImport>importClause.namedBindings);
                                }
                                else {
                                    forEach((<NamedImports>importClause.namedBindings).elements, visit);
                                }
                            }
                        }
                        break;

                    default:
                        forEachChild(node, visit);
                }
            }
        }
    }

    function getServicesObjectAllocator(): ObjectAllocator {
        return {
            getNodeConstructor: () => NodeObject,
            getTokenConstructor: () => TokenObject,
            getIdentifierConstructor: () => IdentifierObject,
            getSourceFileConstructor: () => SourceFileObject,
            getSymbolConstructor: () => SymbolObject,
            getTypeConstructor: () => TypeObject,
            getSignatureConstructor: () => SignatureObject,
        };
    }

    /// Language Service

    // Information about a specific host file.
    interface HostFileInformation {
        hostFileName: string;
        version: string;
        scriptSnapshot: IScriptSnapshot;
        scriptKind: ScriptKind;
    }

    export interface DisplayPartsSymbolWriter extends SymbolWriter {
        displayParts(): SymbolDisplayPart[];
    }

    export function displayPartsToString(displayParts: SymbolDisplayPart[]) {
        if (displayParts) {
            return map(displayParts, displayPart => displayPart.text).join("");
        }

        return "";
    }

    export function getDefaultCompilerOptions(): CompilerOptions {
        // Always default to "ScriptTarget.ES5" for the language service
        return {
            target: ScriptTarget.ES5,
            jsx: JsxEmit.Preserve
        };
    }

    // Cache host information about script should be refreshed
    // at each language service public entry point, since we don't know when
    // set of scripts handled by the host changes.
    class HostCache {
        private fileNameToEntry: FileMap<HostFileInformation>;
        private _compilationSettings: CompilerOptions;
        private currentDirectory: string;

        constructor(private host: LanguageServiceHost, private getCanonicalFileName: (fileName: string) => string) {
            // script id => script index
            this.currentDirectory = host.getCurrentDirectory();
            this.fileNameToEntry = createFileMap<HostFileInformation>();

            // Initialize the list with the root file names
            const rootFileNames = host.getScriptFileNames();
            for (const fileName of rootFileNames) {
                this.createEntry(fileName, toPath(fileName, this.currentDirectory, getCanonicalFileName));
            }

            // store the compilation settings
            this._compilationSettings = host.getCompilationSettings() || getDefaultCompilerOptions();
        }

        public compilationSettings() {
            return this._compilationSettings;
        }

        private createEntry(fileName: string, path: Path) {
            let entry: HostFileInformation;
            const scriptSnapshot = this.host.getScriptSnapshot(fileName);
            if (scriptSnapshot) {
                entry = {
                    hostFileName: fileName,
                    version: this.host.getScriptVersion(fileName),
                    scriptSnapshot: scriptSnapshot,
                    scriptKind: getScriptKind(fileName, this.host)
                };
            }

            this.fileNameToEntry.set(path, entry);
            return entry;
        }

<<<<<<< HEAD
        getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];
        getTypeDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];

        getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[];
        findReferences(fileName: string, position: number): ReferencedSymbol[];
        getDocumentHighlights(fileName: string, position: number, filesToSearch: string[]): DocumentHighlights[];

        /** @deprecated */
        getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[];

        getNavigateToItems(searchValue: string, maxResultCount?: number): NavigateToItem[];
        getNavigationBarItems(fileName: string): NavigationBarItem[];

        getOutliningSpans(fileName: string): OutliningSpan[];
        getTodoComments(fileName: string, descriptors: TodoCommentDescriptor[]): TodoComment[];
        getBraceMatchingAtPosition(fileName: string, position: number): TextSpan[];
        getIndentationAtPosition(fileName: string, position: number, options: EditorOptions): number;

        getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions): TextChange[];
        getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions): TextChange[];
        getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextChange[];

        getDocCommentTemplateAtPosition(fileName: string, position: number): TextInsertion;

        isValidBraceCompletionAtPosition(fileName: string, position: number, openingBrace: number): boolean;

        getCodeFixesAtPosition(fileName: string, start: number, end: number, errorCodes: string[]): CodeAction[];

        getEmitOutput(fileName: string): EmitOutput;

        getProgram(): Program;

        /* @internal */ getNonBoundSourceFile(fileName: string): SourceFile;

        dispose(): void;
    }

    export interface Classifications {
        spans: number[];
        endOfLineState: EndOfLineState;
    }

    export interface ClassifiedSpan {
        textSpan: TextSpan;
        classificationType: string; // ClassificationTypeNames
    }

    export interface NavigationBarItem {
        text: string;
        kind: string;
        kindModifiers: string;
        spans: TextSpan[];
        childItems: NavigationBarItem[];
        indent: number;
        bolded: boolean;
        grayed: boolean;
    }

    export interface TodoCommentDescriptor {
        text: string;
        priority: number;
    }

    export interface TodoComment {
        descriptor: TodoCommentDescriptor;
        message: string;
        position: number;
    }

    export class TextChange {
        span: TextSpan;
        newText: string;
    }

    export interface FileTextChanges {
        fileName: string;
        textChanges: TextChange[];
    }

    export interface CodeAction {
        /** Description of the code action to display in the UI of the editor */
        description: string;
        /** Text changes to apply to each file as part of the code action */
        changes: FileTextChanges[];
    }

    export interface TextInsertion {
        newText: string;
        /** The position in newText the caret should point to after the insertion. */
        caretOffset: number;
    }

    export interface RenameLocation {
        textSpan: TextSpan;
        fileName: string;
    }

    export interface ReferenceEntry {
        textSpan: TextSpan;
        fileName: string;
        isWriteAccess: boolean;
        isDefinition: boolean;
    }

    export interface DocumentHighlights {
        fileName: string;
        highlightSpans: HighlightSpan[];
    }

    export namespace HighlightSpanKind {
        export const none = "none";
        export const definition = "definition";
        export const reference = "reference";
        export const writtenReference = "writtenReference";
    }

    export interface HighlightSpan {
        fileName?: string;
        textSpan: TextSpan;
        kind: string;
    }

    export interface NavigateToItem {
        name: string;
        kind: string;
        kindModifiers: string;
        matchKind: string;
        isCaseSensitive: boolean;
        fileName: string;
        textSpan: TextSpan;
        containerName: string;
        containerKind: string;
    }

    export interface EditorOptions {
        BaseIndentSize?: number;
        IndentSize: number;
        TabSize: number;
        NewLineCharacter: string;
        ConvertTabsToSpaces: boolean;
        IndentStyle: IndentStyle;
    }

    export enum IndentStyle {
        None = 0,
        Block = 1,
        Smart = 2,
    }

    export interface FormatCodeOptions extends EditorOptions {
        InsertSpaceAfterCommaDelimiter: boolean;
        InsertSpaceAfterSemicolonInForStatements: boolean;
        InsertSpaceBeforeAndAfterBinaryOperators: boolean;
        InsertSpaceAfterKeywordsInControlFlowStatements: boolean;
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces?: boolean;
        PlaceOpenBraceOnNewLineForFunctions: boolean;
        PlaceOpenBraceOnNewLineForControlBlocks: boolean;
        [s: string]: boolean | number | string | undefined;
    }

    export interface DefinitionInfo {
        fileName: string;
        textSpan: TextSpan;
        kind: string;
        name: string;
        containerKind: string;
        containerName: string;
    }

    export interface ReferencedSymbol {
        definition: DefinitionInfo;
        references: ReferenceEntry[];
    }

    export enum SymbolDisplayPartKind {
        aliasName,
        className,
        enumName,
        fieldName,
        interfaceName,
        keyword,
        lineBreak,
        numericLiteral,
        stringLiteral,
        localName,
        methodName,
        moduleName,
        operator,
        parameterName,
        propertyName,
        punctuation,
        space,
        text,
        typeParameterName,
        enumMemberName,
        functionName,
        regularExpressionLiteral,
    }

    export interface SymbolDisplayPart {
        text: string;
        kind: string;
    }

    export interface QuickInfo {
        kind: string;
        kindModifiers: string;
        textSpan: TextSpan;
        displayParts: SymbolDisplayPart[];
        documentation: SymbolDisplayPart[];
    }

    export interface RenameInfo {
        canRename: boolean;
        localizedErrorMessage: string;
        displayName: string;
        fullDisplayName: string;
        kind: string;
        kindModifiers: string;
        triggerSpan: TextSpan;
    }

    export interface SignatureHelpParameter {
        name: string;
        documentation: SymbolDisplayPart[];
        displayParts: SymbolDisplayPart[];
        isOptional: boolean;
    }

    /**
     * Represents a single signature to show in signature help.
     * The id is used for subsequent calls into the language service to ask questions about the
     * signature help item in the context of any documents that have been updated.  i.e. after
     * an edit has happened, while signature help is still active, the host can ask important
     * questions like 'what parameter is the user currently contained within?'.
     */
    export interface SignatureHelpItem {
        isVariadic: boolean;
        prefixDisplayParts: SymbolDisplayPart[];
        suffixDisplayParts: SymbolDisplayPart[];
        separatorDisplayParts: SymbolDisplayPart[];
        parameters: SignatureHelpParameter[];
        documentation: SymbolDisplayPart[];
    }

    /**
     * Represents a set of signature help items, and the preferred item that should be selected.
     */
    export interface SignatureHelpItems {
        items: SignatureHelpItem[];
        applicableSpan: TextSpan;
        selectedItemIndex: number;
        argumentIndex: number;
        argumentCount: number;
    }

    export interface CompletionInfo {
        isMemberCompletion: boolean;
        isNewIdentifierLocation: boolean;  // true when the current location also allows for a new identifier
        entries: CompletionEntry[];
    }

    export interface CompletionEntry {
        name: string;
        kind: string;            // see ScriptElementKind
        kindModifiers: string;   // see ScriptElementKindModifier, comma separated
        sortText: string;
    }

    export interface CompletionEntryDetails {
        name: string;
        kind: string;            // see ScriptElementKind
        kindModifiers: string;   // see ScriptElementKindModifier, comma separated
        displayParts: SymbolDisplayPart[];
        documentation: SymbolDisplayPart[];
    }

    export interface OutliningSpan {
        /** The span of the document to actually collapse. */
        textSpan: TextSpan;

        /** The span of the document to display when the user hovers over the collapsed span. */
        hintSpan: TextSpan;

        /** The text to display in the editor for the collapsed region. */
        bannerText: string;

        /**
          * Whether or not this region should be automatically collapsed when
          * the 'Collapse to Definitions' command is invoked.
          */
        autoCollapse: boolean;
    }

    export interface EmitOutput {
        outputFiles: OutputFile[];
        emitSkipped: boolean;
    }

    export const enum OutputFileType {
        JavaScript,
        SourceMap,
        Declaration
    }

    export interface OutputFile {
        name: string;
        writeByteOrderMark: boolean;
        text: string;
    }

    export const enum EndOfLineState {
        None,
        InMultiLineCommentTrivia,
        InSingleQuoteStringLiteral,
        InDoubleQuoteStringLiteral,
        InTemplateHeadOrNoSubstitutionTemplate,
        InTemplateMiddleOrTail,
        InTemplateSubstitutionPosition,
    }

    export enum TokenClass {
        Punctuation,
        Keyword,
        Operator,
        Comment,
        Whitespace,
        Identifier,
        NumberLiteral,
        StringLiteral,
        RegExpLiteral,
    }

    export interface ClassificationResult {
        finalLexState: EndOfLineState;
        entries: ClassificationInfo[];
    }

    export interface ClassificationInfo {
        length: number;
        classification: TokenClass;
    }

    export interface Classifier {
        /**
         * Gives lexical classifications of tokens on a line without any syntactic context.
         * For instance, a token consisting of the text 'string' can be either an identifier
         * named 'string' or the keyword 'string', however, because this classifier is not aware,
         * it relies on certain heuristics to give acceptable results. For classifications where
         * speed trumps accuracy, this function is preferable; however, for true accuracy, the
         * syntactic classifier is ideal. In fact, in certain editing scenarios, combining the
         * lexical, syntactic, and semantic classifiers may issue the best user experience.
         *
         * @param text                      The text of a line to classify.
         * @param lexState                  The state of the lexical classifier at the end of the previous line.
         * @param syntacticClassifierAbsent Whether the client is *not* using a syntactic classifier.
         *                                  If there is no syntactic classifier (syntacticClassifierAbsent=true),
         *                                  certain heuristics may be used in its place; however, if there is a
         *                                  syntactic classifier (syntacticClassifierAbsent=false), certain
         *                                  classifications which may be incorrectly categorized will be given
         *                                  back as Identifiers in order to allow the syntactic classifier to
         *                                  subsume the classification.
         * @deprecated Use getLexicalClassifications instead.
         */
        getClassificationsForLine(text: string, lexState: EndOfLineState, syntacticClassifierAbsent: boolean): ClassificationResult;
        getEncodedLexicalClassifications(text: string, endOfLineState: EndOfLineState, syntacticClassifierAbsent: boolean): Classifications;
    }

    /**
      * The document registry represents a store of SourceFile objects that can be shared between
      * multiple LanguageService instances. A LanguageService instance holds on the SourceFile (AST)
      * of files in the context.
      * SourceFile objects account for most of the memory usage by the language service. Sharing
      * the same DocumentRegistry instance between different instances of LanguageService allow
      * for more efficient memory utilization since all projects will share at least the library
      * file (lib.d.ts).
      *
      * A more advanced use of the document registry is to serialize sourceFile objects to disk
      * and re-hydrate them when needed.
      *
      * To create a default DocumentRegistry, use createDocumentRegistry to create one, and pass it
      * to all subsequent createLanguageService calls.
      */
    export interface DocumentRegistry {
        /**
          * Request a stored SourceFile with a given fileName and compilationSettings.
          * The first call to acquire will call createLanguageServiceSourceFile to generate
          * the SourceFile if was not found in the registry.
          *
          * @param fileName The name of the file requested
          * @param compilationSettings Some compilation settings like target affects the
          * shape of a the resulting SourceFile. This allows the DocumentRegistry to store
          * multiple copies of the same file for different compilation settings.
          * @parm scriptSnapshot Text of the file. Only used if the file was not found
          * in the registry and a new one was created.
          * @parm version Current version of the file. Only used if the file was not found
          * in the registry and a new one was created.
          */
        acquireDocument(
            fileName: string,
            compilationSettings: CompilerOptions,
            scriptSnapshot: IScriptSnapshot,
            version: string,
            scriptKind?: ScriptKind): SourceFile;

        acquireDocumentWithKey(
            fileName: string,
            path: Path,
            compilationSettings: CompilerOptions,
            key: DocumentRegistryBucketKey,
            scriptSnapshot: IScriptSnapshot,
            version: string,
            scriptKind?: ScriptKind): SourceFile;

        /**
          * Request an updated version of an already existing SourceFile with a given fileName
          * and compilationSettings. The update will in-turn call updateLanguageServiceSourceFile
          * to get an updated SourceFile.
          *
          * @param fileName The name of the file requested
          * @param compilationSettings Some compilation settings like target affects the
          * shape of a the resulting SourceFile. This allows the DocumentRegistry to store
          * multiple copies of the same file for different compilation settings.
          * @param scriptSnapshot Text of the file.
          * @param version Current version of the file.
          */
        updateDocument(
            fileName: string,
            compilationSettings: CompilerOptions,
            scriptSnapshot: IScriptSnapshot,
            version: string,
            scriptKind?: ScriptKind): SourceFile;

        updateDocumentWithKey(
            fileName: string,
            path: Path,
            compilationSettings: CompilerOptions,
            key: DocumentRegistryBucketKey,
            scriptSnapshot: IScriptSnapshot,
            version: string,
            scriptKind?: ScriptKind): SourceFile;

        getKeyForCompilationSettings(settings: CompilerOptions): DocumentRegistryBucketKey;
        /**
          * Informs the DocumentRegistry that a file is not needed any longer.
          *
          * Note: It is not allowed to call release on a SourceFile that was not acquired from
          * this registry originally.
          *
          * @param fileName The name of the file to be released
          * @param compilationSettings The compilation settings used to acquire the file
          */
        releaseDocument(fileName: string, compilationSettings: CompilerOptions): void;

        releaseDocumentWithKey(path: Path, key: DocumentRegistryBucketKey): void;

        reportStats(): string;
    }

    export type DocumentRegistryBucketKey = string & { __bucketKey: any };

    // TODO: move these to enums
    export namespace ScriptElementKind {
        export const unknown = "";
        export const warning = "warning";

        /** predefined type (void) or keyword (class) */
        export const keyword = "keyword";

        /** top level script node */
        export const scriptElement = "script";

        /** module foo {} */
        export const moduleElement = "module";

        /** class X {} */
        export const classElement = "class";

        /** var x = class X {} */
        export const localClassElement = "local class";

        /** interface Y {} */
        export const interfaceElement = "interface";

        /** type T = ... */
        export const typeElement = "type";

        /** enum E */
        export const enumElement = "enum";
        // TODO: GH#9983
        export const enumMemberElement = "const";

        /**
         * Inside module and script only
         * const v = ..
         */
        export const variableElement = "var";

        /** Inside function */
        export const localVariableElement = "local var";

        /**
         * Inside module and script only
         * function f() { }
         */
        export const functionElement = "function";

        /** Inside function */
        export const localFunctionElement = "local function";

        /** class X { [public|private]* foo() {} } */
        export const memberFunctionElement = "method";

        /** class X { [public|private]* [get|set] foo:number; } */
        export const memberGetAccessorElement = "getter";
        export const memberSetAccessorElement = "setter";

        /**
         * class X { [public|private]* foo:number; }
         * interface Y { foo:number; }
         */
        export const memberVariableElement = "property";

        /** class X { constructor() { } } */
        export const constructorImplementationElement = "constructor";

        /** interface Y { ():number; } */
        export const callSignatureElement = "call";

        /** interface Y { []:number; } */
        export const indexSignatureElement = "index";

        /** interface Y { new():Y; } */
        export const constructSignatureElement = "construct";

        /** function foo(*Y*: string) */
        export const parameterElement = "parameter";

        export const typeParameterElement = "type parameter";

        export const primitiveType = "primitive type";

        export const label = "label";

        export const alias = "alias";

        export const constElement = "const";

        export const letElement = "let";
    }

    export namespace ScriptElementKindModifier {
        export const none = "";
        export const publicMemberModifier = "public";
        export const privateMemberModifier = "private";
        export const protectedMemberModifier = "protected";
        export const exportedModifier = "export";
        export const ambientModifier = "declare";
        export const staticModifier = "static";
        export const abstractModifier = "abstract";
    }

    export class ClassificationTypeNames {
        public static comment = "comment";
        public static identifier = "identifier";
        public static keyword = "keyword";
        public static numericLiteral = "number";
        public static operator = "operator";
        public static stringLiteral = "string";
        public static whiteSpace = "whitespace";
        public static text = "text";

        public static punctuation = "punctuation";

        public static className = "class name";
        public static enumName = "enum name";
        public static interfaceName = "interface name";
        public static moduleName = "module name";
        public static typeParameterName = "type parameter name";
        public static typeAliasName = "type alias name";
        public static parameterName = "parameter name";
        public static docCommentTagName = "doc comment tag name";
        public static jsxOpenTagName = "jsx open tag name";
        public static jsxCloseTagName = "jsx close tag name";
        public static jsxSelfClosingTagName = "jsx self closing tag name";
        public static jsxAttribute = "jsx attribute";
        public static jsxText = "jsx text";
        public static jsxAttributeStringLiteralValue = "jsx attribute string literal value";
    }

    export const enum ClassificationType {
        comment = 1,
        identifier = 2,
        keyword = 3,
        numericLiteral = 4,
        operator = 5,
        stringLiteral = 6,
        regularExpressionLiteral = 7,
        whiteSpace = 8,
        text = 9,
        punctuation = 10,
        className = 11,
        enumName = 12,
        interfaceName = 13,
        moduleName = 14,
        typeParameterName = 15,
        typeAliasName = 16,
        parameterName = 17,
        docCommentTagName = 18,
        jsxOpenTagName = 19,
        jsxCloseTagName = 20,
        jsxSelfClosingTagName = 21,
        jsxAttribute = 22,
        jsxText = 23,
        jsxAttributeStringLiteralValue = 24,
    }

    /// Language Service

    // Information about a specific host file.
    interface HostFileInformation {
        hostFileName: string;
        version: string;
        scriptSnapshot: IScriptSnapshot;
        scriptKind: ScriptKind;
    }

    interface DocumentRegistryEntry {
        sourceFile: SourceFile;

        // The number of language services that this source file is referenced in.   When no more
        // language services are referencing the file, then the file can be removed from the
        // registry.
        languageServiceRefCount: number;
        owners: string[];
    }

    export interface DisplayPartsSymbolWriter extends SymbolWriter {
        displayParts(): SymbolDisplayPart[];
    }

    export function displayPartsToString(displayParts: SymbolDisplayPart[]) {
        if (displayParts) {
            return map(displayParts, displayPart => displayPart.text).join("");
        }

        return "";
    }

    function isLocalVariableOrFunction(symbol: Symbol) {
        if (symbol.parent) {
            return false; // This is exported symbol
        }

        return ts.forEach(symbol.declarations, declaration => {
            // Function expressions are local
            if (declaration.kind === SyntaxKind.FunctionExpression) {
                return true;
            }

            if (declaration.kind !== SyntaxKind.VariableDeclaration && declaration.kind !== SyntaxKind.FunctionDeclaration) {
                return false;
            }

            // If the parent is not sourceFile or module block it is local variable
            for (let parent = declaration.parent; !isFunctionBlock(parent); parent = parent.parent) {
                // Reached source file or module block
                if (parent.kind === SyntaxKind.SourceFile || parent.kind === SyntaxKind.ModuleBlock) {
                    return false;
                }
            }

            // parent is in function block
            return true;
        });
    }

    export function getDefaultCompilerOptions(): CompilerOptions {
        // Always default to "ScriptTarget.ES5" for the language service
        return {
            target: ScriptTarget.ES5,
            jsx: JsxEmit.Preserve
        };
    }

    export function getSupportedCodeFixes() {
        return codefix.CodeFixProvider.getSupportedErrorCodes();
    }

    // Cache host information about script Should be refreshed
    // at each language service public entry point, since we don't know when
    // the set of scripts handled by the host changes.
    class HostCache {
        private fileNameToEntry: FileMap<HostFileInformation>;
        private _compilationSettings: CompilerOptions;
        private currentDirectory: string;

        constructor(private host: LanguageServiceHost, private getCanonicalFileName: (fileName: string) => string) {
            // script id => script index
            this.currentDirectory = host.getCurrentDirectory();
            this.fileNameToEntry = createFileMap<HostFileInformation>();

            // Initialize the list with the root file names
            const rootFileNames = host.getScriptFileNames();
            for (const fileName of rootFileNames) {
                this.createEntry(fileName, toPath(fileName, this.currentDirectory, getCanonicalFileName));
            }

            // store the compilation settings
            this._compilationSettings = host.getCompilationSettings() || getDefaultCompilerOptions();
        }

        public compilationSettings() {
            return this._compilationSettings;
        }

        private createEntry(fileName: string, path: Path) {
            let entry: HostFileInformation;
            const scriptSnapshot = this.host.getScriptSnapshot(fileName);
            if (scriptSnapshot) {
                entry = {
                    hostFileName: fileName,
                    version: this.host.getScriptVersion(fileName),
                    scriptSnapshot: scriptSnapshot,
                    scriptKind: getScriptKind(fileName, this.host)
                };
            }

            this.fileNameToEntry.set(path, entry);
            return entry;
        }

=======
>>>>>>> 42515c717dd931efade8febbe29d4ebd3ffb013d
        private getEntry(path: Path): HostFileInformation {
            return this.fileNameToEntry.get(path);
        }

        private contains(path: Path): boolean {
            return this.fileNameToEntry.contains(path);
        }

        public getOrCreateEntry(fileName: string): HostFileInformation {
            const path = toPath(fileName, this.currentDirectory, this.getCanonicalFileName);
            return this.getOrCreateEntryByPath(fileName, path);
        }

        public getOrCreateEntryByPath(fileName: string, path: Path): HostFileInformation {
            return this.contains(path)
                ? this.getEntry(path)
                : this.createEntry(fileName, path);
        }

        public getRootFileNames(): string[] {
            const fileNames: string[] = [];

            this.fileNameToEntry.forEachValue((path, value) => {
                if (value) {
                    fileNames.push(value.hostFileName);
                }
            });

            return fileNames;
        }

        public getVersion(path: Path): string {
            const file = this.getEntry(path);
            return file && file.version;
        }

        public getScriptSnapshot(path: Path): IScriptSnapshot {
            const file = this.getEntry(path);
            return file && file.scriptSnapshot;
        }
    }

    class SyntaxTreeCache {
        // For our syntactic only features, we also keep a cache of the syntax tree for the
        // currently edited file.
        private currentFileName: string;
        private currentFileVersion: string;
        private currentFileScriptSnapshot: IScriptSnapshot;
        private currentSourceFile: SourceFile;

        constructor(private host: LanguageServiceHost) {
        }

        public getCurrentSourceFile(fileName: string): SourceFile {
            const scriptSnapshot = this.host.getScriptSnapshot(fileName);
            if (!scriptSnapshot) {
                // The host does not know about this file.
                throw new Error("Could not find file: '" + fileName + "'.");
            }

            const scriptKind = getScriptKind(fileName, this.host);
            const version = this.host.getScriptVersion(fileName);
            let sourceFile: SourceFile;

            if (this.currentFileName !== fileName) {
                // This is a new file, just parse it
                sourceFile = createLanguageServiceSourceFile(fileName, scriptSnapshot, ScriptTarget.Latest, version, /*setNodeParents*/ true, scriptKind);
            }
            else if (this.currentFileVersion !== version) {
                // This is the same file, just a newer version. Incrementally parse the file.
                const editRange = scriptSnapshot.getChangeRange(this.currentFileScriptSnapshot);
                sourceFile = updateLanguageServiceSourceFile(this.currentSourceFile, scriptSnapshot, version, editRange);
            }

            if (sourceFile) {
                // All done, ensure state is up to date
                this.currentFileVersion = version;
                this.currentFileName = fileName;
                this.currentFileScriptSnapshot = scriptSnapshot;
                this.currentSourceFile = sourceFile;
            }

            return this.currentSourceFile;
        }
    }

    function setSourceFileFields(sourceFile: SourceFile, scriptSnapshot: IScriptSnapshot, version: string) {
        sourceFile.version = version;
        sourceFile.scriptSnapshot = scriptSnapshot;
    }

    export function createLanguageServiceSourceFile(fileName: string, scriptSnapshot: IScriptSnapshot, scriptTarget: ScriptTarget, version: string, setNodeParents: boolean, scriptKind?: ScriptKind): SourceFile {
        const text = scriptSnapshot.getText(0, scriptSnapshot.getLength());
        const sourceFile = createSourceFile(fileName, text, scriptTarget, setNodeParents, scriptKind);
        setSourceFileFields(sourceFile, scriptSnapshot, version);
        return sourceFile;
    }

    export let disableIncrementalParsing = false;

    export function updateLanguageServiceSourceFile(sourceFile: SourceFile, scriptSnapshot: IScriptSnapshot, version: string, textChangeRange: TextChangeRange, aggressiveChecks?: boolean): SourceFile {
        // If we were given a text change range, and our version or open-ness changed, then
        // incrementally parse this file.
        if (textChangeRange) {
            if (version !== sourceFile.version) {
                // Once incremental parsing is ready, then just call into this function.
                if (!disableIncrementalParsing) {
                    let newText: string;

                    // grab the fragment from the beginning of the original text to the beginning of the span
                    const prefix = textChangeRange.span.start !== 0
                        ? sourceFile.text.substr(0, textChangeRange.span.start)
                        : "";

                    // grab the fragment from the end of the span till the end of the original text
                    const suffix = textSpanEnd(textChangeRange.span) !== sourceFile.text.length
                        ? sourceFile.text.substr(textSpanEnd(textChangeRange.span))
                        : "";

                    if (textChangeRange.newLength === 0) {
                        // edit was a deletion - just combine prefix and suffix
                        newText = prefix && suffix ? prefix + suffix : prefix || suffix;
                    }
                    else {
                        // it was actual edit, fetch the fragment of new text that correspond to new span
                        const changedText = scriptSnapshot.getText(textChangeRange.span.start, textChangeRange.span.start + textChangeRange.newLength);
                        // combine prefix, changed text and suffix
                        newText = prefix && suffix
                            ? prefix + changedText + suffix
                            : prefix
                                ? (prefix + changedText)
                                : (changedText + suffix);
                    }

                    const newSourceFile = updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks);
                    setSourceFileFields(newSourceFile, scriptSnapshot, version);
                    // after incremental parsing nameTable might not be up-to-date
                    // drop it so it can be lazily recreated later
                    newSourceFile.nameTable = undefined;

                    // dispose all resources held by old script snapshot
                    if (sourceFile !== newSourceFile && sourceFile.scriptSnapshot) {
                        if (sourceFile.scriptSnapshot.dispose) {
                            sourceFile.scriptSnapshot.dispose();
                        }

                        sourceFile.scriptSnapshot = undefined;
                    }

                    return newSourceFile;
                }
            }
        }

        // Otherwise, just create a new source file.
        return createLanguageServiceSourceFile(sourceFile.fileName, scriptSnapshot, sourceFile.languageVersion, version, /*setNodeParents*/ true, sourceFile.scriptKind);
    }

    class CancellationTokenObject implements CancellationToken {
        constructor(private cancellationToken: HostCancellationToken) {
        }

        public isCancellationRequested() {
            return this.cancellationToken && this.cancellationToken.isCancellationRequested();
        }

        public throwIfCancellationRequested(): void {
            if (this.isCancellationRequested()) {
                throw new OperationCanceledException();
            }
        }
    }

    export function createLanguageService(host: LanguageServiceHost,
        documentRegistry: DocumentRegistry = createDocumentRegistry(host.useCaseSensitiveFileNames && host.useCaseSensitiveFileNames(), host.getCurrentDirectory())): LanguageService {

        const syntaxTreeCache: SyntaxTreeCache = new SyntaxTreeCache(host);
        let ruleProvider: formatting.RulesProvider;
        let program: Program;
        let lastProjectVersion: string;

        const useCaseSensitivefileNames = false;
        const cancellationToken = new CancellationTokenObject(host.getCancellationToken && host.getCancellationToken());

        const currentDirectory = host.getCurrentDirectory();
        // Check if the localized messages json is set, otherwise query the host for it
        if (!localizedDiagnosticMessages && host.getLocalizedDiagnosticMessages) {
            localizedDiagnosticMessages = host.getLocalizedDiagnosticMessages();
        }

        function log(message: string) {
            if (host.log) {
                host.log(message);
            }
        }

        const getCanonicalFileName = createGetCanonicalFileName(useCaseSensitivefileNames);

        function getValidSourceFile(fileName: string): SourceFile {
            const sourceFile = program.getSourceFile(fileName);
            if (!sourceFile) {
                throw new Error("Could not find file: '" + fileName + "'.");
            }
            return sourceFile;
        }

        function getRuleProvider(options: FormatCodeOptions) {
            // Ensure rules are initialized and up to date wrt to formatting options
            if (!ruleProvider) {
                ruleProvider = new formatting.RulesProvider();
            }

            ruleProvider.ensureUpToDate(options);
            return ruleProvider;
        }

        function synchronizeHostData(): void {
            // perform fast check if host supports it
            if (host.getProjectVersion) {
                const hostProjectVersion = host.getProjectVersion();
                if (hostProjectVersion) {
                    if (lastProjectVersion === hostProjectVersion) {
                        return;
                    }

                    lastProjectVersion = hostProjectVersion;
                }
            }

            // Get a fresh cache of the host information
            let hostCache = new HostCache(host, getCanonicalFileName);

            // If the program is already up-to-date, we can reuse it
            if (programUpToDate()) {
                return;
            }

            // IMPORTANT - It is critical from this moment onward that we do not check
            // cancellation tokens.  We are about to mutate source files from a previous program
            // instance.  If we cancel midway through, we may end up in an inconsistent state where
            // the program points to old source files that have been invalidated because of
            // incremental parsing.

            const oldSettings = program && program.getCompilerOptions();
            const newSettings = hostCache.compilationSettings();
            const shouldCreateNewSourceFiles = oldSettings &&
                (oldSettings.target !== newSettings.target ||
                 oldSettings.module !== newSettings.module ||
                 oldSettings.moduleResolution !== newSettings.moduleResolution ||
                 oldSettings.noResolve !== newSettings.noResolve ||
                 oldSettings.jsx !== newSettings.jsx ||
                 oldSettings.allowJs !== newSettings.allowJs ||
                 oldSettings.disableSizeLimit !== oldSettings.disableSizeLimit ||
                 oldSettings.baseUrl !== newSettings.baseUrl ||
                 !equalOwnProperties(oldSettings.paths, newSettings.paths));

            // Now create a new compiler
            const compilerHost: CompilerHost = {
                getSourceFile: getOrCreateSourceFile,
                getSourceFileByPath: getOrCreateSourceFileByPath,
                getCancellationToken: () => cancellationToken,
                getCanonicalFileName,
                useCaseSensitiveFileNames: () => useCaseSensitivefileNames,
                getNewLine: () => getNewLineOrDefaultFromHost(host),
                getDefaultLibFileName: (options) => host.getDefaultLibFileName(options),
                writeFile: (fileName, data, writeByteOrderMark) => { },
                getCurrentDirectory: () => currentDirectory,
                fileExists: (fileName): boolean => {
                    // stub missing host functionality
                    return hostCache.getOrCreateEntry(fileName) !== undefined;
                },
                readFile: (fileName): string => {
                    // stub missing host functionality
                    const entry = hostCache.getOrCreateEntry(fileName);
                    return entry && entry.scriptSnapshot.getText(0, entry.scriptSnapshot.getLength());
                },
                directoryExists: directoryName => {
                    return directoryProbablyExists(directoryName, host);
                },
                getDirectories: path => {
                    return host.getDirectories ? host.getDirectories(path) : [];
                }
            };
            if (host.trace) {
                compilerHost.trace = message => host.trace(message);
            }

            if (host.resolveModuleNames) {
                compilerHost.resolveModuleNames = (moduleNames, containingFile) => host.resolveModuleNames(moduleNames, containingFile);
            }
            if (host.resolveTypeReferenceDirectives) {
                compilerHost.resolveTypeReferenceDirectives = (typeReferenceDirectiveNames, containingFile) => {
                    return host.resolveTypeReferenceDirectives(typeReferenceDirectiveNames, containingFile);
                };
            }

            const documentRegistryBucketKey = documentRegistry.getKeyForCompilationSettings(newSettings);
            const newProgram = createProgram(hostCache.getRootFileNames(), newSettings, compilerHost, program);

            // Release any files we have acquired in the old program but are
            // not part of the new program.
            if (program) {
                const oldSourceFiles = program.getSourceFiles();
                const oldSettingsKey = documentRegistry.getKeyForCompilationSettings(oldSettings);
                for (const oldSourceFile of oldSourceFiles) {
                    if (!newProgram.getSourceFile(oldSourceFile.fileName) || shouldCreateNewSourceFiles) {
                        documentRegistry.releaseDocumentWithKey(oldSourceFile.path, oldSettingsKey);
                    }
                }
            }

            // hostCache is captured in the closure for 'getOrCreateSourceFile' but it should not be used past this point.
            // It needs to be cleared to allow all collected snapshots to be released
            hostCache = undefined;

            program = newProgram;

            // Make sure all the nodes in the program are both bound, and have their parent
            // pointers set property.
            program.getTypeChecker();
            return;

            function getOrCreateSourceFile(fileName: string): SourceFile {
                return getOrCreateSourceFileByPath(fileName, toPath(fileName, currentDirectory, getCanonicalFileName));
            }

            function getOrCreateSourceFileByPath(fileName: string, path: Path): SourceFile {
                Debug.assert(hostCache !== undefined);
                // The program is asking for this file, check first if the host can locate it.
                // If the host can not locate the file, then it does not exist. return undefined
                // to the program to allow reporting of errors for missing files.
                const hostFileInformation = hostCache.getOrCreateEntryByPath(fileName, path);
                if (!hostFileInformation) {
                    return undefined;
                }

<<<<<<< HEAD
                // check if at least one of alternative have moved scanner forward
                if (tryConsumeDeclare() ||
                    tryConsumeImport() ||
                    tryConsumeExport() ||
                    (detectJavaScriptImports && (tryConsumeRequireCall(/*skipCurrentToken*/ false) || tryConsumeDefine()))) {
                    continue;
                }
                else {
                    nextToken();
                }
            }

            scanner.setText(undefined);
        }

        if (readImportFiles) {
            processImports();
        }
        processTripleSlashDirectives();
        if (externalModule) {
            // for external modules module all nested ambient modules are augmentations
            if (ambientExternalModules) {
                // move all detected ambient modules to imported files since they need to be resolved
                for (const decl of ambientExternalModules) {
                    importedFiles.push(decl.ref);
                }
            }
            return { referencedFiles, typeReferenceDirectives, importedFiles, isLibFile: isNoDefaultLib, ambientExternalModules: undefined };
        }
        else {
            // for global scripts ambient modules still can have augmentations - look for ambient modules with depth > 0
            let ambientModuleNames: string[];
            if (ambientExternalModules) {
                for (const decl of ambientExternalModules) {
                    if (decl.depth === 0) {
                        if (!ambientModuleNames) {
                            ambientModuleNames = [];
                        }
                        ambientModuleNames.push(decl.ref.fileName);
                    }
                    else {
                        importedFiles.push(decl.ref);
                    }
                }
            }
            return { referencedFiles, typeReferenceDirectives, importedFiles, isLibFile: isNoDefaultLib, ambientExternalModules: ambientModuleNames };
        }
    }

    /// Helpers
    function getTargetLabel(referenceNode: Node, labelName: string): Identifier {
        while (referenceNode) {
            if (referenceNode.kind === SyntaxKind.LabeledStatement && (<LabeledStatement>referenceNode).label.text === labelName) {
                return (<LabeledStatement>referenceNode).label;
            }
            referenceNode = referenceNode.parent;
        }
        return undefined;
    }

    function isJumpStatementTarget(node: Node): boolean {
        return node.kind === SyntaxKind.Identifier &&
            (node.parent.kind === SyntaxKind.BreakStatement || node.parent.kind === SyntaxKind.ContinueStatement) &&
            (<BreakOrContinueStatement>node.parent).label === node;
    }

    function isLabelOfLabeledStatement(node: Node): boolean {
        return node.kind === SyntaxKind.Identifier &&
            node.parent.kind === SyntaxKind.LabeledStatement &&
            (<LabeledStatement>node.parent).label === node;
    }

    /**
     * Whether or not a 'node' is preceded by a label of the given string.
     * Note: 'node' cannot be a SourceFile.
     */
    function isLabeledBy(node: Node, labelName: string) {
        for (let owner = node.parent; owner.kind === SyntaxKind.LabeledStatement; owner = owner.parent) {
            if ((<LabeledStatement>owner).label.text === labelName) {
                return true;
            }
        }

        return false;
    }

    function isLabelName(node: Node): boolean {
        return isLabelOfLabeledStatement(node) || isJumpStatementTarget(node);
    }

    function isRightSideOfQualifiedName(node: Node) {
        return node.parent.kind === SyntaxKind.QualifiedName && (<QualifiedName>node.parent).right === node;
    }

    function isRightSideOfPropertyAccess(node: Node) {
        return node && node.parent && node.parent.kind === SyntaxKind.PropertyAccessExpression && (<PropertyAccessExpression>node.parent).name === node;
    }

    function isCallExpressionTarget(node: Node): boolean {
        if (isRightSideOfPropertyAccess(node)) {
            node = node.parent;
        }
        return node && node.parent && node.parent.kind === SyntaxKind.CallExpression && (<CallExpression>node.parent).expression === node;
    }

    function isNewExpressionTarget(node: Node): boolean {
        if (isRightSideOfPropertyAccess(node)) {
            node = node.parent;
        }
        return node && node.parent && node.parent.kind === SyntaxKind.NewExpression && (<CallExpression>node.parent).expression === node;
    }

    function isNameOfModuleDeclaration(node: Node) {
        return node.parent.kind === SyntaxKind.ModuleDeclaration && (<ModuleDeclaration>node.parent).name === node;
    }

    function isNameOfFunctionDeclaration(node: Node): boolean {
        return node.kind === SyntaxKind.Identifier &&
            isFunctionLike(node.parent) && (<FunctionLikeDeclaration>node.parent).name === node;
    }

    function isObjectLiteralPropertyDeclaration(node: Node): node is ObjectLiteralElement  {
        switch (node.kind) {
            case SyntaxKind.PropertyAssignment:
            case SyntaxKind.ShorthandPropertyAssignment:
            case SyntaxKind.MethodDeclaration:
            case SyntaxKind.GetAccessor:
            case SyntaxKind.SetAccessor:
                return true;
        }
        return false;
    }

    /**
     * Returns the containing object literal property declaration given a possible name node, e.g. "a" in x = { "a": 1 }
     */
    function getContainingObjectLiteralElement(node: Node): ObjectLiteralElement {
        switch (node.kind) {
            case SyntaxKind.StringLiteral:
            case SyntaxKind.NumericLiteral:
                if (node.parent.kind === SyntaxKind.ComputedPropertyName) {
                    return isObjectLiteralPropertyDeclaration(node.parent.parent) ? node.parent.parent : undefined;
                }
            // intential fall through
            case SyntaxKind.Identifier:
                return isObjectLiteralPropertyDeclaration(node.parent) && node.parent.name === node ? node.parent : undefined;
        }
        return undefined;
    }

    function isLiteralNameOfPropertyDeclarationOrIndexAccess(node: Node): boolean {
        if (node.kind === SyntaxKind.StringLiteral || node.kind === SyntaxKind.NumericLiteral) {
            switch (node.parent.kind) {
                case SyntaxKind.PropertyDeclaration:
                case SyntaxKind.PropertySignature:
                case SyntaxKind.PropertyAssignment:
                case SyntaxKind.EnumMember:
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.MethodSignature:
                case SyntaxKind.GetAccessor:
                case SyntaxKind.SetAccessor:
                case SyntaxKind.ModuleDeclaration:
                    return (<Declaration>node.parent).name === node;
                case SyntaxKind.ElementAccessExpression:
                    return (<ElementAccessExpression>node.parent).argumentExpression === node;
                case SyntaxKind.ComputedPropertyName:
                    return true;
            }
        }

        return false;
    }

    function isNameOfExternalModuleImportOrDeclaration(node: Node): boolean {
        if (node.kind === SyntaxKind.StringLiteral) {
            return isNameOfModuleDeclaration(node) ||
                (isExternalModuleImportEqualsDeclaration(node.parent.parent) && getExternalModuleImportEqualsDeclarationExpression(node.parent.parent) === node);
        }

        return false;
    }

    /** Returns true if the position is within a comment */
    function isInsideComment(sourceFile: SourceFile, token: Node, position: number): boolean {
        // The position has to be: 1. in the leading trivia (before token.getStart()), and 2. within a comment
        return position <= token.getStart(sourceFile) &&
            (isInsideCommentRange(getTrailingCommentRanges(sourceFile.text, token.getFullStart())) ||
                isInsideCommentRange(getLeadingCommentRanges(sourceFile.text, token.getFullStart())));

        function isInsideCommentRange(comments: CommentRange[]): boolean {
            return forEach(comments, comment => {
                // either we are 1. completely inside the comment, or 2. at the end of the comment
                if (comment.pos < position && position < comment.end) {
                    return true;
                }
                else if (position === comment.end) {
                    const text = sourceFile.text;
                    const width = comment.end - comment.pos;
                    // is single line comment or just /*
                    if (width <= 2 || text.charCodeAt(comment.pos + 1) === CharacterCodes.slash) {
                        return true;
                    }
                    else {
                        // is unterminated multi-line comment
                        return !(text.charCodeAt(comment.end - 1) === CharacterCodes.slash &&
                            text.charCodeAt(comment.end - 2) === CharacterCodes.asterisk);
                    }
                }
                return false;
            });
        }
    }

    const enum SemanticMeaning {
        None = 0x0,
        Value = 0x1,
        Type = 0x2,
        Namespace = 0x4,
        All = Value | Type | Namespace
    }

    const enum BreakContinueSearchType {
        None = 0x0,
        Unlabeled = 0x1,
        Labeled = 0x2,
        All = Unlabeled | Labeled
    }

    // A cache of completion entries for keywords, these do not change between sessions
    const keywordCompletions: CompletionEntry[] = [];
    for (let i = SyntaxKind.FirstKeyword; i <= SyntaxKind.LastKeyword; i++) {
        keywordCompletions.push({
            name: tokenToString(i),
            kind: ScriptElementKind.keyword,
            kindModifiers: ScriptElementKindModifier.none,
            sortText: "0"
        });
    }

    /* @internal */ export function getContainerNode(node: Node): Declaration {
        while (true) {
            node = node.parent;
            if (!node) {
                return undefined;
            }
            switch (node.kind) {
                case SyntaxKind.SourceFile:
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.MethodSignature:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.GetAccessor:
                case SyntaxKind.SetAccessor:
                case SyntaxKind.ClassDeclaration:
                case SyntaxKind.InterfaceDeclaration:
                case SyntaxKind.EnumDeclaration:
                case SyntaxKind.ModuleDeclaration:
                    return <Declaration>node;
            }
        }
    }

    /* @internal */ export function getNodeKind(node: Node): string {
        switch (node.kind) {
            case SyntaxKind.SourceFile:
                return isExternalModule(<SourceFile>node) ? ScriptElementKind.moduleElement : ScriptElementKind.scriptElement;
            case SyntaxKind.ModuleDeclaration:
                return ScriptElementKind.moduleElement;
            case SyntaxKind.ClassDeclaration:
            case SyntaxKind.ClassExpression:
                return ScriptElementKind.classElement;
            case SyntaxKind.InterfaceDeclaration: return ScriptElementKind.interfaceElement;
            case SyntaxKind.TypeAliasDeclaration: return ScriptElementKind.typeElement;
            case SyntaxKind.EnumDeclaration: return ScriptElementKind.enumElement;
            case SyntaxKind.VariableDeclaration:
                return getKindOfVariableDeclaration(<VariableDeclaration>node);
            case SyntaxKind.BindingElement:
                return getKindOfVariableDeclaration(<VariableDeclaration>getRootDeclaration(node));
            case SyntaxKind.ArrowFunction:
            case SyntaxKind.FunctionDeclaration:
            case SyntaxKind.FunctionExpression:
                return ScriptElementKind.functionElement;
            case SyntaxKind.GetAccessor: return ScriptElementKind.memberGetAccessorElement;
            case SyntaxKind.SetAccessor: return ScriptElementKind.memberSetAccessorElement;
            case SyntaxKind.MethodDeclaration:
            case SyntaxKind.MethodSignature:
                return ScriptElementKind.memberFunctionElement;
            case SyntaxKind.PropertyDeclaration:
            case SyntaxKind.PropertySignature:
                return ScriptElementKind.memberVariableElement;
            case SyntaxKind.IndexSignature: return ScriptElementKind.indexSignatureElement;
            case SyntaxKind.ConstructSignature: return ScriptElementKind.constructSignatureElement;
            case SyntaxKind.CallSignature: return ScriptElementKind.callSignatureElement;
            case SyntaxKind.Constructor: return ScriptElementKind.constructorImplementationElement;
            case SyntaxKind.TypeParameter: return ScriptElementKind.typeParameterElement;
            case SyntaxKind.EnumMember: return ScriptElementKind.enumMemberElement;
            case SyntaxKind.Parameter: return (node.flags & NodeFlags.ParameterPropertyModifier) ? ScriptElementKind.memberVariableElement : ScriptElementKind.parameterElement;
            case SyntaxKind.ImportEqualsDeclaration:
            case SyntaxKind.ImportSpecifier:
            case SyntaxKind.ImportClause:
            case SyntaxKind.ExportSpecifier:
            case SyntaxKind.NamespaceImport:
                return ScriptElementKind.alias;
            case SyntaxKind.JSDocTypedefTag:
                return ScriptElementKind.typeElement;
            default:
                return ScriptElementKind.unknown;
        }

        function getKindOfVariableDeclaration(v: VariableDeclaration): string {
            return isConst(v)
                ? ScriptElementKind.constElement
                : isLet(v)
                    ? ScriptElementKind.letElement
                    : ScriptElementKind.variableElement;
        }
    }

    class CancellationTokenObject implements CancellationToken {
        constructor(private cancellationToken: HostCancellationToken) {
        }

        public isCancellationRequested() {
            return this.cancellationToken && this.cancellationToken.isCancellationRequested();
        }

        public throwIfCancellationRequested(): void {
            if (this.isCancellationRequested()) {
                throw new OperationCanceledException();
            }
        }
    }

    export function createLanguageService(host: LanguageServiceHost,
        documentRegistry: DocumentRegistry = createDocumentRegistry(host.useCaseSensitiveFileNames && host.useCaseSensitiveFileNames(), host.getCurrentDirectory())): LanguageService {

        const syntaxTreeCache: SyntaxTreeCache = new SyntaxTreeCache(host);
        const codeFixProvider: codefix.CodeFixProvider = new codefix.CodeFixProvider();
        let ruleProvider: formatting.RulesProvider;
        let program: Program;
        let lastProjectVersion: string;

        const useCaseSensitivefileNames = false;
        const cancellationToken = new CancellationTokenObject(host.getCancellationToken && host.getCancellationToken());

        const currentDirectory = host.getCurrentDirectory();
        // Check if the localized messages json is set, otherwise query the host for it
        if (!localizedDiagnosticMessages && host.getLocalizedDiagnosticMessages) {
            localizedDiagnosticMessages = host.getLocalizedDiagnosticMessages();
        }

        function log(message: string) {
            if (host.log) {
                host.log(message);
            }
        }

        const getCanonicalFileName = createGetCanonicalFileName(useCaseSensitivefileNames);

        function getValidSourceFile(fileName: string): SourceFile {
            const sourceFile = program.getSourceFile(fileName);
            if (!sourceFile) {
                throw new Error("Could not find file: '" + fileName + "'.");
            }
            return sourceFile;
        }

        function getRuleProvider(options: FormatCodeOptions) {
            // Ensure rules are initialized and up to date wrt to formatting options
            if (!ruleProvider) {
                ruleProvider = new formatting.RulesProvider();
            }

            ruleProvider.ensureUpToDate(options);
            return ruleProvider;
        }

        function synchronizeHostData(): void {
            // perform fast check if host supports it
            if (host.getProjectVersion) {
                const hostProjectVersion = host.getProjectVersion();
                if (hostProjectVersion) {
                    if (lastProjectVersion === hostProjectVersion) {
                        return;
                    }

                    lastProjectVersion = hostProjectVersion;
                }
            }

            // Get a fresh cache of the host information
            let hostCache = new HostCache(host, getCanonicalFileName);

            // If the program is already up-to-date, we can reuse it
            if (programUpToDate()) {
                return;
            }

            // IMPORTANT - It is critical from this moment onward that we do not check
            // cancellation tokens.  We are about to mutate source files from a previous program
            // instance.  If we cancel midway through, we may end up in an inconsistent state where
            // the program points to old source files that have been invalidated because of
            // incremental parsing.

            const oldSettings = program && program.getCompilerOptions();
            const newSettings = hostCache.compilationSettings();
            const shouldCreateNewSourceFiles = oldSettings &&
                (oldSettings.target !== newSettings.target ||
                 oldSettings.module !== newSettings.module ||
                 oldSettings.moduleResolution !== newSettings.moduleResolution ||
                 oldSettings.noResolve !== newSettings.noResolve ||
                 oldSettings.jsx !== newSettings.jsx ||
                 oldSettings.allowJs !== newSettings.allowJs ||
                 oldSettings.disableSizeLimit !== oldSettings.disableSizeLimit ||
                 oldSettings.baseUrl !== newSettings.baseUrl ||
                 !equalOwnProperties(oldSettings.paths, newSettings.paths));

            // Now create a new compiler
            const compilerHost: CompilerHost = {
                getSourceFile: getOrCreateSourceFile,
                getSourceFileByPath: getOrCreateSourceFileByPath,
                getCancellationToken: () => cancellationToken,
                getCanonicalFileName,
                useCaseSensitiveFileNames: () => useCaseSensitivefileNames,
                getNewLine: () => getNewLineOrDefaultFromHost(host),
                getDefaultLibFileName: (options) => host.getDefaultLibFileName(options),
                writeFile: (fileName, data, writeByteOrderMark) => { },
                getCurrentDirectory: () => currentDirectory,
                fileExists: (fileName): boolean => {
                    // stub missing host functionality
                    return hostCache.getOrCreateEntry(fileName) !== undefined;
                },
                readFile: (fileName): string => {
                    // stub missing host functionality
                    const entry = hostCache.getOrCreateEntry(fileName);
                    return entry && entry.scriptSnapshot.getText(0, entry.scriptSnapshot.getLength());
                },
                directoryExists: directoryName => {
                    return directoryProbablyExists(directoryName, host);
                },
                getDirectories: path => {
                    return host.getDirectories ? host.getDirectories(path) : [];
                }
            };
            if (host.trace) {
                compilerHost.trace = message => host.trace(message);
            }

            if (host.resolveModuleNames) {
                compilerHost.resolveModuleNames = (moduleNames, containingFile) => host.resolveModuleNames(moduleNames, containingFile);
            }
            if (host.resolveTypeReferenceDirectives) {
                compilerHost.resolveTypeReferenceDirectives = (typeReferenceDirectiveNames, containingFile) => {
                    return host.resolveTypeReferenceDirectives(typeReferenceDirectiveNames, containingFile);
                };
            }

            const documentRegistryBucketKey = documentRegistry.getKeyForCompilationSettings(newSettings);
            const newProgram = createProgram(hostCache.getRootFileNames(), newSettings, compilerHost, program);

            // Release any files we have acquired in the old program but are
            // not part of the new program.
            if (program) {
                const oldSourceFiles = program.getSourceFiles();
                const oldSettingsKey = documentRegistry.getKeyForCompilationSettings(oldSettings);
                for (const oldSourceFile of oldSourceFiles) {
                    if (!newProgram.getSourceFile(oldSourceFile.fileName) || shouldCreateNewSourceFiles) {
                        documentRegistry.releaseDocumentWithKey(oldSourceFile.path, oldSettingsKey);
                    }
                }
            }

            // hostCache is captured in the closure for 'getOrCreateSourceFile' but it should not be used past this point.
            // It needs to be cleared to allow all collected snapshots to be released
            hostCache = undefined;

            program = newProgram;

            // Make sure all the nodes in the program are both bound, and have their parent
            // pointers set property.
            program.getTypeChecker();
            return;

            function getOrCreateSourceFile(fileName: string): SourceFile {
                return getOrCreateSourceFileByPath(fileName, toPath(fileName, currentDirectory, getCanonicalFileName));
            }

            function getOrCreateSourceFileByPath(fileName: string, path: Path): SourceFile {
                Debug.assert(hostCache !== undefined);
                // The program is asking for this file, check first if the host can locate it.
                // If the host can not locate the file, then it does not exist. return undefined
                // to the program to allow reporting of errors for missing files.
                const hostFileInformation = hostCache.getOrCreateEntryByPath(fileName, path);
                if (!hostFileInformation) {
                    return undefined;
                }

=======
>>>>>>> 42515c717dd931efade8febbe29d4ebd3ffb013d
                // Check if the language version has changed since we last created a program; if they are the same,
                // it is safe to reuse the sourceFiles; if not, then the shape of the AST can change, and the oldSourceFile
                // can not be reused. we have to dump all syntax trees and create new ones.
                if (!shouldCreateNewSourceFiles) {
                    // Check if the old program had this file already
                    const oldSourceFile = program && program.getSourceFileByPath(path);
                    if (oldSourceFile) {
                        // We already had a source file for this file name.  Go to the registry to
                        // ensure that we get the right up to date version of it.  We need this to
                        // address the following race-condition.  Specifically, say we have the following:
                        //
                        //      LS1
                        //          \
                        //           DocumentRegistry
                        //          /
                        //      LS2
                        //
                        // Each LS has a reference to file 'foo.ts' at version 1.  LS2 then updates
                        // it's version of 'foo.ts' to version 2.  This will cause LS2 and the
                        // DocumentRegistry to have version 2 of the document.  HOwever, LS1 will
                        // have version 1.  And *importantly* this source file will be *corrupt*.
                        // The act of creating version 2 of the file irrevocably damages the version
                        // 1 file.
                        //
                        // So, later when we call into LS1, we need to make sure that it doesn't use
                        // it's source file any more, and instead defers to DocumentRegistry to get
                        // either version 1, version 2 (or some other version) depending on what the
                        // host says should be used.
<<<<<<< HEAD

                        // We do not support the scenario where a host can modify a registered
                        // file's script kind, i.e. in one project some file is treated as ".ts"
                        // and in another as ".js"
                        Debug.assert(hostFileInformation.scriptKind === oldSourceFile.scriptKind, "Registered script kind (" + oldSourceFile.scriptKind + ") should match new script kind (" + hostFileInformation.scriptKind + ") for file: " + path);

                        return documentRegistry.updateDocumentWithKey(fileName, path, newSettings, documentRegistryBucketKey, hostFileInformation.scriptSnapshot, hostFileInformation.version, hostFileInformation.scriptKind);
                    }

                    // We didn't already have the file.  Fall through and acquire it from the registry.
                }

                // Could not find this file in the old program, create a new SourceFile for it.
                return documentRegistry.acquireDocumentWithKey(fileName, path, newSettings, documentRegistryBucketKey, hostFileInformation.scriptSnapshot, hostFileInformation.version, hostFileInformation.scriptKind);
            }

            function sourceFileUpToDate(sourceFile: SourceFile): boolean {
                if (!sourceFile) {
                    return false;
                }
                const path = sourceFile.path || toPath(sourceFile.fileName, currentDirectory, getCanonicalFileName);
                return sourceFile.version === hostCache.getVersion(path);
            }

            function programUpToDate(): boolean {
                // If we haven't create a program yet, then it is not up-to-date
                if (!program) {
                    return false;
                }

                // If number of files in the program do not match, it is not up-to-date
                const rootFileNames = hostCache.getRootFileNames();
                if (program.getSourceFiles().length !== rootFileNames.length) {
                    return false;
                }

                // If any file is not up-to-date, then the whole program is not up-to-date
                for (const fileName of rootFileNames) {
                    if (!sourceFileUpToDate(program.getSourceFile(fileName))) {
                        return false;
                    }
                }

                // If the compilation settings do no match, then the program is not up-to-date
                return compareDataObjects(program.getCompilerOptions(), hostCache.compilationSettings());
            }
        }

        function getProgram(): Program {
            synchronizeHostData();

            return program;
        }

        function cleanupSemanticCache(): void {
            // TODO: Should we jettison the program (or it's type checker) here?
        }

        function dispose(): void {
            if (program) {
                forEach(program.getSourceFiles(), f =>
                    documentRegistry.releaseDocument(f.fileName, program.getCompilerOptions()));
            }
        }

        /// Diagnostics
        function getSyntacticDiagnostics(fileName: string) {
            synchronizeHostData();

            return program.getSyntacticDiagnostics(getValidSourceFile(fileName), cancellationToken);
        }

        /**
         * getSemanticDiagnostics return array of Diagnostics. If '-d' is not enabled, only report semantic errors
         * If '-d' enabled, report both semantic and emitter errors
         */
        function getSemanticDiagnostics(fileName: string): Diagnostic[] {
            synchronizeHostData();

            const targetSourceFile = getValidSourceFile(fileName);

            // Only perform the action per file regardless of '-out' flag as LanguageServiceHost is expected to call this function per file.
            // Therefore only get diagnostics for given file.

            const semanticDiagnostics = program.getSemanticDiagnostics(targetSourceFile, cancellationToken);
            if (!program.getCompilerOptions().declaration) {
                return semanticDiagnostics;
            }

            // If '-d' is enabled, check for emitter error. One example of emitter error is export class implements non-export interface
            const declarationDiagnostics = program.getDeclarationDiagnostics(targetSourceFile, cancellationToken);
            return concatenate(semanticDiagnostics, declarationDiagnostics);
        }

        function getCompilerOptionsDiagnostics() {
            synchronizeHostData();
            return program.getOptionsDiagnostics(cancellationToken).concat(
                   program.getGlobalDiagnostics(cancellationToken));
        }

        /**
         * Get the name to be display in completion from a given symbol.
         *
         * @return undefined if the name is of external module otherwise a name with striped of any quote
         */
        function getCompletionEntryDisplayNameForSymbol(symbol: Symbol, target: ScriptTarget, performCharacterChecks: boolean, location: Node): string {
            const displayName: string = getDeclaredName(program.getTypeChecker(), symbol, location);

            if (displayName) {
                const firstCharCode = displayName.charCodeAt(0);
                // First check of the displayName is not external module; if it is an external module, it is not valid entry
                if ((symbol.flags & SymbolFlags.Namespace) && (firstCharCode === CharacterCodes.singleQuote || firstCharCode === CharacterCodes.doubleQuote)) {
                    // If the symbol is external module, don't show it in the completion list
                    // (i.e declare module "http" { const x; } | // <= request completion here, "http" should not be there)
                    return undefined;
                }
            }

            return getCompletionEntryDisplayName(displayName, target, performCharacterChecks);
        }

        /**
         * Get a displayName from a given for completion list, performing any necessary quotes stripping
         * and checking whether the name is valid identifier name.
         */
        function getCompletionEntryDisplayName(name: string, target: ScriptTarget, performCharacterChecks: boolean): string {
            if (!name) {
                return undefined;
            }

            name = stripQuotes(name);

            if (!name) {
                return undefined;
            }

            // If the user entered name for the symbol was quoted, removing the quotes is not enough, as the name could be an
            // invalid identifier name. We need to check if whatever was inside the quotes is actually a valid identifier name.
            // e.g "b a" is valid quoted name but when we strip off the quotes, it is invalid.
            // We, thus, need to check if whatever was inside the quotes is actually a valid identifier name.
            if (performCharacterChecks) {
                if (!isIdentifier(name, target)) {
                    return undefined;
                }
            }

            return name;
        }

        function getCompletionData(fileName: string, position: number) {
            const typeChecker = program.getTypeChecker();
            const sourceFile = getValidSourceFile(fileName);
            const isJavaScriptFile = isSourceFileJavaScript(sourceFile);

            let isJsDocTagName = false;

            let start = timestamp();
            const currentToken = getTokenAtPosition(sourceFile, position);
            log("getCompletionData: Get current token: " + (timestamp() - start));

            start = timestamp();
            // Completion not allowed inside comments, bail out if this is the case
            const insideComment = isInsideComment(sourceFile, currentToken, position);
            log("getCompletionData: Is inside comment: " + (timestamp() - start));

            if (insideComment) {
                // The current position is next to the '@' sign, when no tag name being provided yet.
                // Provide a full list of tag names
                if (hasDocComment(sourceFile, position) && sourceFile.text.charCodeAt(position - 1) === CharacterCodes.at) {
                    isJsDocTagName = true;
                }

                // Completion should work inside certain JsDoc tags. For example:
                //     /** @type {number | string} */
                // Completion should work in the brackets
                let insideJsDocTagExpression = false;
                const tag = getJsDocTagAtPosition(sourceFile, position);
                if (tag) {
                    if (tag.tagName.pos <= position && position <= tag.tagName.end) {
                        isJsDocTagName = true;
                    }

                    switch (tag.kind) {
                        case SyntaxKind.JSDocTypeTag:
                        case SyntaxKind.JSDocParameterTag:
                        case SyntaxKind.JSDocReturnTag:
                            const tagWithExpression = <JSDocTypeTag | JSDocParameterTag | JSDocReturnTag>tag;
                            if (tagWithExpression.typeExpression) {
                                insideJsDocTagExpression = tagWithExpression.typeExpression.pos < position && position < tagWithExpression.typeExpression.end;
                            }
                            break;
                    }
                }

                if (isJsDocTagName) {
                    return { symbols: undefined, isMemberCompletion: false, isNewIdentifierLocation: false, location: undefined, isRightOfDot: false, isJsDocTagName };
                }

                if (!insideJsDocTagExpression) {
                    // Proceed if the current position is in jsDoc tag expression; otherwise it is a normal
                    // comment or the plain text part of a jsDoc comment, so no completion should be available
                    log("Returning an empty list because completion was inside a regular comment or plain text part of a JsDoc comment.");
                    return undefined;
                }
            }

            start = timestamp();
            const previousToken = findPrecedingToken(position, sourceFile);
            log("getCompletionData: Get previous token 1: " + (timestamp() - start));

            // The decision to provide completion depends on the contextToken, which is determined through the previousToken.
            // Note: 'previousToken' (and thus 'contextToken') can be undefined if we are the beginning of the file
            let contextToken = previousToken;

            // Check if the caret is at the end of an identifier; this is a partial identifier that we want to complete: e.g. a.toS|
            // Skip this partial identifier and adjust the contextToken to the token that precedes it.
            if (contextToken && position <= contextToken.end && isWord(contextToken.kind)) {
                const start = timestamp();
                contextToken = findPrecedingToken(contextToken.getFullStart(), sourceFile);
                log("getCompletionData: Get previous token 2: " + (timestamp() - start));
            }

            // Find the node where completion is requested on.
            // Also determine whether we are trying to complete with members of that node
            // or attributes of a JSX tag.
            let node = currentToken;
            let isRightOfDot = false;
            let isRightOfOpenTag = false;
            let isStartingCloseTag = false;

            let location = getTouchingPropertyName(sourceFile, position);
            if (contextToken) {
                // Bail out if this is a known invalid completion location
                if (isCompletionListBlocker(contextToken)) {
                    log("Returning an empty list because completion was requested in an invalid position.");
                    return undefined;
                }

                const { parent, kind } = contextToken;
                if (kind === SyntaxKind.DotToken) {
                    if (parent.kind === SyntaxKind.PropertyAccessExpression) {
                        node = (<PropertyAccessExpression>contextToken.parent).expression;
                        isRightOfDot = true;
                    }
                    else if (parent.kind === SyntaxKind.QualifiedName) {
                        node = (<QualifiedName>contextToken.parent).left;
                        isRightOfDot = true;
                    }
                    else {
                        // There is nothing that precedes the dot, so this likely just a stray character
                        // or leading into a '...' token. Just bail out instead.
                        return undefined;
                    }
                }
                else if (sourceFile.languageVariant === LanguageVariant.JSX) {
                    if (kind === SyntaxKind.LessThanToken) {
                        isRightOfOpenTag = true;
                        location = contextToken;
                    }
                    else if (kind === SyntaxKind.SlashToken && contextToken.parent.kind === SyntaxKind.JsxClosingElement) {
                        isStartingCloseTag = true;
                        location = contextToken;
                    }
                }
            }

            const semanticStart = timestamp();
            let isMemberCompletion: boolean;
            let isNewIdentifierLocation: boolean;
            let symbols: Symbol[] = [];

            if (isRightOfDot) {
                getTypeScriptMemberSymbols();
            }
            else if (isRightOfOpenTag) {
                const tagSymbols = typeChecker.getJsxIntrinsicTagNames();
                if (tryGetGlobalSymbols()) {
                    symbols = tagSymbols.concat(symbols.filter(s => !!(s.flags & (SymbolFlags.Value | SymbolFlags.Alias))));
                }
                else {
                    symbols = tagSymbols;
                }
                isMemberCompletion = true;
                isNewIdentifierLocation = false;
            }
            else if (isStartingCloseTag) {
                const tagName = (<JsxElement>contextToken.parent.parent).openingElement.tagName;
                const tagSymbol = typeChecker.getSymbolAtLocation(tagName);

                if (!typeChecker.isUnknownSymbol(tagSymbol)) {
                    symbols = [tagSymbol];
                }
                isMemberCompletion = true;
                isNewIdentifierLocation = false;
            }
            else {
                // For JavaScript or TypeScript, if we're not after a dot, then just try to get the
                // global symbols in scope.  These results should be valid for either language as
                // the set of symbols that can be referenced from this location.
                if (!tryGetGlobalSymbols()) {
                    return undefined;
                }
            }

            log("getCompletionData: Semantic work: " + (timestamp() - semanticStart));

            return { symbols, isMemberCompletion, isNewIdentifierLocation, location, isRightOfDot: (isRightOfDot || isRightOfOpenTag), isJsDocTagName };

            function getTypeScriptMemberSymbols(): void {
                // Right of dot member completion list
                isMemberCompletion = true;
                isNewIdentifierLocation = false;

                if (node.kind === SyntaxKind.Identifier || node.kind === SyntaxKind.QualifiedName || node.kind === SyntaxKind.PropertyAccessExpression) {
                    let symbol = typeChecker.getSymbolAtLocation(node);

                    // This is an alias, follow what it aliases
                    if (symbol && symbol.flags & SymbolFlags.Alias) {
                        symbol = typeChecker.getAliasedSymbol(symbol);
                    }

                    if (symbol && symbol.flags & SymbolFlags.HasExports) {
                        // Extract module or enum members
                        const exportedSymbols = typeChecker.getExportsOfModule(symbol);
                        forEach(exportedSymbols, symbol => {
                            if (typeChecker.isValidPropertyAccess(<PropertyAccessExpression>(node.parent), symbol.name)) {
                                symbols.push(symbol);
                            }
                        });
                    }
                }

                const type = typeChecker.getTypeAtLocation(node);
                addTypeProperties(type);
            }

            function addTypeProperties(type: Type) {
                if (type) {
                    // Filter private properties
                    for (const symbol of type.getApparentProperties()) {
                        if (typeChecker.isValidPropertyAccess(<PropertyAccessExpression>(node.parent), symbol.name)) {
                            symbols.push(symbol);
                        }
                    }

                    if (isJavaScriptFile && type.flags & TypeFlags.Union) {
                        // In javascript files, for union types, we don't just get the members that
                        // the individual types have in common, we also include all the members that
                        // each individual type has.  This is because we're going to add all identifiers
                        // anyways.  So we might as well elevate the members that were at least part
                        // of the individual types to a higher status since we know what they are.
                        const unionType = <UnionType>type;
                        for (const elementType of unionType.types) {
                            addTypeProperties(elementType);
                        }
                    }
                }
            }

            function tryGetGlobalSymbols(): boolean {
                let objectLikeContainer: ObjectLiteralExpression | BindingPattern;
                let namedImportsOrExports: NamedImportsOrExports;
                let jsxContainer: JsxOpeningLikeElement;

                if (objectLikeContainer = tryGetObjectLikeCompletionContainer(contextToken)) {
                    return tryGetObjectLikeCompletionSymbols(objectLikeContainer);
                }

                if (namedImportsOrExports = tryGetNamedImportsOrExportsForCompletion(contextToken)) {
                    // cursor is in an import clause
                    // try to show exported member for imported module
                    return tryGetImportOrExportClauseCompletionSymbols(namedImportsOrExports);
                }

                if (jsxContainer = tryGetContainingJsxElement(contextToken)) {
                    let attrsType: Type;
                    if ((jsxContainer.kind === SyntaxKind.JsxSelfClosingElement) || (jsxContainer.kind === SyntaxKind.JsxOpeningElement)) {
                        // Cursor is inside a JSX self-closing element or opening element
                        attrsType = typeChecker.getJsxElementAttributesType(<JsxOpeningLikeElement>jsxContainer);

                        if (attrsType) {
                            symbols = filterJsxAttributes(typeChecker.getPropertiesOfType(attrsType), (<JsxOpeningLikeElement>jsxContainer).attributes);
                            isMemberCompletion = true;
                            isNewIdentifierLocation = false;
                            return true;
                        }

                    }
                }

                // Get all entities in the current scope.
                isMemberCompletion = false;
                isNewIdentifierLocation = isNewIdentifierDefinitionLocation(contextToken);

                if (previousToken !== contextToken) {
                    Debug.assert(!!previousToken, "Expected 'contextToken' to be defined when different from 'previousToken'.");
                }
                // We need to find the node that will give us an appropriate scope to begin
                // aggregating completion candidates. This is achieved in 'getScopeNode'
                // by finding the first node that encompasses a position, accounting for whether a node
                // is "complete" to decide whether a position belongs to the node.
                //
                // However, at the end of an identifier, we are interested in the scope of the identifier
                // itself, but fall outside of the identifier. For instance:
                //
                //      xyz => x$
                //
                // the cursor is outside of both the 'x' and the arrow function 'xyz => x',
                // so 'xyz' is not returned in our results.
                //
                // We define 'adjustedPosition' so that we may appropriately account for
                // being at the end of an identifier. The intention is that if requesting completion
                // at the end of an identifier, it should be effectively equivalent to requesting completion
                // anywhere inside/at the beginning of the identifier. So in the previous case, the
                // 'adjustedPosition' will work as if requesting completion in the following:
                //
                //      xyz => $x
                //
                // If previousToken !== contextToken, then
                //   - 'contextToken' was adjusted to the token prior to 'previousToken'
                //      because we were at the end of an identifier.
                //   - 'previousToken' is defined.
                const adjustedPosition = previousToken !== contextToken ?
                    previousToken.getStart() :
                    position;

                const scopeNode = getScopeNode(contextToken, adjustedPosition, sourceFile) || sourceFile;

                /// TODO filter meaning based on the current context
                const symbolMeanings = SymbolFlags.Type | SymbolFlags.Value | SymbolFlags.Namespace | SymbolFlags.Alias;
                symbols = typeChecker.getSymbolsInScope(scopeNode, symbolMeanings);

                return true;
            }

            /**
             * Finds the first node that "embraces" the position, so that one may
             * accurately aggregate locals from the closest containing scope.
             */
            function getScopeNode(initialToken: Node, position: number, sourceFile: SourceFile) {
                let scope = initialToken;
                while (scope && !positionBelongsToNode(scope, position, sourceFile)) {
                    scope = scope.parent;
                }
                return scope;
            }

            function isCompletionListBlocker(contextToken: Node): boolean {
                const start = timestamp();
                const result = isInStringOrRegularExpressionOrTemplateLiteral(contextToken) ||
                    isSolelyIdentifierDefinitionLocation(contextToken) ||
                    isDotOfNumericLiteral(contextToken) ||
                    isInJsxText(contextToken);
                log("getCompletionsAtPosition: isCompletionListBlocker: " + (timestamp() - start));
                return result;
            }

            function isInJsxText(contextToken: Node): boolean {
                if (contextToken.kind === SyntaxKind.JsxText) {
                    return true;
                }

                if (contextToken.kind === SyntaxKind.GreaterThanToken && contextToken.parent) {
                    if (contextToken.parent.kind === SyntaxKind.JsxOpeningElement) {
                        return true;
                    }

                    if (contextToken.parent.kind === SyntaxKind.JsxClosingElement || contextToken.parent.kind === SyntaxKind.JsxSelfClosingElement) {
                        return contextToken.parent.parent && contextToken.parent.parent.kind === SyntaxKind.JsxElement;
                    }
                }
                return false;
            }

            function isNewIdentifierDefinitionLocation(previousToken: Node): boolean {
                if (previousToken) {
                    const containingNodeKind = previousToken.parent.kind;
                    switch (previousToken.kind) {
                        case SyntaxKind.CommaToken:
                            return containingNodeKind === SyntaxKind.CallExpression               // func( a, |
                                || containingNodeKind === SyntaxKind.Constructor                  // constructor( a, |   /* public, protected, private keywords are allowed here, so show completion */
                                || containingNodeKind === SyntaxKind.NewExpression                // new C(a, |
                                || containingNodeKind === SyntaxKind.ArrayLiteralExpression       // [a, |
                                || containingNodeKind === SyntaxKind.BinaryExpression             // const x = (a, |
                                || containingNodeKind === SyntaxKind.FunctionType;                // var x: (s: string, list|

                        case SyntaxKind.OpenParenToken:
                            return containingNodeKind === SyntaxKind.CallExpression               // func( |
                                || containingNodeKind === SyntaxKind.Constructor                  // constructor( |
                                || containingNodeKind === SyntaxKind.NewExpression                // new C(a|
                                || containingNodeKind === SyntaxKind.ParenthesizedExpression      // const x = (a|
                                || containingNodeKind === SyntaxKind.ParenthesizedType;           // function F(pred: (a| /* this can become an arrow function, where 'a' is the argument */

                        case SyntaxKind.OpenBracketToken:
                            return containingNodeKind === SyntaxKind.ArrayLiteralExpression       // [ |
                                || containingNodeKind === SyntaxKind.IndexSignature               // [ | : string ]
                                || containingNodeKind === SyntaxKind.ComputedPropertyName;         // [ |    /* this can become an index signature */

                        case SyntaxKind.ModuleKeyword:                                            // module |
                        case SyntaxKind.NamespaceKeyword:                                         // namespace |
                            return true;

                        case SyntaxKind.DotToken:
                            return containingNodeKind === SyntaxKind.ModuleDeclaration;           // module A.|

                        case SyntaxKind.OpenBraceToken:
                            return containingNodeKind === SyntaxKind.ClassDeclaration;            // class A{ |

                        case SyntaxKind.EqualsToken:
                            return containingNodeKind === SyntaxKind.VariableDeclaration          // const x = a|
                                || containingNodeKind === SyntaxKind.BinaryExpression;            // x = a|

                        case SyntaxKind.TemplateHead:
                            return containingNodeKind === SyntaxKind.TemplateExpression;          // `aa ${|

                        case SyntaxKind.TemplateMiddle:
                            return containingNodeKind === SyntaxKind.TemplateSpan;                // `aa ${10} dd ${|

                        case SyntaxKind.PublicKeyword:
                        case SyntaxKind.PrivateKeyword:
                        case SyntaxKind.ProtectedKeyword:
                            return containingNodeKind === SyntaxKind.PropertyDeclaration;         // class A{ public |
                    }

                    // Previous token may have been a keyword that was converted to an identifier.
                    switch (previousToken.getText()) {
                        case "public":
                        case "protected":
                        case "private":
                            return true;
                    }
                }

                return false;
            }

            function isInStringOrRegularExpressionOrTemplateLiteral(contextToken: Node): boolean {
                if (contextToken.kind === SyntaxKind.StringLiteral
                    || contextToken.kind === SyntaxKind.RegularExpressionLiteral
                    || isTemplateLiteralKind(contextToken.kind)) {
                    const start = contextToken.getStart();
                    const end = contextToken.getEnd();

                    // To be "in" one of these literals, the position has to be:
                    //   1. entirely within the token text.
                    //   2. at the end position of an unterminated token.
                    //   3. at the end of a regular expression (due to trailing flags like '/foo/g').
                    if (start < position && position < end) {
                        return true;
                    }

                    if (position === end) {
                        return !!(<LiteralExpression>contextToken).isUnterminated
                            || contextToken.kind === SyntaxKind.RegularExpressionLiteral;
                    }
                }

                return false;
            }

            /**
             * Aggregates relevant symbols for completion in object literals and object binding patterns.
             * Relevant symbols are stored in the captured 'symbols' variable.
             *
             * @returns true if 'symbols' was successfully populated; false otherwise.
             */
            function tryGetObjectLikeCompletionSymbols(objectLikeContainer: ObjectLiteralExpression | BindingPattern): boolean {
                // We're looking up possible property names from contextual/inferred/declared type.
                isMemberCompletion = true;

                let typeForObject: Type;
                let existingMembers: Declaration[];

                if (objectLikeContainer.kind === SyntaxKind.ObjectLiteralExpression) {
                    // We are completing on contextual types, but may also include properties
                    // other than those within the declared type.
                    isNewIdentifierLocation = true;

                    // If the object literal is being assigned to something of type 'null | { hello: string }',
                    // it clearly isn't trying to satisfy the 'null' type. So we grab the non-nullable type if possible.
                    typeForObject = typeChecker.getContextualType(<ObjectLiteralExpression>objectLikeContainer);
                    typeForObject = typeForObject && typeForObject.getNonNullableType();

                    existingMembers = (<ObjectLiteralExpression>objectLikeContainer).properties;
                }
                else if (objectLikeContainer.kind === SyntaxKind.ObjectBindingPattern) {
                    // We are *only* completing on properties from the type being destructured.
                    isNewIdentifierLocation = false;

                    const rootDeclaration = getRootDeclaration(objectLikeContainer.parent);
                    if (isVariableLike(rootDeclaration)) {
                        // We don't want to complete using the type acquired by the shape
                        // of the binding pattern; we are only interested in types acquired
                        // through type declaration or inference.
                        // Also proceed if rootDeclaration is a parameter and if its containing function expression/arrow function is contextually typed -
                        // type of parameter will flow in from the contextual type of the function
                        let canGetType = !!(rootDeclaration.initializer || rootDeclaration.type);
                        if (!canGetType && rootDeclaration.kind === SyntaxKind.Parameter) {
                            if (isExpression(rootDeclaration.parent)) {
                                canGetType = !!typeChecker.getContextualType(<Expression>rootDeclaration.parent);
                            }
                            else if (rootDeclaration.parent.kind === SyntaxKind.MethodDeclaration || rootDeclaration.parent.kind === SyntaxKind.SetAccessor) {
                                canGetType = isExpression(rootDeclaration.parent.parent) && !!typeChecker.getContextualType(<Expression>rootDeclaration.parent.parent);
                            }
                        }
                        if (canGetType) {
                            typeForObject = typeChecker.getTypeAtLocation(objectLikeContainer);
                            existingMembers = (<BindingPattern>objectLikeContainer).elements;
                        }
                    }
                    else {
                        Debug.fail("Root declaration is not variable-like.");
                    }
                }
                else {
                    Debug.fail("Expected object literal or binding pattern, got " + objectLikeContainer.kind);
                }

                if (!typeForObject) {
                    return false;
                }

                const typeMembers = typeChecker.getPropertiesOfType(typeForObject);
                if (typeMembers && typeMembers.length > 0) {
                    // Add filtered items to the completion list
                    symbols = filterObjectMembersList(typeMembers, existingMembers);
                }
                return true;
            }

            /**
             * Aggregates relevant symbols for completion in import clauses and export clauses
             * whose declarations have a module specifier; for instance, symbols will be aggregated for
             *
             *      import { | } from "moduleName";
             *      export { a as foo, | } from "moduleName";
             *
             * but not for
             *
             *      export { | };
             *
             * Relevant symbols are stored in the captured 'symbols' variable.
             *
             * @returns true if 'symbols' was successfully populated; false otherwise.
             */
            function tryGetImportOrExportClauseCompletionSymbols(namedImportsOrExports: NamedImportsOrExports): boolean {
                const declarationKind = namedImportsOrExports.kind === SyntaxKind.NamedImports ?
                    SyntaxKind.ImportDeclaration :
                    SyntaxKind.ExportDeclaration;
                const importOrExportDeclaration = <ImportDeclaration | ExportDeclaration>getAncestor(namedImportsOrExports, declarationKind);
                const moduleSpecifier = importOrExportDeclaration.moduleSpecifier;

                if (!moduleSpecifier) {
                    return false;
                }

                isMemberCompletion = true;
                isNewIdentifierLocation = false;

                let exports: Symbol[];
                const moduleSpecifierSymbol = typeChecker.getSymbolAtLocation(importOrExportDeclaration.moduleSpecifier);
                if (moduleSpecifierSymbol) {
                    exports = typeChecker.getExportsOfModule(moduleSpecifierSymbol);
                }

                symbols = exports ? filterNamedImportOrExportCompletionItems(exports, namedImportsOrExports.elements) : emptyArray;

                return true;
            }

            /**
             * Returns the immediate owning object literal or binding pattern of a context token,
             * on the condition that one exists and that the context implies completion should be given.
             */
            function tryGetObjectLikeCompletionContainer(contextToken: Node): ObjectLiteralExpression | BindingPattern {
                if (contextToken) {
                    switch (contextToken.kind) {
                        case SyntaxKind.OpenBraceToken:  // const x = { |
                        case SyntaxKind.CommaToken:      // const x = { a: 0, |
                            const parent = contextToken.parent;
                            if (parent && (parent.kind === SyntaxKind.ObjectLiteralExpression || parent.kind === SyntaxKind.ObjectBindingPattern)) {
                                return <ObjectLiteralExpression | BindingPattern>parent;
                            }
                            break;
                    }
                }

                return undefined;
            }

            /**
             * Returns the containing list of named imports or exports of a context token,
             * on the condition that one exists and that the context implies completion should be given.
             */
            function tryGetNamedImportsOrExportsForCompletion(contextToken: Node): NamedImportsOrExports {
                if (contextToken) {
                    switch (contextToken.kind) {
                        case SyntaxKind.OpenBraceToken:  // import { |
                        case SyntaxKind.CommaToken:      // import { a as 0, |
                            switch (contextToken.parent.kind) {
                                case SyntaxKind.NamedImports:
                                case SyntaxKind.NamedExports:
                                    return <NamedImportsOrExports>contextToken.parent;
                            }
                    }
                }

                return undefined;
            }

            function tryGetContainingJsxElement(contextToken: Node): JsxOpeningLikeElement {
                if (contextToken) {
                    const parent = contextToken.parent;
                    switch (contextToken.kind) {
                        case SyntaxKind.LessThanSlashToken:
                        case SyntaxKind.SlashToken:
                        case SyntaxKind.Identifier:
                        case SyntaxKind.JsxAttribute:
                        case SyntaxKind.JsxSpreadAttribute:
                            if (parent && (parent.kind === SyntaxKind.JsxSelfClosingElement || parent.kind === SyntaxKind.JsxOpeningElement)) {
                                return <JsxOpeningLikeElement>parent;
                            }
                            else if (parent.kind === SyntaxKind.JsxAttribute) {
                                return <JsxOpeningLikeElement>parent.parent;
                            }
                            break;

                        // The context token is the closing } or " of an attribute, which means
                        // its parent is a JsxExpression, whose parent is a JsxAttribute,
                        // whose parent is a JsxOpeningLikeElement
                        case SyntaxKind.StringLiteral:
                            if (parent && ((parent.kind === SyntaxKind.JsxAttribute) || (parent.kind === SyntaxKind.JsxSpreadAttribute))) {
                                return <JsxOpeningLikeElement>parent.parent;
                            }

                            break;

                        case SyntaxKind.CloseBraceToken:
                            if (parent &&
                                parent.kind === SyntaxKind.JsxExpression &&
                                parent.parent &&
                                (parent.parent.kind === SyntaxKind.JsxAttribute)) {
                                return <JsxOpeningLikeElement>parent.parent.parent;
                            }

                            if (parent && parent.kind === SyntaxKind.JsxSpreadAttribute) {
                                return <JsxOpeningLikeElement>parent.parent;
                            }

                            break;
                    }
                }
                return undefined;
            }

            function isFunction(kind: SyntaxKind): boolean {
                switch (kind) {
                    case SyntaxKind.FunctionExpression:
                    case SyntaxKind.ArrowFunction:
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                    case SyntaxKind.CallSignature:
                    case SyntaxKind.ConstructSignature:
                    case SyntaxKind.IndexSignature:
                        return true;
                }
                return false;
            }

            /**
             * @returns true if we are certain that the currently edited location must define a new location; false otherwise.
             */
            function isSolelyIdentifierDefinitionLocation(contextToken: Node): boolean {
                const containingNodeKind = contextToken.parent.kind;
                switch (contextToken.kind) {
                    case SyntaxKind.CommaToken:
                        return containingNodeKind === SyntaxKind.VariableDeclaration ||
                            containingNodeKind === SyntaxKind.VariableDeclarationList ||
                            containingNodeKind === SyntaxKind.VariableStatement ||
                            containingNodeKind === SyntaxKind.EnumDeclaration ||                        // enum a { foo, |
                            isFunction(containingNodeKind) ||
                            containingNodeKind === SyntaxKind.ClassDeclaration ||                       // class A<T, |
                            containingNodeKind === SyntaxKind.ClassExpression ||                        // var C = class D<T, |
                            containingNodeKind === SyntaxKind.InterfaceDeclaration ||                   // interface A<T, |
                            containingNodeKind === SyntaxKind.ArrayBindingPattern ||                    // var [x, y|
                            containingNodeKind === SyntaxKind.TypeAliasDeclaration;                     // type Map, K, |

                    case SyntaxKind.DotToken:
                        return containingNodeKind === SyntaxKind.ArrayBindingPattern;                   // var [.|

                    case SyntaxKind.ColonToken:
                        return containingNodeKind === SyntaxKind.BindingElement;                        // var {x :html|

                    case SyntaxKind.OpenBracketToken:
                        return containingNodeKind === SyntaxKind.ArrayBindingPattern;                   // var [x|

                    case SyntaxKind.OpenParenToken:
                        return containingNodeKind === SyntaxKind.CatchClause ||
                            isFunction(containingNodeKind);

                    case SyntaxKind.OpenBraceToken:
                        return containingNodeKind === SyntaxKind.EnumDeclaration ||                     // enum a { |
                            containingNodeKind === SyntaxKind.InterfaceDeclaration ||                   // interface a { |
                            containingNodeKind === SyntaxKind.TypeLiteral;                              // const x : { |

                    case SyntaxKind.SemicolonToken:
                        return containingNodeKind === SyntaxKind.PropertySignature &&
                            contextToken.parent && contextToken.parent.parent &&
                            (contextToken.parent.parent.kind === SyntaxKind.InterfaceDeclaration ||    // interface a { f; |
                                contextToken.parent.parent.kind === SyntaxKind.TypeLiteral);           // const x : { a; |

                    case SyntaxKind.LessThanToken:
                        return containingNodeKind === SyntaxKind.ClassDeclaration ||                    // class A< |
                            containingNodeKind === SyntaxKind.ClassExpression ||                        // var C = class D< |
                            containingNodeKind === SyntaxKind.InterfaceDeclaration ||                   // interface A< |
                            containingNodeKind === SyntaxKind.TypeAliasDeclaration ||                   // type List< |
                            isFunction(containingNodeKind);

                    case SyntaxKind.StaticKeyword:
                        return containingNodeKind === SyntaxKind.PropertyDeclaration;

                    case SyntaxKind.DotDotDotToken:
                        return containingNodeKind === SyntaxKind.Parameter ||
                            (contextToken.parent && contextToken.parent.parent &&
                                contextToken.parent.parent.kind === SyntaxKind.ArrayBindingPattern);  // var [...z|

                    case SyntaxKind.PublicKeyword:
                    case SyntaxKind.PrivateKeyword:
                    case SyntaxKind.ProtectedKeyword:
                        return containingNodeKind === SyntaxKind.Parameter;

                    case SyntaxKind.AsKeyword:
                        return containingNodeKind === SyntaxKind.ImportSpecifier ||
                            containingNodeKind === SyntaxKind.ExportSpecifier ||
                            containingNodeKind === SyntaxKind.NamespaceImport;

                    case SyntaxKind.ClassKeyword:
                    case SyntaxKind.EnumKeyword:
                    case SyntaxKind.InterfaceKeyword:
                    case SyntaxKind.FunctionKeyword:
                    case SyntaxKind.VarKeyword:
                    case SyntaxKind.GetKeyword:
                    case SyntaxKind.SetKeyword:
                    case SyntaxKind.ImportKeyword:
                    case SyntaxKind.LetKeyword:
                    case SyntaxKind.ConstKeyword:
                    case SyntaxKind.YieldKeyword:
                    case SyntaxKind.TypeKeyword:  // type htm|
                        return true;
                }

                // Previous token may have been a keyword that was converted to an identifier.
                switch (contextToken.getText()) {
                    case "abstract":
                    case "async":
                    case "class":
                    case "const":
                    case "declare":
                    case "enum":
                    case "function":
                    case "interface":
                    case "let":
                    case "private":
                    case "protected":
                    case "public":
                    case "static":
                    case "var":
                    case "yield":
                        return true;
                }

                return false;
            }

            function isDotOfNumericLiteral(contextToken: Node): boolean {
                if (contextToken.kind === SyntaxKind.NumericLiteral) {
                    const text = contextToken.getFullText();
                    return text.charAt(text.length - 1) === ".";
                }

                return false;
            }

            /**
             * Filters out completion suggestions for named imports or exports.
             *
             * @param exportsOfModule          The list of symbols which a module exposes.
             * @param namedImportsOrExports    The list of existing import/export specifiers in the import/export clause.
             *
             * @returns Symbols to be suggested at an import/export clause, barring those whose named imports/exports
             *          do not occur at the current position and have not otherwise been typed.
             */
            function filterNamedImportOrExportCompletionItems(exportsOfModule: Symbol[], namedImportsOrExports: ImportOrExportSpecifier[]): Symbol[] {
                const existingImportsOrExports = createMap<boolean>();

                for (const element of namedImportsOrExports) {
                    // If this is the current item we are editing right now, do not filter it out
                    if (element.getStart() <= position && position <= element.getEnd()) {
                        continue;
                    }

                    const name = element.propertyName || element.name;
                    existingImportsOrExports[name.text] = true;
                }

                if (!someProperties(existingImportsOrExports)) {
                    return filter(exportsOfModule, e => e.name !== "default");
                }

                return filter(exportsOfModule, e => e.name !== "default" && !existingImportsOrExports[e.name]);
            }

            /**
             * Filters out completion suggestions for named imports or exports.
             *
             * @returns Symbols to be suggested in an object binding pattern or object literal expression, barring those whose declarations
             *          do not occur at the current position and have not otherwise been typed.
             */
            function filterObjectMembersList(contextualMemberSymbols: Symbol[], existingMembers: Declaration[]): Symbol[] {
                if (!existingMembers || existingMembers.length === 0) {
                    return contextualMemberSymbols;
                }

                const existingMemberNames = createMap<boolean>();
                for (const m of existingMembers) {
                    // Ignore omitted expressions for missing members
                    if (m.kind !== SyntaxKind.PropertyAssignment &&
                        m.kind !== SyntaxKind.ShorthandPropertyAssignment &&
                        m.kind !== SyntaxKind.BindingElement &&
                        m.kind !== SyntaxKind.MethodDeclaration) {
                        continue;
                    }

                    // If this is the current item we are editing right now, do not filter it out
                    if (m.getStart() <= position && position <= m.getEnd()) {
                        continue;
                    }

                    let existingName: string;

                    if (m.kind === SyntaxKind.BindingElement && (<BindingElement>m).propertyName) {
                        // include only identifiers in completion list
                        if ((<BindingElement>m).propertyName.kind === SyntaxKind.Identifier) {
                            existingName = (<Identifier>(<BindingElement>m).propertyName).text;
                        }
                    }
                    else {
                        // TODO(jfreeman): Account for computed property name
                        // NOTE: if one only performs this step when m.name is an identifier,
                        // things like '__proto__' are not filtered out.
                        existingName = (<Identifier>m.name).text;
                    }

                    existingMemberNames[existingName] = true;
                }

                return filter(contextualMemberSymbols, m => !existingMemberNames[m.name]);
            }

            /**
             * Filters out completion suggestions from 'symbols' according to existing JSX attributes.
             *
             * @returns Symbols to be suggested in a JSX element, barring those whose attributes
             *          do not occur at the current position and have not otherwise been typed.
             */
            function filterJsxAttributes(symbols: Symbol[], attributes: NodeArray<JsxAttribute | JsxSpreadAttribute>): Symbol[] {
                const seenNames = createMap<boolean>();
                for (const attr of attributes) {
                    // If this is the current item we are editing right now, do not filter it out
                    if (attr.getStart() <= position && position <= attr.getEnd()) {
                        continue;
                    }

                    if (attr.kind === SyntaxKind.JsxAttribute) {
                        seenNames[(<JsxAttribute>attr).name.text] = true;
                    }
                }

                return filter(symbols, a => !seenNames[a.name]);
            }
        }

        function getCompletionsAtPosition(fileName: string, position: number): CompletionInfo {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);

            if (isInString(sourceFile, position)) {
                return getStringLiteralCompletionEntries(sourceFile, position);
            }

            const completionData = getCompletionData(fileName, position);
            if (!completionData) {
                return undefined;
            }

            const { symbols, isMemberCompletion, isNewIdentifierLocation, location, isJsDocTagName } = completionData;

            if (isJsDocTagName) {
                // If the current position is a jsDoc tag name, only tag names should be provided for completion
                return { isMemberCompletion: false, isNewIdentifierLocation: false, entries: getAllJsDocCompletionEntries() };
            }

            const entries: CompletionEntry[] = [];

            if (isSourceFileJavaScript(sourceFile)) {
                const uniqueNames = getCompletionEntriesFromSymbols(symbols, entries, location, /*performCharacterChecks*/ false);
                addRange(entries, getJavaScriptCompletionEntries(sourceFile, location.pos, uniqueNames));
            }
            else {
                if (!symbols || symbols.length === 0) {
                    if (sourceFile.languageVariant === LanguageVariant.JSX &&
                        location.parent && location.parent.kind === SyntaxKind.JsxClosingElement) {
                        // In the TypeScript JSX element, if such element is not defined. When users query for completion at closing tag,
                        // instead of simply giving unknown value, the completion will return the tag-name of an associated opening-element.
                        // For example:
                        //     var x = <div> </ /*1*/>  completion list at "1" will contain "div" with type any
                        const tagName = (<JsxElement>location.parent.parent).openingElement.tagName;
                        entries.push({
                            name: (<Identifier>tagName).text,
                            kind: undefined,
                            kindModifiers: undefined,
                            sortText: "0",
                        });
                    }
                    else {
                        return undefined;
                    }
                }

                getCompletionEntriesFromSymbols(symbols, entries, location, /*performCharacterChecks*/ true);
            }

            // Add keywords if this is not a member completion list
            if (!isMemberCompletion && !isJsDocTagName) {
                addRange(entries, keywordCompletions);
            }

            return { isMemberCompletion, isNewIdentifierLocation: isNewIdentifierLocation || isSourceFileJavaScript(sourceFile), entries };

            function getJavaScriptCompletionEntries(sourceFile: SourceFile, position: number, uniqueNames: Map<string>): CompletionEntry[] {
                const entries: CompletionEntry[] = [];
                const target = program.getCompilerOptions().target;

                const nameTable = getNameTable(sourceFile);
                for (const name in nameTable) {
                    // Skip identifiers produced only from the current location
                    if (nameTable[name] === position) {
                        continue;
                    }

                    if (!uniqueNames[name]) {
                        uniqueNames[name] = name;
                        const displayName = getCompletionEntryDisplayName(unescapeIdentifier(name), target, /*performCharacterChecks*/ true);
                        if (displayName) {
                            const entry = {
                                name: displayName,
                                kind: ScriptElementKind.warning,
                                kindModifiers: "",
                                sortText: "1"
                            };
                            entries.push(entry);
                        }
                    }
                }

                return entries;
            }

            function getAllJsDocCompletionEntries(): CompletionEntry[] {
                return jsDocCompletionEntries || (jsDocCompletionEntries = ts.map(jsDocTagNames, tagName => {
                    return {
                        name: tagName,
                        kind: ScriptElementKind.keyword,
                        kindModifiers: "",
                        sortText: "0",
                    };
                }));
            }

            function createCompletionEntry(symbol: Symbol, location: Node, performCharacterChecks: boolean): CompletionEntry {
                // Try to get a valid display name for this symbol, if we could not find one, then ignore it.
                // We would like to only show things that can be added after a dot, so for instance numeric properties can
                // not be accessed with a dot (a.1 <- invalid)
                const displayName = getCompletionEntryDisplayNameForSymbol(symbol, program.getCompilerOptions().target, performCharacterChecks, location);
                if (!displayName) {
                    return undefined;
                }

                // TODO(drosen): Right now we just permit *all* semantic meanings when calling
                // 'getSymbolKind' which is permissible given that it is backwards compatible; but
                // really we should consider passing the meaning for the node so that we don't report
                // that a suggestion for a value is an interface.  We COULD also just do what
                // 'getSymbolModifiers' does, which is to use the first declaration.

                // Use a 'sortText' of 0' so that all symbol completion entries come before any other
                // entries (like JavaScript identifier entries).
                return {
                    name: displayName,
                    kind: getSymbolKind(symbol, location),
                    kindModifiers: getSymbolModifiers(symbol),
                    sortText: "0",
                };

            }

            function getCompletionEntriesFromSymbols(symbols: Symbol[], entries: CompletionEntry[], location: Node, performCharacterChecks: boolean): Map<string> {
                const start = timestamp();
                const uniqueNames = createMap<string>();
                if (symbols) {
                    for (const symbol of symbols) {
                        const entry = createCompletionEntry(symbol, location, performCharacterChecks);
                        if (entry) {
                            const id = escapeIdentifier(entry.name);
                            if (!uniqueNames[id]) {
                                entries.push(entry);
                                uniqueNames[id] = id;
                            }
                        }
                    }
                }

                log("getCompletionsAtPosition: getCompletionEntriesFromSymbols: " + (timestamp() - start));
                return uniqueNames;
            }

            function getStringLiteralCompletionEntries(sourceFile: SourceFile, position: number) {
                const node = findPrecedingToken(position, sourceFile);
                if (!node || node.kind !== SyntaxKind.StringLiteral) {
                    return undefined;
                }

                if (node.parent.kind === SyntaxKind.PropertyAssignment && node.parent.parent.kind === SyntaxKind.ObjectLiteralExpression) {
                    // Get quoted name of properties of the object literal expression
                    // i.e. interface ConfigFiles {
                    //          'jspm:dev': string
                    //      }
                    //      let files: ConfigFiles = {
                    //          '/*completion position*/'
                    //      }
                    //
                    //      function foo(c: ConfigFiles) {}
                    //      foo({
                    //          '/*completion position*/'
                    //      });
                    return getStringLiteralCompletionEntriesFromPropertyAssignment(<ObjectLiteralElement>node.parent);
                }
                else if (isElementAccessExpression(node.parent) && node.parent.argumentExpression === node) {
                    // Get all names of properties on the expression
                    // i.e. interface A {
                    //      'prop1': string
                    // }
                    // let a: A;
                    // a['/*completion position*/']
                    return getStringLiteralCompletionEntriesFromElementAccess(node.parent);
                }
                else {
                    const argumentInfo = SignatureHelp.getContainingArgumentInfo(node, position, sourceFile);
                    if (argumentInfo) {
                        // Get string literal completions from specialized signatures of the target
                        // i.e. declare function f(a: 'A');
                        // f("/*completion position*/")
                        return getStringLiteralCompletionEntriesFromCallExpression(argumentInfo, node);
                    }

                    // Get completion for string literal from string literal type
                    // i.e. var x: "hi" | "hello" = "/*completion position*/"
                    return getStringLiteralCompletionEntriesFromContextualType(<StringLiteral>node);
                }
            }

            function getStringLiteralCompletionEntriesFromPropertyAssignment(element: ObjectLiteralElement) {
                const typeChecker = program.getTypeChecker();
                const type = typeChecker.getContextualType((<ObjectLiteralExpression>element.parent));
                const entries: CompletionEntry[] = [];
                if (type) {
                    getCompletionEntriesFromSymbols(type.getApparentProperties(), entries, element, /*performCharacterChecks*/false);
                    if (entries.length) {
                        return { isMemberCompletion: true, isNewIdentifierLocation: true, entries };
                    }
                }
            }

            function getStringLiteralCompletionEntriesFromCallExpression(argumentInfo: SignatureHelp.ArgumentListInfo, location: Node) {
                const typeChecker = program.getTypeChecker();
                const candidates: Signature[] = [];
                const entries: CompletionEntry[] = [];

                typeChecker.getResolvedSignature(argumentInfo.invocation, candidates);

                for (const candidate of candidates) {
                    if (candidate.parameters.length > argumentInfo.argumentIndex) {
                        const parameter = candidate.parameters[argumentInfo.argumentIndex];
                        addStringLiteralCompletionsFromType(typeChecker.getTypeAtLocation(parameter.valueDeclaration), entries);
                    }
                }

                if (entries.length) {
                    return { isMemberCompletion: false, isNewIdentifierLocation: true, entries };
                }

                return undefined;
            }

            function getStringLiteralCompletionEntriesFromElementAccess(node: ElementAccessExpression) {
                const typeChecker = program.getTypeChecker();
                const type = typeChecker.getTypeAtLocation(node.expression);
                const entries: CompletionEntry[] = [];
                if (type) {
                    getCompletionEntriesFromSymbols(type.getApparentProperties(), entries, node, /*performCharacterChecks*/false);
                    if (entries.length) {
                        return { isMemberCompletion: true, isNewIdentifierLocation: true, entries };
                    }
                }
                return undefined;
            }

            function getStringLiteralCompletionEntriesFromContextualType(node: StringLiteral) {
                const typeChecker = program.getTypeChecker();
                const type = typeChecker.getContextualType(node);
                if (type) {
                    const entries: CompletionEntry[] = [];
                    addStringLiteralCompletionsFromType(type, entries);
                    if (entries.length) {
                        return { isMemberCompletion: false, isNewIdentifierLocation: false, entries };
                    }
                }
                return undefined;
            }

            function addStringLiteralCompletionsFromType(type: Type, result: CompletionEntry[]): void {
                if (!type) {
                    return;
                }
                if (type.flags & TypeFlags.Union) {
                    forEach((<UnionType>type).types, t => addStringLiteralCompletionsFromType(t, result));
                }
                else {
                    if (type.flags & TypeFlags.StringLiteral) {
                        result.push({
                            name: (<LiteralType>type).text,
                            kindModifiers: ScriptElementKindModifier.none,
                            kind: ScriptElementKind.variableElement,
                            sortText: "0"
                        });
                    }
                }
            }
        }

        function getCompletionEntryDetails(fileName: string, position: number, entryName: string): CompletionEntryDetails {
            synchronizeHostData();

            // Compute all the completion symbols again.
            const completionData = getCompletionData(fileName, position);
            if (completionData) {
                const { symbols, location } = completionData;

                // Find the symbol with the matching entry name.
                const target = program.getCompilerOptions().target;
                // We don't need to perform character checks here because we're only comparing the
                // name against 'entryName' (which is known to be good), not building a new
                // completion entry.
                const symbol = forEach(symbols, s => getCompletionEntryDisplayNameForSymbol(s, target, /*performCharacterChecks*/ false, location) === entryName ? s : undefined);

                if (symbol) {
                    const { displayParts, documentation, symbolKind } = getSymbolDisplayPartsDocumentationAndSymbolKind(symbol, getValidSourceFile(fileName), location, location, SemanticMeaning.All);
                    return {
                        name: entryName,
                        kindModifiers: getSymbolModifiers(symbol),
                        kind: symbolKind,
                        displayParts,
                        documentation
                    };
                }
            }

            // Didn't find a symbol with this name.  See if we can find a keyword instead.
            const keywordCompletion = forEach(keywordCompletions, c => c.name === entryName);
            if (keywordCompletion) {
                return {
                    name: entryName,
                    kind: ScriptElementKind.keyword,
                    kindModifiers: ScriptElementKindModifier.none,
                    displayParts: [displayPart(entryName, SymbolDisplayPartKind.keyword)],
                    documentation: undefined
                };
            }

            return undefined;
        }

        // TODO(drosen): use contextual SemanticMeaning.
        function getSymbolKind(symbol: Symbol, location: Node): string {
            const flags = symbol.getFlags();

            if (flags & SymbolFlags.Class) return getDeclarationOfKind(symbol, SyntaxKind.ClassExpression) ?
                ScriptElementKind.localClassElement : ScriptElementKind.classElement;
            if (flags & SymbolFlags.Enum) return ScriptElementKind.enumElement;
            if (flags & SymbolFlags.TypeAlias) return ScriptElementKind.typeElement;
            if (flags & SymbolFlags.Interface) return ScriptElementKind.interfaceElement;
            if (flags & SymbolFlags.TypeParameter) return ScriptElementKind.typeParameterElement;

            const result = getSymbolKindOfConstructorPropertyMethodAccessorFunctionOrVar(symbol, flags, location);
            if (result === ScriptElementKind.unknown) {
                if (flags & SymbolFlags.TypeParameter) return ScriptElementKind.typeParameterElement;
                if (flags & SymbolFlags.EnumMember) return ScriptElementKind.variableElement;
                if (flags & SymbolFlags.Alias) return ScriptElementKind.alias;
                if (flags & SymbolFlags.Module) return ScriptElementKind.moduleElement;
            }

            return result;
        }

        function getSymbolKindOfConstructorPropertyMethodAccessorFunctionOrVar(symbol: Symbol, flags: SymbolFlags, location: Node) {
            const typeChecker = program.getTypeChecker();

            if (typeChecker.isUndefinedSymbol(symbol)) {
                return ScriptElementKind.variableElement;
            }
            if (typeChecker.isArgumentsSymbol(symbol)) {
                return ScriptElementKind.localVariableElement;
            }
            if (location.kind === SyntaxKind.ThisKeyword && isExpression(location)) {
                return ScriptElementKind.parameterElement;
            }
            if (flags & SymbolFlags.Variable) {
                if (isFirstDeclarationOfSymbolParameter(symbol)) {
                    return ScriptElementKind.parameterElement;
                }
                else if (symbol.valueDeclaration && isConst(symbol.valueDeclaration)) {
                    return ScriptElementKind.constElement;
                }
                else if (forEach(symbol.declarations, isLet)) {
                    return ScriptElementKind.letElement;
                }
                return isLocalVariableOrFunction(symbol) ? ScriptElementKind.localVariableElement : ScriptElementKind.variableElement;
            }
            if (flags & SymbolFlags.Function) return isLocalVariableOrFunction(symbol) ? ScriptElementKind.localFunctionElement : ScriptElementKind.functionElement;
            if (flags & SymbolFlags.GetAccessor) return ScriptElementKind.memberGetAccessorElement;
            if (flags & SymbolFlags.SetAccessor) return ScriptElementKind.memberSetAccessorElement;
            if (flags & SymbolFlags.Method) return ScriptElementKind.memberFunctionElement;
            if (flags & SymbolFlags.Constructor) return ScriptElementKind.constructorImplementationElement;

            if (flags & SymbolFlags.Property) {
                if (flags & SymbolFlags.SyntheticProperty) {
                    // If union property is result of union of non method (property/accessors/variables), it is labeled as property
                    const unionPropertyKind = forEach(typeChecker.getRootSymbols(symbol), rootSymbol => {
                        const rootSymbolFlags = rootSymbol.getFlags();
                        if (rootSymbolFlags & (SymbolFlags.PropertyOrAccessor | SymbolFlags.Variable)) {
                            return ScriptElementKind.memberVariableElement;
                        }
                        Debug.assert(!!(rootSymbolFlags & SymbolFlags.Method));
                    });
                    if (!unionPropertyKind) {
                        // If this was union of all methods,
                        // make sure it has call signatures before we can label it as method
                        const typeOfUnionProperty = typeChecker.getTypeOfSymbolAtLocation(symbol, location);
                        if (typeOfUnionProperty.getCallSignatures().length) {
                            return ScriptElementKind.memberFunctionElement;
                        }
                        return ScriptElementKind.memberVariableElement;
                    }
                    return unionPropertyKind;
                }
                return ScriptElementKind.memberVariableElement;
            }

            return ScriptElementKind.unknown;
        }

        function getSymbolModifiers(symbol: Symbol): string {
            return symbol && symbol.declarations && symbol.declarations.length > 0
                ? getNodeModifiers(symbol.declarations[0])
                : ScriptElementKindModifier.none;
        }

        // TODO(drosen): Currently completion entry details passes the SemanticMeaning.All instead of using semanticMeaning of location
        function getSymbolDisplayPartsDocumentationAndSymbolKind(symbol: Symbol, sourceFile: SourceFile, enclosingDeclaration: Node,
            location: Node, semanticMeaning = getMeaningFromLocation(location)) {

            const typeChecker = program.getTypeChecker();

            const displayParts: SymbolDisplayPart[] = [];
            let documentation: SymbolDisplayPart[];
            const symbolFlags = symbol.flags;
            let symbolKind = getSymbolKindOfConstructorPropertyMethodAccessorFunctionOrVar(symbol, symbolFlags, location);
            let hasAddedSymbolInfo: boolean;
            const isThisExpression: boolean = location.kind === SyntaxKind.ThisKeyword && isExpression(location);
            let type: Type;

            // Class at constructor site need to be shown as constructor apart from property,method, vars
            if (symbolKind !== ScriptElementKind.unknown || symbolFlags & SymbolFlags.Class || symbolFlags & SymbolFlags.Alias) {
                // If it is accessor they are allowed only if location is at name of the accessor
                if (symbolKind === ScriptElementKind.memberGetAccessorElement || symbolKind === ScriptElementKind.memberSetAccessorElement) {
                    symbolKind = ScriptElementKind.memberVariableElement;
                }

                let signature: Signature;
                type = isThisExpression ? typeChecker.getTypeAtLocation(location) : typeChecker.getTypeOfSymbolAtLocation(symbol, location);
                if (type) {
                    if (location.parent && location.parent.kind === SyntaxKind.PropertyAccessExpression) {
                        const right = (<PropertyAccessExpression>location.parent).name;
                        // Either the location is on the right of a property access, or on the left and the right is missing
                        if (right === location || (right && right.getFullWidth() === 0)) {
                            location = location.parent;
                        }
                    }

                    // try get the call/construct signature from the type if it matches
                    let callExpression: CallExpression;
                    if (location.kind === SyntaxKind.CallExpression || location.kind === SyntaxKind.NewExpression) {
                        callExpression = <CallExpression>location;
                    }
                    else if (isCallExpressionTarget(location) || isNewExpressionTarget(location)) {
                        callExpression = <CallExpression>location.parent;
                    }

                    if (callExpression) {
                        const candidateSignatures: Signature[] = [];
                        signature = typeChecker.getResolvedSignature(callExpression, candidateSignatures);
                        if (!signature && candidateSignatures.length) {
                            // Use the first candidate:
                            signature = candidateSignatures[0];
                        }

                        const useConstructSignatures = callExpression.kind === SyntaxKind.NewExpression || callExpression.expression.kind === SyntaxKind.SuperKeyword;
                        const allSignatures = useConstructSignatures ? type.getConstructSignatures() : type.getCallSignatures();

                        if (!contains(allSignatures, signature.target) && !contains(allSignatures, signature)) {
                            // Get the first signature if there is one -- allSignatures may contain
                            // either the original signature or its target, so check for either
                            signature = allSignatures.length ? allSignatures[0] : undefined;
                        }

                        if (signature) {
                            if (useConstructSignatures && (symbolFlags & SymbolFlags.Class)) {
                                // Constructor
                                symbolKind = ScriptElementKind.constructorImplementationElement;
                                addPrefixForAnyFunctionOrVar(type.symbol, symbolKind);
                            }
                            else if (symbolFlags & SymbolFlags.Alias) {
                                symbolKind = ScriptElementKind.alias;
                                pushTypePart(symbolKind);
                                displayParts.push(spacePart());
                                if (useConstructSignatures) {
                                    displayParts.push(keywordPart(SyntaxKind.NewKeyword));
                                    displayParts.push(spacePart());
                                }
                                addFullSymbolName(symbol);
                            }
                            else {
                                addPrefixForAnyFunctionOrVar(symbol, symbolKind);
                            }

                            switch (symbolKind) {
                                case ScriptElementKind.memberVariableElement:
                                case ScriptElementKind.variableElement:
                                case ScriptElementKind.constElement:
                                case ScriptElementKind.letElement:
                                case ScriptElementKind.parameterElement:
                                case ScriptElementKind.localVariableElement:
                                    // If it is call or construct signature of lambda's write type name
                                    displayParts.push(punctuationPart(SyntaxKind.ColonToken));
                                    displayParts.push(spacePart());
                                    if (useConstructSignatures) {
                                        displayParts.push(keywordPart(SyntaxKind.NewKeyword));
                                        displayParts.push(spacePart());
                                    }
                                    if (!(type.flags & TypeFlags.Anonymous) && type.symbol) {
                                        addRange(displayParts, symbolToDisplayParts(typeChecker, type.symbol, enclosingDeclaration, /*meaning*/ undefined, SymbolFormatFlags.WriteTypeParametersOrArguments));
                                    }
                                    addSignatureDisplayParts(signature, allSignatures, TypeFormatFlags.WriteArrowStyleSignature);
                                    break;

                                default:
                                    // Just signature
                                    addSignatureDisplayParts(signature, allSignatures);
                            }
                            hasAddedSymbolInfo = true;
                        }
                    }
                    else if ((isNameOfFunctionDeclaration(location) && !(symbol.flags & SymbolFlags.Accessor)) || // name of function declaration
                        (location.kind === SyntaxKind.ConstructorKeyword && location.parent.kind === SyntaxKind.Constructor)) { // At constructor keyword of constructor declaration
                        // get the signature from the declaration and write it
                        const functionDeclaration = <FunctionLikeDeclaration>location.parent;
                        const allSignatures = functionDeclaration.kind === SyntaxKind.Constructor ? type.getNonNullableType().getConstructSignatures() : type.getNonNullableType().getCallSignatures();
                        if (!typeChecker.isImplementationOfOverload(functionDeclaration)) {
                            signature = typeChecker.getSignatureFromDeclaration(functionDeclaration);
                        }
                        else {
                            signature = allSignatures[0];
                        }

                        if (functionDeclaration.kind === SyntaxKind.Constructor) {
                            // show (constructor) Type(...) signature
                            symbolKind = ScriptElementKind.constructorImplementationElement;
                            addPrefixForAnyFunctionOrVar(type.symbol, symbolKind);
                        }
                        else {
                            // (function/method) symbol(..signature)
                            addPrefixForAnyFunctionOrVar(functionDeclaration.kind === SyntaxKind.CallSignature &&
                                !(type.symbol.flags & SymbolFlags.TypeLiteral || type.symbol.flags & SymbolFlags.ObjectLiteral) ? type.symbol : symbol, symbolKind);
                        }

                        addSignatureDisplayParts(signature, allSignatures);
                        hasAddedSymbolInfo = true;
                    }
                }
            }
            if (symbolFlags & SymbolFlags.Class && !hasAddedSymbolInfo && !isThisExpression) {
                if (getDeclarationOfKind(symbol, SyntaxKind.ClassExpression)) {
                    // Special case for class expressions because we would like to indicate that
                    // the class name is local to the class body (similar to function expression)
                    //      (local class) class <className>
                    pushTypePart(ScriptElementKind.localClassElement);
                }
                else {
                    // Class declaration has name which is not local.
                    displayParts.push(keywordPart(SyntaxKind.ClassKeyword));
                }
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
                writeTypeParametersOfSymbol(symbol, sourceFile);
            }
            if ((symbolFlags & SymbolFlags.Interface) && (semanticMeaning & SemanticMeaning.Type)) {
                addNewLineIfDisplayPartsExist();
                displayParts.push(keywordPart(SyntaxKind.InterfaceKeyword));
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
                writeTypeParametersOfSymbol(symbol, sourceFile);
            }
            if (symbolFlags & SymbolFlags.TypeAlias) {
                addNewLineIfDisplayPartsExist();
                displayParts.push(keywordPart(SyntaxKind.TypeKeyword));
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
                writeTypeParametersOfSymbol(symbol, sourceFile);
                displayParts.push(spacePart());
                displayParts.push(operatorPart(SyntaxKind.EqualsToken));
                displayParts.push(spacePart());
                addRange(displayParts, typeToDisplayParts(typeChecker, typeChecker.getDeclaredTypeOfSymbol(symbol), enclosingDeclaration, TypeFormatFlags.InTypeAlias));
            }
            if (symbolFlags & SymbolFlags.Enum) {
                addNewLineIfDisplayPartsExist();
                if (forEach(symbol.declarations, isConstEnumDeclaration)) {
                    displayParts.push(keywordPart(SyntaxKind.ConstKeyword));
                    displayParts.push(spacePart());
                }
                displayParts.push(keywordPart(SyntaxKind.EnumKeyword));
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
            }
            if (symbolFlags & SymbolFlags.Module) {
                addNewLineIfDisplayPartsExist();
                const declaration = <ModuleDeclaration>getDeclarationOfKind(symbol, SyntaxKind.ModuleDeclaration);
                const isNamespace = declaration && declaration.name && declaration.name.kind === SyntaxKind.Identifier;
                displayParts.push(keywordPart(isNamespace ? SyntaxKind.NamespaceKeyword : SyntaxKind.ModuleKeyword));
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
            }
            if ((symbolFlags & SymbolFlags.TypeParameter) && (semanticMeaning & SemanticMeaning.Type)) {
                addNewLineIfDisplayPartsExist();
                displayParts.push(punctuationPart(SyntaxKind.OpenParenToken));
                displayParts.push(textPart("type parameter"));
                displayParts.push(punctuationPart(SyntaxKind.CloseParenToken));
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
                displayParts.push(spacePart());
                displayParts.push(keywordPart(SyntaxKind.InKeyword));
                displayParts.push(spacePart());
                if (symbol.parent) {
                    // Class/Interface type parameter
                    addFullSymbolName(symbol.parent, enclosingDeclaration);
                    writeTypeParametersOfSymbol(symbol.parent, enclosingDeclaration);
                }
                else {
                    // Method/function type parameter
                    let declaration = <Node>getDeclarationOfKind(symbol, SyntaxKind.TypeParameter);
                    Debug.assert(declaration !== undefined);
                    declaration = declaration.parent;

                    if (declaration) {
                        if (isFunctionLikeKind(declaration.kind)) {
                            const signature = typeChecker.getSignatureFromDeclaration(<SignatureDeclaration>declaration);
                            if (declaration.kind === SyntaxKind.ConstructSignature) {
                                displayParts.push(keywordPart(SyntaxKind.NewKeyword));
                                displayParts.push(spacePart());
                            }
                            else if (declaration.kind !== SyntaxKind.CallSignature && (<SignatureDeclaration>declaration).name) {
                                addFullSymbolName(declaration.symbol);
                            }
                            addRange(displayParts, signatureToDisplayParts(typeChecker, signature, sourceFile, TypeFormatFlags.WriteTypeArgumentsOfSignature));
                        }
                        else {
                            // Type alias type parameter
                            // For example
                            //      type list<T> = T[];  // Both T will go through same code path
                            displayParts.push(keywordPart(SyntaxKind.TypeKeyword));
                            displayParts.push(spacePart());
                            addFullSymbolName(declaration.symbol);
                            writeTypeParametersOfSymbol(declaration.symbol, sourceFile);
                        }
                    }
                }
            }
            if (symbolFlags & SymbolFlags.EnumMember) {
                addPrefixForAnyFunctionOrVar(symbol, "enum member");
                const declaration = symbol.declarations[0];
                if (declaration.kind === SyntaxKind.EnumMember) {
                    const constantValue = typeChecker.getConstantValue(<EnumMember>declaration);
                    if (constantValue !== undefined) {
                        displayParts.push(spacePart());
                        displayParts.push(operatorPart(SyntaxKind.EqualsToken));
                        displayParts.push(spacePart());
                        displayParts.push(displayPart(constantValue.toString(), SymbolDisplayPartKind.numericLiteral));
                    }
                }
            }
            if (symbolFlags & SymbolFlags.Alias) {
                addNewLineIfDisplayPartsExist();
                if (symbol.declarations[0].kind === SyntaxKind.NamespaceExportDeclaration) {
                    displayParts.push(keywordPart(SyntaxKind.ExportKeyword));
                    displayParts.push(spacePart());
                    displayParts.push(keywordPart(SyntaxKind.NamespaceKeyword));
                }
                else {
                    displayParts.push(keywordPart(SyntaxKind.ImportKeyword));
                }
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
                ts.forEach(symbol.declarations, declaration => {
                    if (declaration.kind === SyntaxKind.ImportEqualsDeclaration) {
                        const importEqualsDeclaration = <ImportEqualsDeclaration>declaration;
                        if (isExternalModuleImportEqualsDeclaration(importEqualsDeclaration)) {
                            displayParts.push(spacePart());
                            displayParts.push(operatorPart(SyntaxKind.EqualsToken));
                            displayParts.push(spacePart());
                            displayParts.push(keywordPart(SyntaxKind.RequireKeyword));
                            displayParts.push(punctuationPart(SyntaxKind.OpenParenToken));
                            displayParts.push(displayPart(getTextOfNode(getExternalModuleImportEqualsDeclarationExpression(importEqualsDeclaration)), SymbolDisplayPartKind.stringLiteral));
                            displayParts.push(punctuationPart(SyntaxKind.CloseParenToken));
                        }
                        else {
                            const internalAliasSymbol = typeChecker.getSymbolAtLocation(importEqualsDeclaration.moduleReference);
                            if (internalAliasSymbol) {
                                displayParts.push(spacePart());
                                displayParts.push(operatorPart(SyntaxKind.EqualsToken));
                                displayParts.push(spacePart());
                                addFullSymbolName(internalAliasSymbol, enclosingDeclaration);
                            }
                        }
                        return true;
                    }
                });
            }
            if (!hasAddedSymbolInfo) {
                if (symbolKind !== ScriptElementKind.unknown) {
                    if (type) {
                        if (isThisExpression) {
                            addNewLineIfDisplayPartsExist();
                            displayParts.push(keywordPart(SyntaxKind.ThisKeyword));
                        }
                        else {
                            addPrefixForAnyFunctionOrVar(symbol, symbolKind);
                        }

                        // For properties, variables and local vars: show the type
                        if (symbolKind === ScriptElementKind.memberVariableElement ||
                            symbolFlags & SymbolFlags.Variable ||
                            symbolKind === ScriptElementKind.localVariableElement ||
                            isThisExpression) {
                            displayParts.push(punctuationPart(SyntaxKind.ColonToken));
                            displayParts.push(spacePart());
                            // If the type is type parameter, format it specially
                            if (type.symbol && type.symbol.flags & SymbolFlags.TypeParameter) {
                                const typeParameterParts = mapToDisplayParts(writer => {
                                    typeChecker.getSymbolDisplayBuilder().buildTypeParameterDisplay(<TypeParameter>type, writer, enclosingDeclaration);
                                });
                                addRange(displayParts, typeParameterParts);
                            }
                            else {
                                addRange(displayParts, typeToDisplayParts(typeChecker, type, enclosingDeclaration));
                            }
                        }
                        else if (symbolFlags & SymbolFlags.Function ||
                            symbolFlags & SymbolFlags.Method ||
                            symbolFlags & SymbolFlags.Constructor ||
                            symbolFlags & SymbolFlags.Signature ||
                            symbolFlags & SymbolFlags.Accessor ||
                            symbolKind === ScriptElementKind.memberFunctionElement) {
                            const allSignatures = type.getNonNullableType().getCallSignatures();
                            addSignatureDisplayParts(allSignatures[0], allSignatures);
                        }
                    }
                }
                else {
                    symbolKind = getSymbolKind(symbol, location);
                }
            }

            if (!documentation) {
                documentation = symbol.getDocumentationComment();
                if (documentation.length === 0 && symbol.flags & SymbolFlags.Property) {
                    // For some special property access expressions like `experts.foo = foo` or `module.exports.foo = foo`
                    // there documentation comments might be attached to the right hand side symbol of their declarations.
                    // The pattern of such special property access is that the parent symbol is the symbol of the file.
                    if (symbol.parent && forEach(symbol.parent.declarations, declaration => declaration.kind === SyntaxKind.SourceFile)) {
                        for (const declaration of symbol.declarations) {
                            if (!declaration.parent || declaration.parent.kind !== SyntaxKind.BinaryExpression) {
                                continue;
                            }

                            const rhsSymbol = program.getTypeChecker().getSymbolAtLocation((<BinaryExpression>declaration.parent).right);
                            if (!rhsSymbol) {
                                continue;
                            }

                            documentation = rhsSymbol.getDocumentationComment();
                            if (documentation.length > 0) {
                                break;
                            }
                        }
                    }
                }
            }

            return { displayParts, documentation, symbolKind };

            function addNewLineIfDisplayPartsExist() {
                if (displayParts.length) {
                    displayParts.push(lineBreakPart());
                }
            }

            function addFullSymbolName(symbol: Symbol, enclosingDeclaration?: Node) {
                const fullSymbolDisplayParts = symbolToDisplayParts(typeChecker, symbol, enclosingDeclaration || sourceFile, /*meaning*/ undefined,
                    SymbolFormatFlags.WriteTypeParametersOrArguments | SymbolFormatFlags.UseOnlyExternalAliasing);
                addRange(displayParts, fullSymbolDisplayParts);
            }

            function addPrefixForAnyFunctionOrVar(symbol: Symbol, symbolKind: string) {
                addNewLineIfDisplayPartsExist();
                if (symbolKind) {
                    pushTypePart(symbolKind);
                    displayParts.push(spacePart());
                    addFullSymbolName(symbol);
                }
            }

            function pushTypePart(symbolKind: string) {
                switch (symbolKind) {
                    case ScriptElementKind.variableElement:
                    case ScriptElementKind.functionElement:
                    case ScriptElementKind.letElement:
                    case ScriptElementKind.constElement:
                    case ScriptElementKind.constructorImplementationElement:
                        displayParts.push(textOrKeywordPart(symbolKind));
                        return;
                    default:
                        displayParts.push(punctuationPart(SyntaxKind.OpenParenToken));
                        displayParts.push(textOrKeywordPart(symbolKind));
                        displayParts.push(punctuationPart(SyntaxKind.CloseParenToken));
                        return;
                }
            }

            function addSignatureDisplayParts(signature: Signature, allSignatures: Signature[], flags?: TypeFormatFlags) {
                addRange(displayParts, signatureToDisplayParts(typeChecker, signature, enclosingDeclaration, flags | TypeFormatFlags.WriteTypeArgumentsOfSignature));
                if (allSignatures.length > 1) {
                    displayParts.push(spacePart());
                    displayParts.push(punctuationPart(SyntaxKind.OpenParenToken));
                    displayParts.push(operatorPart(SyntaxKind.PlusToken));
                    displayParts.push(displayPart((allSignatures.length - 1).toString(), SymbolDisplayPartKind.numericLiteral));
                    displayParts.push(spacePart());
                    displayParts.push(textPart(allSignatures.length === 2 ? "overload" : "overloads"));
                    displayParts.push(punctuationPart(SyntaxKind.CloseParenToken));
                }
                documentation = signature.getDocumentationComment();
            }

            function writeTypeParametersOfSymbol(symbol: Symbol, enclosingDeclaration: Node) {
                const typeParameterParts = mapToDisplayParts(writer => {
                    typeChecker.getSymbolDisplayBuilder().buildTypeParameterDisplayFromSymbol(symbol, writer, enclosingDeclaration);
                });
                addRange(displayParts, typeParameterParts);
            }
        }

        function getQuickInfoAtPosition(fileName: string, position: number): QuickInfo {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);
            const node = getTouchingPropertyName(sourceFile, position);
            if (node === sourceFile) {
                return undefined;
            }

            if (isLabelName(node)) {
                return undefined;
            }

            const typeChecker = program.getTypeChecker();
            const symbol = typeChecker.getSymbolAtLocation(node);

            if (!symbol || typeChecker.isUnknownSymbol(symbol)) {
                // Try getting just type at this position and show
                switch (node.kind) {
                    case SyntaxKind.Identifier:
                    case SyntaxKind.PropertyAccessExpression:
                    case SyntaxKind.QualifiedName:
                    case SyntaxKind.ThisKeyword:
                    case SyntaxKind.ThisType:
                    case SyntaxKind.SuperKeyword:
                        // For the identifiers/this/super etc get the type at position
                        const type = typeChecker.getTypeAtLocation(node);
                        if (type) {
                            return {
                                kind: ScriptElementKind.unknown,
                                kindModifiers: ScriptElementKindModifier.none,
                                textSpan: createTextSpan(node.getStart(), node.getWidth()),
                                displayParts: typeToDisplayParts(typeChecker, type, getContainerNode(node)),
                                documentation: type.symbol ? type.symbol.getDocumentationComment() : undefined
                            };
                        }
                }

                return undefined;
            }

            const displayPartsDocumentationsAndKind = getSymbolDisplayPartsDocumentationAndSymbolKind(symbol, sourceFile, getContainerNode(node), node);
            return {
                kind: displayPartsDocumentationsAndKind.symbolKind,
                kindModifiers: getSymbolModifiers(symbol),
                textSpan: createTextSpan(node.getStart(), node.getWidth()),
                displayParts: displayPartsDocumentationsAndKind.displayParts,
                documentation: displayPartsDocumentationsAndKind.documentation
            };
        }

        function createDefinitionInfo(node: Node, symbolKind: string, symbolName: string, containerName: string): DefinitionInfo {
            return {
                fileName: node.getSourceFile().fileName,
                textSpan: createTextSpanFromBounds(node.getStart(), node.getEnd()),
                kind: symbolKind,
                name: symbolName,
                containerKind: undefined,
                containerName
            };
        }

        function getDefinitionFromSymbol(symbol: Symbol, node: Node): DefinitionInfo[] {
            const typeChecker = program.getTypeChecker();
            const result: DefinitionInfo[] = [];
            const declarations = symbol.getDeclarations();
            const symbolName = typeChecker.symbolToString(symbol); // Do not get scoped name, just the name of the symbol
            const symbolKind = getSymbolKind(symbol, node);
            const containerSymbol = symbol.parent;
            const containerName = containerSymbol ? typeChecker.symbolToString(containerSymbol, node) : "";

            if (!tryAddConstructSignature(symbol, node, symbolKind, symbolName, containerName, result) &&
                !tryAddCallSignature(symbol, node, symbolKind, symbolName, containerName, result)) {
                // Just add all the declarations.
                forEach(declarations, declaration => {
                    result.push(createDefinitionInfo(declaration, symbolKind, symbolName, containerName));
                });
            }

            return result;

            function tryAddConstructSignature(symbol: Symbol, location: Node, symbolKind: string, symbolName: string, containerName: string, result: DefinitionInfo[]) {
                // Applicable only if we are in a new expression, or we are on a constructor declaration
                // and in either case the symbol has a construct signature definition, i.e. class
                if (isNewExpressionTarget(location) || location.kind === SyntaxKind.ConstructorKeyword) {
                    if (symbol.flags & SymbolFlags.Class) {
                        // Find the first class-like declaration and try to get the construct signature.
                        for (const declaration of symbol.getDeclarations()) {
                            if (isClassLike(declaration)) {
                                return tryAddSignature(declaration.members,
                                                       /*selectConstructors*/ true,
                                                       symbolKind,
                                                       symbolName,
                                                       containerName,
                                                       result);
                            }
                        }

                        Debug.fail("Expected declaration to have at least one class-like declaration");
                    }
                }
                return false;
            }

            function tryAddCallSignature(symbol: Symbol, location: Node, symbolKind: string, symbolName: string, containerName: string, result: DefinitionInfo[]) {
                if (isCallExpressionTarget(location) || isNewExpressionTarget(location) || isNameOfFunctionDeclaration(location)) {
                    return tryAddSignature(symbol.declarations, /*selectConstructors*/ false, symbolKind, symbolName, containerName, result);
                }
                return false;
            }

            function tryAddSignature(signatureDeclarations: Declaration[], selectConstructors: boolean, symbolKind: string, symbolName: string, containerName: string, result: DefinitionInfo[]) {
                const declarations: Declaration[] = [];
                let definition: Declaration;

                forEach(signatureDeclarations, d => {
                    if ((selectConstructors && d.kind === SyntaxKind.Constructor) ||
                        (!selectConstructors && (d.kind === SyntaxKind.FunctionDeclaration || d.kind === SyntaxKind.MethodDeclaration || d.kind === SyntaxKind.MethodSignature))) {
                        declarations.push(d);
                        if ((<FunctionLikeDeclaration>d).body) definition = d;
                    }
                });

                if (definition) {
                    result.push(createDefinitionInfo(definition, symbolKind, symbolName, containerName));
                    return true;
                }
                else if (declarations.length) {
                    result.push(createDefinitionInfo(lastOrUndefined(declarations), symbolKind, symbolName, containerName));
                    return true;
                }

                return false;
            }
        }

        function findReferenceInPosition(refs: FileReference[], pos: number): FileReference {
            for (const ref of refs) {
                if (ref.pos <= pos && pos < ref.end) {
                    return ref;
                }
            }
            return undefined;
        }

        function getDefinitionInfoForFileReference(name: string, targetFileName: string): DefinitionInfo {
            return {
                fileName: targetFileName,
                textSpan: createTextSpanFromBounds(0, 0),
                kind: ScriptElementKind.scriptElement,
                name: name,
                containerName: undefined,
                containerKind: undefined
            };
        }

        /// Goto definition
        function getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);

            /// Triple slash reference comments
            const comment = findReferenceInPosition(sourceFile.referencedFiles, position);
            if (comment) {
                const referenceFile = tryResolveScriptReference(program, sourceFile, comment);
                if (referenceFile) {
                    return [getDefinitionInfoForFileReference(comment.fileName, referenceFile.fileName)];
                }
                return undefined;
            }

            // Type reference directives
            const typeReferenceDirective = findReferenceInPosition(sourceFile.typeReferenceDirectives, position);
            if (typeReferenceDirective) {
                const referenceFile = program.getResolvedTypeReferenceDirectives()[typeReferenceDirective.fileName];
                if (referenceFile && referenceFile.resolvedFileName) {
                    return [getDefinitionInfoForFileReference(typeReferenceDirective.fileName, referenceFile.resolvedFileName)];
                }
                return undefined;
            }

            const node = getTouchingPropertyName(sourceFile, position);
            if (node === sourceFile) {
                return undefined;
            }

            // Labels
            if (isJumpStatementTarget(node)) {
                const labelName = (<Identifier>node).text;
                const label = getTargetLabel((<BreakOrContinueStatement>node.parent), (<Identifier>node).text);
                return label ? [createDefinitionInfo(label, ScriptElementKind.label, labelName, /*containerName*/ undefined)] : undefined;
            }

            const typeChecker = program.getTypeChecker();
            let symbol = typeChecker.getSymbolAtLocation(node);

            // Could not find a symbol e.g. node is string or number keyword,
            // or the symbol was an internal symbol and does not have a declaration e.g. undefined symbol
            if (!symbol) {
                return undefined;
            }

            // If this is an alias, and the request came at the declaration location
            // get the aliased symbol instead. This allows for goto def on an import e.g.
            //   import {A, B} from "mod";
            // to jump to the implementation directly.
            if (symbol.flags & SymbolFlags.Alias) {
                const declaration = symbol.declarations[0];

                // Go to the original declaration for cases:
                //
                //   (1) when the aliased symbol was declared in the location(parent).
                //   (2) when the aliased symbol is originating from a named import.
                //
                if (node.kind === SyntaxKind.Identifier &&
                    (node.parent === declaration ||
                    (declaration.kind === SyntaxKind.ImportSpecifier && declaration.parent && declaration.parent.kind === SyntaxKind.NamedImports))) {

                    symbol = typeChecker.getAliasedSymbol(symbol);
                }
            }

            // Because name in short-hand property assignment has two different meanings: property name and property value,
            // using go-to-definition at such position should go to the variable declaration of the property value rather than
            // go to the declaration of the property name (in this case stay at the same position). However, if go-to-definition
            // is performed at the location of property access, we would like to go to definition of the property in the short-hand
            // assignment. This case and others are handled by the following code.
            if (node.parent.kind === SyntaxKind.ShorthandPropertyAssignment) {
                const shorthandSymbol = typeChecker.getShorthandAssignmentValueSymbol(symbol.valueDeclaration);
                if (!shorthandSymbol) {
                    return [];
                }

                const shorthandDeclarations = shorthandSymbol.getDeclarations();
                const shorthandSymbolKind = getSymbolKind(shorthandSymbol, node);
                const shorthandSymbolName = typeChecker.symbolToString(shorthandSymbol);
                const shorthandContainerName = typeChecker.symbolToString(symbol.parent, node);
                return map(shorthandDeclarations,
                    declaration => createDefinitionInfo(declaration, shorthandSymbolKind, shorthandSymbolName, shorthandContainerName));
            }

            return getDefinitionFromSymbol(symbol, node);
        }

        /// Goto type
        function getTypeDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);

            const node = getTouchingPropertyName(sourceFile, position);
            if (node === sourceFile) {
                return undefined;
            }

            const typeChecker = program.getTypeChecker();

            const symbol = typeChecker.getSymbolAtLocation(node);
            if (!symbol) {
                return undefined;
            }

            const type = typeChecker.getTypeOfSymbolAtLocation(symbol, node);
            if (!type) {
                return undefined;
            }

            if (type.flags & TypeFlags.Union && !(type.flags & TypeFlags.Enum)) {
                const result: DefinitionInfo[] = [];
                forEach((<UnionType>type).types, t => {
                    if (t.symbol) {
                        addRange(/*to*/ result, /*from*/ getDefinitionFromSymbol(t.symbol, node));
                    }
                });
                return result;
            }

            if (!type.symbol) {
                return undefined;
            }

            return getDefinitionFromSymbol(type.symbol, node);
        }

        function getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[] {
            let results = getOccurrencesAtPositionCore(fileName, position);

            if (results) {
                const sourceFile = getCanonicalFileName(normalizeSlashes(fileName));

                // Get occurrences only supports reporting occurrences for the file queried.  So
                // filter down to that list.
                results = filter(results, r => getCanonicalFileName(ts.normalizeSlashes(r.fileName)) === sourceFile);
            }

            return results;
        }

        function getDocumentHighlights(fileName: string, position: number, filesToSearch: string[]): DocumentHighlights[] {
            synchronizeHostData();

            const sourceFilesToSearch = map(filesToSearch, f => program.getSourceFile(f));
            const sourceFile = getValidSourceFile(fileName);

            const node = getTouchingWord(sourceFile, position);
            if (!node) {
                return undefined;
            }

            return getSemanticDocumentHighlights(node) || getSyntacticDocumentHighlights(node);

            function getHighlightSpanForNode(node: Node): HighlightSpan {
                const start = node.getStart();
                const end = node.getEnd();

                return {
                    fileName: sourceFile.fileName,
                    textSpan: createTextSpanFromBounds(start, end),
                    kind: HighlightSpanKind.none
                };
            }

            function getSemanticDocumentHighlights(node: Node): DocumentHighlights[] {
                if (node.kind === SyntaxKind.Identifier ||
                    node.kind === SyntaxKind.ThisKeyword ||
                    node.kind === SyntaxKind.ThisType ||
                    node.kind === SyntaxKind.SuperKeyword ||
                    node.kind === SyntaxKind.StringLiteral ||
                    isLiteralNameOfPropertyDeclarationOrIndexAccess(node)) {

                    const referencedSymbols = getReferencedSymbolsForNode(node, sourceFilesToSearch, /*findInStrings*/ false, /*findInComments*/ false);
                    return convertReferencedSymbols(referencedSymbols);
                }

                return undefined;

                function convertReferencedSymbols(referencedSymbols: ReferencedSymbol[]): DocumentHighlights[] {
                    if (!referencedSymbols) {
                        return undefined;
                    }

                    const fileNameToDocumentHighlights = createMap<DocumentHighlights>();
                    const result: DocumentHighlights[] = [];
                    for (const referencedSymbol of referencedSymbols) {
                        for (const referenceEntry of referencedSymbol.references) {
                            const fileName = referenceEntry.fileName;
                            let documentHighlights = fileNameToDocumentHighlights[fileName];
                            if (!documentHighlights) {
                                documentHighlights = { fileName, highlightSpans: [] };

                                fileNameToDocumentHighlights[fileName] = documentHighlights;
                                result.push(documentHighlights);
                            }

                            documentHighlights.highlightSpans.push({
                                textSpan: referenceEntry.textSpan,
                                kind: referenceEntry.isWriteAccess ? HighlightSpanKind.writtenReference : HighlightSpanKind.reference
                            });
                        }
                    }

                    return result;
                }
            }

            function getSyntacticDocumentHighlights(node: Node): DocumentHighlights[] {
                const fileName = sourceFile.fileName;

                const highlightSpans = getHighlightSpans(node);
                if (!highlightSpans || highlightSpans.length === 0) {
                    return undefined;
                }

                return [{ fileName, highlightSpans }];

                // returns true if 'node' is defined and has a matching 'kind'.
                function hasKind(node: Node, kind: SyntaxKind) {
                    return node !== undefined && node.kind === kind;
                }

                // Null-propagating 'parent' function.
                function parent(node: Node): Node {
                    return node && node.parent;
                }

                function getHighlightSpans(node: Node): HighlightSpan[] {
                    if (node) {
                        switch (node.kind) {
                            case SyntaxKind.IfKeyword:
                            case SyntaxKind.ElseKeyword:
                                if (hasKind(node.parent, SyntaxKind.IfStatement)) {
                                    return getIfElseOccurrences(<IfStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.ReturnKeyword:
                                if (hasKind(node.parent, SyntaxKind.ReturnStatement)) {
                                    return getReturnOccurrences(<ReturnStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.ThrowKeyword:
                                if (hasKind(node.parent, SyntaxKind.ThrowStatement)) {
                                    return getThrowOccurrences(<ThrowStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.CatchKeyword:
                                if (hasKind(parent(parent(node)), SyntaxKind.TryStatement)) {
                                    return getTryCatchFinallyOccurrences(<TryStatement>node.parent.parent);
                                }
                                break;
                            case SyntaxKind.TryKeyword:
                            case SyntaxKind.FinallyKeyword:
                                if (hasKind(parent(node), SyntaxKind.TryStatement)) {
                                    return getTryCatchFinallyOccurrences(<TryStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.SwitchKeyword:
                                if (hasKind(node.parent, SyntaxKind.SwitchStatement)) {
                                    return getSwitchCaseDefaultOccurrences(<SwitchStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.CaseKeyword:
                            case SyntaxKind.DefaultKeyword:
                                if (hasKind(parent(parent(parent(node))), SyntaxKind.SwitchStatement)) {
                                    return getSwitchCaseDefaultOccurrences(<SwitchStatement>node.parent.parent.parent);
                                }
                                break;
                            case SyntaxKind.BreakKeyword:
                            case SyntaxKind.ContinueKeyword:
                                if (hasKind(node.parent, SyntaxKind.BreakStatement) || hasKind(node.parent, SyntaxKind.ContinueStatement)) {
                                    return getBreakOrContinueStatementOccurrences(<BreakOrContinueStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.ForKeyword:
                                if (hasKind(node.parent, SyntaxKind.ForStatement) ||
                                    hasKind(node.parent, SyntaxKind.ForInStatement) ||
                                    hasKind(node.parent, SyntaxKind.ForOfStatement)) {
                                    return getLoopBreakContinueOccurrences(<IterationStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.WhileKeyword:
                            case SyntaxKind.DoKeyword:
                                if (hasKind(node.parent, SyntaxKind.WhileStatement) || hasKind(node.parent, SyntaxKind.DoStatement)) {
                                    return getLoopBreakContinueOccurrences(<IterationStatement>node.parent);
                                }
                                break;
                            case SyntaxKind.ConstructorKeyword:
                                if (hasKind(node.parent, SyntaxKind.Constructor)) {
                                    return getConstructorOccurrences(<ConstructorDeclaration>node.parent);
                                }
                                break;
                            case SyntaxKind.GetKeyword:
                            case SyntaxKind.SetKeyword:
                                if (hasKind(node.parent, SyntaxKind.GetAccessor) || hasKind(node.parent, SyntaxKind.SetAccessor)) {
                                    return getGetAndSetOccurrences(<AccessorDeclaration>node.parent);
                                }
                                break;
                            default:
                                if (isModifierKind(node.kind) && node.parent &&
                                    (isDeclaration(node.parent) || node.parent.kind === SyntaxKind.VariableStatement)) {
                                    return getModifierOccurrences(node.kind, node.parent);
                                }
                        }
                    }

                    return undefined;
                }

                /**
                 * Aggregates all throw-statements within this node *without* crossing
                 * into function boundaries and try-blocks with catch-clauses.
                 */
                function aggregateOwnedThrowStatements(node: Node): ThrowStatement[] {
                    const statementAccumulator: ThrowStatement[] = [];
                    aggregate(node);
                    return statementAccumulator;

                    function aggregate(node: Node): void {
                        if (node.kind === SyntaxKind.ThrowStatement) {
                            statementAccumulator.push(<ThrowStatement>node);
                        }
                        else if (node.kind === SyntaxKind.TryStatement) {
                            const tryStatement = <TryStatement>node;

                            if (tryStatement.catchClause) {
                                aggregate(tryStatement.catchClause);
                            }
                            else {
                                // Exceptions thrown within a try block lacking a catch clause
                                // are "owned" in the current context.
                                aggregate(tryStatement.tryBlock);
                            }

                            if (tryStatement.finallyBlock) {
                                aggregate(tryStatement.finallyBlock);
                            }
                        }
                        // Do not cross function boundaries.
                        else if (!isFunctionLike(node)) {
                            forEachChild(node, aggregate);
                        }
                    }
                }

                /**
                 * For lack of a better name, this function takes a throw statement and returns the
                 * nearest ancestor that is a try-block (whose try statement has a catch clause),
                 * function-block, or source file.
                 */
                function getThrowStatementOwner(throwStatement: ThrowStatement): Node {
                    let child: Node = throwStatement;

                    while (child.parent) {
                        const parent = child.parent;

                        if (isFunctionBlock(parent) || parent.kind === SyntaxKind.SourceFile) {
                            return parent;
                        }

                        // A throw-statement is only owned by a try-statement if the try-statement has
                        // a catch clause, and if the throw-statement occurs within the try block.
                        if (parent.kind === SyntaxKind.TryStatement) {
                            const tryStatement = <TryStatement>parent;

                            if (tryStatement.tryBlock === child && tryStatement.catchClause) {
                                return child;
                            }
                        }

                        child = parent;
                    }

                    return undefined;
                }

                function aggregateAllBreakAndContinueStatements(node: Node): BreakOrContinueStatement[] {
                    const statementAccumulator: BreakOrContinueStatement[] = [];
                    aggregate(node);
                    return statementAccumulator;

                    function aggregate(node: Node): void {
                        if (node.kind === SyntaxKind.BreakStatement || node.kind === SyntaxKind.ContinueStatement) {
                            statementAccumulator.push(<BreakOrContinueStatement>node);
                        }
                        // Do not cross function boundaries.
                        else if (!isFunctionLike(node)) {
                            forEachChild(node, aggregate);
                        }
                    }
                }

                function ownsBreakOrContinueStatement(owner: Node, statement: BreakOrContinueStatement): boolean {
                    const actualOwner = getBreakOrContinueOwner(statement);

                    return actualOwner && actualOwner === owner;
                }

                function getBreakOrContinueOwner(statement: BreakOrContinueStatement): Node {
                    for (let node = statement.parent; node; node = node.parent) {
                        switch (node.kind) {
                            case SyntaxKind.SwitchStatement:
                                if (statement.kind === SyntaxKind.ContinueStatement) {
                                    continue;
                                }
                            // Fall through.
                            case SyntaxKind.ForStatement:
                            case SyntaxKind.ForInStatement:
                            case SyntaxKind.ForOfStatement:
                            case SyntaxKind.WhileStatement:
                            case SyntaxKind.DoStatement:
                                if (!statement.label || isLabeledBy(node, statement.label.text)) {
                                    return node;
                                }
                                break;
                            default:
                                // Don't cross function boundaries.
                                if (isFunctionLike(node)) {
                                    return undefined;
                                }
                                break;
                        }
                    }

                    return undefined;
                }

                function getModifierOccurrences(modifier: SyntaxKind, declaration: Node): HighlightSpan[] {
                    const container = declaration.parent;

                    // Make sure we only highlight the keyword when it makes sense to do so.
                    if (isAccessibilityModifier(modifier)) {
                        if (!(container.kind === SyntaxKind.ClassDeclaration ||
                            container.kind === SyntaxKind.ClassExpression ||
                            (declaration.kind === SyntaxKind.Parameter && hasKind(container, SyntaxKind.Constructor)))) {
                            return undefined;
                        }
                    }
                    else if (modifier === SyntaxKind.StaticKeyword) {
                        if (!(container.kind === SyntaxKind.ClassDeclaration || container.kind === SyntaxKind.ClassExpression)) {
                            return undefined;
                        }
                    }
                    else if (modifier === SyntaxKind.ExportKeyword || modifier === SyntaxKind.DeclareKeyword) {
                        if (!(container.kind === SyntaxKind.ModuleBlock || container.kind === SyntaxKind.SourceFile)) {
                            return undefined;
                        }
                    }
                    else if (modifier === SyntaxKind.AbstractKeyword) {
                        if (!(container.kind === SyntaxKind.ClassDeclaration || declaration.kind === SyntaxKind.ClassDeclaration)) {
                            return undefined;
                        }
                    }
                    else {
                        // unsupported modifier
                        return undefined;
                    }

                    const keywords: Node[] = [];
                    const modifierFlag: NodeFlags = getFlagFromModifier(modifier);

                    let nodes: Node[];
                    switch (container.kind) {
                        case SyntaxKind.ModuleBlock:
                        case SyntaxKind.SourceFile:
                            // Container is either a class declaration or the declaration is a classDeclaration
                            if (modifierFlag & NodeFlags.Abstract) {
                                nodes = (<Node[]>(<ClassDeclaration>declaration).members).concat(declaration);
                            }
                            else {
                                nodes = (<Block>container).statements;
                            }
                            break;
                        case SyntaxKind.Constructor:
                            nodes = (<Node[]>(<ConstructorDeclaration>container).parameters).concat(
                                (<ClassDeclaration>container.parent).members);
                            break;
                        case SyntaxKind.ClassDeclaration:
                        case SyntaxKind.ClassExpression:
                            nodes = (<ClassLikeDeclaration>container).members;

                            // If we're an accessibility modifier, we're in an instance member and should search
                            // the constructor's parameter list for instance members as well.
                            if (modifierFlag & NodeFlags.AccessibilityModifier) {
                                const constructor = forEach((<ClassLikeDeclaration>container).members, member => {
                                    return member.kind === SyntaxKind.Constructor && <ConstructorDeclaration>member;
                                });

                                if (constructor) {
                                    nodes = nodes.concat(constructor.parameters);
                                }
                            }
                            else if (modifierFlag & NodeFlags.Abstract) {
                                nodes = nodes.concat(container);
                            }
                            break;
                        default:
                            Debug.fail("Invalid container kind.");
                    }

                    forEach(nodes, node => {
                        if (node.modifiers && node.flags & modifierFlag) {
                            forEach(node.modifiers, child => pushKeywordIf(keywords, child, modifier));
                        }
                    });

                    return map(keywords, getHighlightSpanForNode);

                    function getFlagFromModifier(modifier: SyntaxKind) {
                        switch (modifier) {
                            case SyntaxKind.PublicKeyword:
                                return NodeFlags.Public;
                            case SyntaxKind.PrivateKeyword:
                                return NodeFlags.Private;
                            case SyntaxKind.ProtectedKeyword:
                                return NodeFlags.Protected;
                            case SyntaxKind.StaticKeyword:
                                return NodeFlags.Static;
                            case SyntaxKind.ExportKeyword:
                                return NodeFlags.Export;
                            case SyntaxKind.DeclareKeyword:
                                return NodeFlags.Ambient;
                            case SyntaxKind.AbstractKeyword:
                                return NodeFlags.Abstract;
                            default:
                                Debug.fail();
                        }
                    }
                }

                function pushKeywordIf(keywordList: Node[], token: Node, ...expected: SyntaxKind[]): boolean {
                    if (token && contains(expected, token.kind)) {
                        keywordList.push(token);
                        return true;
                    }

                    return false;
                }

                function getGetAndSetOccurrences(accessorDeclaration: AccessorDeclaration): HighlightSpan[] {
                    const keywords: Node[] = [];

                    tryPushAccessorKeyword(accessorDeclaration.symbol, SyntaxKind.GetAccessor);
                    tryPushAccessorKeyword(accessorDeclaration.symbol, SyntaxKind.SetAccessor);

                    return map(keywords, getHighlightSpanForNode);

                    function tryPushAccessorKeyword(accessorSymbol: Symbol, accessorKind: SyntaxKind): void {
                        const accessor = getDeclarationOfKind(accessorSymbol, accessorKind);

                        if (accessor) {
                            forEach(accessor.getChildren(), child => pushKeywordIf(keywords, child, SyntaxKind.GetKeyword, SyntaxKind.SetKeyword));
                        }
                    }
                }

                function getConstructorOccurrences(constructorDeclaration: ConstructorDeclaration): HighlightSpan[] {
                    const declarations = constructorDeclaration.symbol.getDeclarations();

                    const keywords: Node[] = [];

                    forEach(declarations, declaration => {
                        forEach(declaration.getChildren(), token => {
                            return pushKeywordIf(keywords, token, SyntaxKind.ConstructorKeyword);
                        });
                    });

                    return map(keywords, getHighlightSpanForNode);
                }

                function getLoopBreakContinueOccurrences(loopNode: IterationStatement): HighlightSpan[] {
                    const keywords: Node[] = [];

                    if (pushKeywordIf(keywords, loopNode.getFirstToken(), SyntaxKind.ForKeyword, SyntaxKind.WhileKeyword, SyntaxKind.DoKeyword)) {
                        // If we succeeded and got a do-while loop, then start looking for a 'while' keyword.
                        if (loopNode.kind === SyntaxKind.DoStatement) {
                            const loopTokens = loopNode.getChildren();

                            for (let i = loopTokens.length - 1; i >= 0; i--) {
                                if (pushKeywordIf(keywords, loopTokens[i], SyntaxKind.WhileKeyword)) {
                                    break;
                                }
                            }
                        }
                    }

                    const breaksAndContinues = aggregateAllBreakAndContinueStatements(loopNode.statement);

                    forEach(breaksAndContinues, statement => {
                        if (ownsBreakOrContinueStatement(loopNode, statement)) {
                            pushKeywordIf(keywords, statement.getFirstToken(), SyntaxKind.BreakKeyword, SyntaxKind.ContinueKeyword);
                        }
                    });

                    return map(keywords, getHighlightSpanForNode);
                }

                function getBreakOrContinueStatementOccurrences(breakOrContinueStatement: BreakOrContinueStatement): HighlightSpan[] {
                    const owner = getBreakOrContinueOwner(breakOrContinueStatement);

                    if (owner) {
                        switch (owner.kind) {
                            case SyntaxKind.ForStatement:
                            case SyntaxKind.ForInStatement:
                            case SyntaxKind.ForOfStatement:
                            case SyntaxKind.DoStatement:
                            case SyntaxKind.WhileStatement:
                                return getLoopBreakContinueOccurrences(<IterationStatement>owner);
                            case SyntaxKind.SwitchStatement:
                                return getSwitchCaseDefaultOccurrences(<SwitchStatement>owner);

                        }
                    }

                    return undefined;
                }

                function getSwitchCaseDefaultOccurrences(switchStatement: SwitchStatement): HighlightSpan[] {
                    const keywords: Node[] = [];

                    pushKeywordIf(keywords, switchStatement.getFirstToken(), SyntaxKind.SwitchKeyword);

                    // Go through each clause in the switch statement, collecting the 'case'/'default' keywords.
                    forEach(switchStatement.caseBlock.clauses, clause => {
                        pushKeywordIf(keywords, clause.getFirstToken(), SyntaxKind.CaseKeyword, SyntaxKind.DefaultKeyword);

                        const breaksAndContinues = aggregateAllBreakAndContinueStatements(clause);

                        forEach(breaksAndContinues, statement => {
                            if (ownsBreakOrContinueStatement(switchStatement, statement)) {
                                pushKeywordIf(keywords, statement.getFirstToken(), SyntaxKind.BreakKeyword);
                            }
                        });
                    });

                    return map(keywords, getHighlightSpanForNode);
                }

                function getTryCatchFinallyOccurrences(tryStatement: TryStatement): HighlightSpan[] {
                    const keywords: Node[] = [];

                    pushKeywordIf(keywords, tryStatement.getFirstToken(), SyntaxKind.TryKeyword);

                    if (tryStatement.catchClause) {
                        pushKeywordIf(keywords, tryStatement.catchClause.getFirstToken(), SyntaxKind.CatchKeyword);
                    }

                    if (tryStatement.finallyBlock) {
                        const finallyKeyword = findChildOfKind(tryStatement, SyntaxKind.FinallyKeyword, sourceFile);
                        pushKeywordIf(keywords, finallyKeyword, SyntaxKind.FinallyKeyword);
                    }

                    return map(keywords, getHighlightSpanForNode);
                }

                function getThrowOccurrences(throwStatement: ThrowStatement): HighlightSpan[] {
                    const owner = getThrowStatementOwner(throwStatement);

                    if (!owner) {
                        return undefined;
                    }

                    const keywords: Node[] = [];

                    forEach(aggregateOwnedThrowStatements(owner), throwStatement => {
                        pushKeywordIf(keywords, throwStatement.getFirstToken(), SyntaxKind.ThrowKeyword);
                    });

                    // If the "owner" is a function, then we equate 'return' and 'throw' statements in their
                    // ability to "jump out" of the function, and include occurrences for both.
                    if (isFunctionBlock(owner)) {
                        forEachReturnStatement(<Block>owner, returnStatement => {
                            pushKeywordIf(keywords, returnStatement.getFirstToken(), SyntaxKind.ReturnKeyword);
                        });
                    }

                    return map(keywords, getHighlightSpanForNode);
                }

                function getReturnOccurrences(returnStatement: ReturnStatement): HighlightSpan[] {
                    const func = <FunctionLikeDeclaration>getContainingFunction(returnStatement);

                    // If we didn't find a containing function with a block body, bail out.
                    if (!(func && hasKind(func.body, SyntaxKind.Block))) {
                        return undefined;
                    }

                    const keywords: Node[] = [];
                    forEachReturnStatement(<Block>func.body, returnStatement => {
                        pushKeywordIf(keywords, returnStatement.getFirstToken(), SyntaxKind.ReturnKeyword);
                    });

                    // Include 'throw' statements that do not occur within a try block.
                    forEach(aggregateOwnedThrowStatements(func.body), throwStatement => {
                        pushKeywordIf(keywords, throwStatement.getFirstToken(), SyntaxKind.ThrowKeyword);
                    });

                    return map(keywords, getHighlightSpanForNode);
                }

                function getIfElseOccurrences(ifStatement: IfStatement): HighlightSpan[] {
                    const keywords: Node[] = [];

                    // Traverse upwards through all parent if-statements linked by their else-branches.
                    while (hasKind(ifStatement.parent, SyntaxKind.IfStatement) && (<IfStatement>ifStatement.parent).elseStatement === ifStatement) {
                        ifStatement = <IfStatement>ifStatement.parent;
                    }

                    // Now traverse back down through the else branches, aggregating if/else keywords of if-statements.
                    while (ifStatement) {
                        const children = ifStatement.getChildren();
                        pushKeywordIf(keywords, children[0], SyntaxKind.IfKeyword);

                        // Generally the 'else' keyword is second-to-last, so we traverse backwards.
                        for (let i = children.length - 1; i >= 0; i--) {
                            if (pushKeywordIf(keywords, children[i], SyntaxKind.ElseKeyword)) {
                                break;
                            }
                        }

                        if (!hasKind(ifStatement.elseStatement, SyntaxKind.IfStatement)) {
                            break;
                        }

                        ifStatement = <IfStatement>ifStatement.elseStatement;
                    }

                    const result: HighlightSpan[] = [];

                    // We'd like to highlight else/ifs together if they are only separated by whitespace
                    // (i.e. the keywords are separated by no comments, no newlines).
                    for (let i = 0; i < keywords.length; i++) {
                        if (keywords[i].kind === SyntaxKind.ElseKeyword && i < keywords.length - 1) {
                            const elseKeyword = keywords[i];
                            const ifKeyword = keywords[i + 1]; // this *should* always be an 'if' keyword.

                            let shouldCombindElseAndIf = true;

                            // Avoid recalculating getStart() by iterating backwards.
                            for (let j = ifKeyword.getStart() - 1; j >= elseKeyword.end; j--) {
                                if (!isWhiteSpaceSingleLine(sourceFile.text.charCodeAt(j))) {
                                    shouldCombindElseAndIf = false;
                                    break;
                                }
                            }

                            if (shouldCombindElseAndIf) {
                                result.push({
                                    fileName: fileName,
                                    textSpan: createTextSpanFromBounds(elseKeyword.getStart(), ifKeyword.end),
                                    kind: HighlightSpanKind.reference
                                });
                                i++; // skip the next keyword
                                continue;
                            }
                        }

                        // Ordinary case: just highlight the keyword.
                        result.push(getHighlightSpanForNode(keywords[i]));
                    }

                    return result;
                }
            }
        }

        /// References and Occurrences
        function getOccurrencesAtPositionCore(fileName: string, position: number): ReferenceEntry[] {
            synchronizeHostData();

            return convertDocumentHighlights(getDocumentHighlights(fileName, position, [fileName]));

            function convertDocumentHighlights(documentHighlights: DocumentHighlights[]): ReferenceEntry[] {
                if (!documentHighlights) {
                    return undefined;
                }

                const result: ReferenceEntry[] = [];
                for (const entry of documentHighlights) {
                    for (const highlightSpan of entry.highlightSpans) {
                        result.push({
                            fileName: entry.fileName,
                            textSpan: highlightSpan.textSpan,
                            isWriteAccess: highlightSpan.kind === HighlightSpanKind.writtenReference,
                            isDefinition: false
                        });
                    }
                }

                return result;
            }
        }

        function convertReferences(referenceSymbols: ReferencedSymbol[]): ReferenceEntry[] {
            if (!referenceSymbols) {
                return undefined;
            }

            const referenceEntries: ReferenceEntry[] = [];

            for (const referenceSymbol of referenceSymbols) {
                addRange(referenceEntries, referenceSymbol.references);
            }

            return referenceEntries;
        }

        function findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): RenameLocation[] {
            const referencedSymbols = findReferencedSymbols(fileName, position, findInStrings, findInComments);
            return convertReferences(referencedSymbols);
        }

        function getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[] {
            const referencedSymbols = findReferencedSymbols(fileName, position, /*findInStrings*/ false, /*findInComments*/ false);
            return convertReferences(referencedSymbols);
        }

        function findReferences(fileName: string, position: number): ReferencedSymbol[] {
            const referencedSymbols = findReferencedSymbols(fileName, position, /*findInStrings*/ false, /*findInComments*/ false);

            // Only include referenced symbols that have a valid definition.
            return filter(referencedSymbols, rs => !!rs.definition);
        }

        function findReferencedSymbols(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): ReferencedSymbol[] {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);

            const node = getTouchingPropertyName(sourceFile, position, /*includeJsDocComment*/ true);
            if (node === sourceFile) {
                return undefined;
            }

            switch (node.kind) {
                case SyntaxKind.NumericLiteral:
                    if (!isLiteralNameOfPropertyDeclarationOrIndexAccess(node)) {
                        break;
                    }
                    // Fallthrough
                case SyntaxKind.Identifier:
                case SyntaxKind.ThisKeyword:
                // case SyntaxKind.SuperKeyword: TODO:GH#9268
                case SyntaxKind.StringLiteral:
                    return getReferencedSymbolsForNode(node, program.getSourceFiles(), findInStrings, findInComments);
            }
            return undefined;
        }

        function isThis(node: Node): boolean {
            switch (node.kind) {
                case SyntaxKind.ThisKeyword:
                // case SyntaxKind.ThisType: TODO: GH#9267
                    return true;
                case SyntaxKind.Identifier:
                    // 'this' as a parameter
                    return (node as Identifier).originalKeywordKind === SyntaxKind.ThisKeyword && node.parent.kind === SyntaxKind.Parameter;
                default:
                    return false;
            }
        }

        function getReferencedSymbolsForNode(node: Node, sourceFiles: SourceFile[], findInStrings: boolean, findInComments: boolean): ReferencedSymbol[] {
            const typeChecker = program.getTypeChecker();

            // Labels
            if (isLabelName(node)) {
                if (isJumpStatementTarget(node)) {
                    const labelDefinition = getTargetLabel((<BreakOrContinueStatement>node.parent), (<Identifier>node).text);
                    // if we have a label definition, look within its statement for references, if not, then
                    // the label is undefined and we have no results..
                    return labelDefinition ? getLabelReferencesInNode(labelDefinition.parent, labelDefinition) : undefined;
                }
                else {
                    // it is a label definition and not a target, search within the parent labeledStatement
                    return getLabelReferencesInNode(node.parent, <Identifier>node);
                }
            }

            if (isThis(node)) {
                return getReferencesForThisKeyword(node, sourceFiles);
            }

            if (node.kind === SyntaxKind.SuperKeyword) {
                return getReferencesForSuperKeyword(node);
            }

            const symbol = typeChecker.getSymbolAtLocation(node);

            if (!symbol && node.kind === SyntaxKind.StringLiteral) {
                return getReferencesForStringLiteral(<StringLiteral>node, sourceFiles);
            }

            // Could not find a symbol e.g. unknown identifier
            if (!symbol) {
                // Can't have references to something that we have no symbol for.
                return undefined;
            }

            const declarations = symbol.declarations;

            // The symbol was an internal symbol and does not have a declaration e.g. undefined symbol
            if (!declarations || !declarations.length) {
                return undefined;
            }

            let result: ReferencedSymbol[];

            // Compute the meaning from the location and the symbol it references
            const searchMeaning = getIntersectingMeaningFromDeclarations(getMeaningFromLocation(node), declarations);

            // Get the text to search for.
            // Note: if this is an external module symbol, the name doesn't include quotes.
            const declaredName = stripQuotes(getDeclaredName(typeChecker, symbol, node));

            // Try to get the smallest valid scope that we can limit our search to;
            // otherwise we'll need to search globally (i.e. include each file).
            const scope = getSymbolScope(symbol);

            // Maps from a symbol ID to the ReferencedSymbol entry in 'result'.
            const symbolToIndex: number[] = [];

            if (scope) {
                result = [];
                getReferencesInNode(scope, symbol, declaredName, node, searchMeaning, findInStrings, findInComments, result, symbolToIndex);
            }
            else {
                const internedName = getInternedName(symbol, node, declarations);
                for (const sourceFile of sourceFiles) {
                    cancellationToken.throwIfCancellationRequested();

                    const nameTable = getNameTable(sourceFile);

                    if (nameTable[internedName] !== undefined) {
                        result = result || [];
                        getReferencesInNode(sourceFile, symbol, declaredName, node, searchMeaning, findInStrings, findInComments, result, symbolToIndex);
                    }
                }
            }

            return result;

            function getDefinition(symbol: Symbol): DefinitionInfo {
                const info = getSymbolDisplayPartsDocumentationAndSymbolKind(symbol, node.getSourceFile(), getContainerNode(node), node);
                const name = map(info.displayParts, p => p.text).join("");
                const declarations = symbol.declarations;
                if (!declarations || declarations.length === 0) {
                    return undefined;
                }

                return {
                    containerKind: "",
                    containerName: "",
                    name,
                    kind: info.symbolKind,
                    fileName: declarations[0].getSourceFile().fileName,
                    textSpan: createTextSpan(declarations[0].getStart(), 0)
                };
            }

            function getAliasSymbolForPropertyNameSymbol(symbol: Symbol, location: Node): Symbol {
                if (symbol.flags & SymbolFlags.Alias) {
                    // Default import get alias
                    const defaultImport = getDeclarationOfKind(symbol, SyntaxKind.ImportClause);
                    if (defaultImport) {
                        return typeChecker.getAliasedSymbol(symbol);
                    }

                    const importOrExportSpecifier = <ImportOrExportSpecifier>forEach(symbol.declarations,
                        declaration => (declaration.kind === SyntaxKind.ImportSpecifier ||
                            declaration.kind === SyntaxKind.ExportSpecifier) ? declaration : undefined);
                    if (importOrExportSpecifier &&
                        // export { a }
                        (!importOrExportSpecifier.propertyName ||
                            // export {a as class } where a is location
                            importOrExportSpecifier.propertyName === location)) {
                        // If Import specifier -> get alias
                        // else Export specifier -> get local target
                        return importOrExportSpecifier.kind === SyntaxKind.ImportSpecifier ?
                            typeChecker.getAliasedSymbol(symbol) :
                            typeChecker.getExportSpecifierLocalTargetSymbol(importOrExportSpecifier);
                    }
                }
                return undefined;
            }

            function getPropertySymbolOfDestructuringAssignment(location: Node) {
                return isArrayLiteralOrObjectLiteralDestructuringPattern(location.parent.parent) &&
                    typeChecker.getPropertySymbolOfDestructuringAssignment(<Identifier>location);
            }

            function isObjectBindingPatternElementWithoutPropertyName(symbol: Symbol) {
                const bindingElement = <BindingElement>getDeclarationOfKind(symbol, SyntaxKind.BindingElement);
                return bindingElement &&
                    bindingElement.parent.kind === SyntaxKind.ObjectBindingPattern &&
                    !bindingElement.propertyName;
            }

            function getPropertySymbolOfObjectBindingPatternWithoutPropertyName(symbol: Symbol) {
                if (isObjectBindingPatternElementWithoutPropertyName(symbol)) {
                    const bindingElement = <BindingElement>getDeclarationOfKind(symbol, SyntaxKind.BindingElement);
                    const typeOfPattern = typeChecker.getTypeAtLocation(bindingElement.parent);
                    return typeOfPattern && typeChecker.getPropertyOfType(typeOfPattern, (<Identifier>bindingElement.name).text);
                }
                return undefined;
            }

            function getInternedName(symbol: Symbol, location: Node, declarations: Declaration[]): string {
                // If this is an export or import specifier it could have been renamed using the 'as' syntax.
                // If so we want to search for whatever under the cursor.
                if (isImportOrExportSpecifierName(location)) {
                    return location.getText();
                }

                // Try to get the local symbol if we're dealing with an 'export default'
                // since that symbol has the "true" name.
                const localExportDefaultSymbol = getLocalSymbolForExportDefault(symbol);
                symbol = localExportDefaultSymbol || symbol;

                return stripQuotes(symbol.name);
            }

            /**
             * Determines the smallest scope in which a symbol may have named references.
             * Note that not every construct has been accounted for. This function can
             * probably be improved.
             *
             * @returns undefined if the scope cannot be determined, implying that
             * a reference to a symbol can occur anywhere.
             */
            function getSymbolScope(symbol: Symbol): Node {
                // If this is the symbol of a named function expression or named class expression,
                // then named references are limited to its own scope.
                const valueDeclaration = symbol.valueDeclaration;
                if (valueDeclaration && (valueDeclaration.kind === SyntaxKind.FunctionExpression || valueDeclaration.kind === SyntaxKind.ClassExpression)) {
                    return valueDeclaration;
                }

                // If this is private property or method, the scope is the containing class
                if (symbol.flags & (SymbolFlags.Property | SymbolFlags.Method)) {
                    const privateDeclaration = forEach(symbol.getDeclarations(), d => (d.flags & NodeFlags.Private) ? d : undefined);
                    if (privateDeclaration) {
                        return getAncestor(privateDeclaration, SyntaxKind.ClassDeclaration);
                    }
                }

                // If the symbol is an import we would like to find it if we are looking for what it imports.
                // So consider it visible outside its declaration scope.
                if (symbol.flags & SymbolFlags.Alias) {
                    return undefined;
                }

                // If symbol is of object binding pattern element without property name we would want to
                // look for property too and that could be anywhere
                if (isObjectBindingPatternElementWithoutPropertyName(symbol)) {
                    return undefined;
                }

                // if this symbol is visible from its parent container, e.g. exported, then bail out
                // if symbol correspond to the union property - bail out
                if (symbol.parent || (symbol.flags & SymbolFlags.SyntheticProperty)) {
                    return undefined;
                }

                let scope: Node;

                const declarations = symbol.getDeclarations();
                if (declarations) {
                    for (const declaration of declarations) {
                        const container = getContainerNode(declaration);

                        if (!container) {
                            return undefined;
                        }

                        if (scope && scope !== container) {
                            // Different declarations have different containers, bail out
                            return undefined;
                        }

                        if (container.kind === SyntaxKind.SourceFile && !isExternalModule(<SourceFile>container)) {
                            // This is a global variable and not an external module, any declaration defined
                            // within this scope is visible outside the file
                            return undefined;
                        }

                        // The search scope is the container node
                        scope = container;
                    }
                }

                return scope;
            }

            function getPossibleSymbolReferencePositions(sourceFile: SourceFile, symbolName: string, start: number, end: number): number[] {
                const positions: number[] = [];

                /// TODO: Cache symbol existence for files to save text search
                // Also, need to make this work for unicode escapes.

                // Be resilient in the face of a symbol with no name or zero length name
                if (!symbolName || !symbolName.length) {
                    return positions;
                }

                const text = sourceFile.text;
                const sourceLength = text.length;
                const symbolNameLength = symbolName.length;

                let position = text.indexOf(symbolName, start);
                while (position >= 0) {
                    cancellationToken.throwIfCancellationRequested();

                    // If we are past the end, stop looking
                    if (position > end) break;

                    // We found a match.  Make sure it's not part of a larger word (i.e. the char
                    // before and after it have to be a non-identifier char).
                    const endPosition = position + symbolNameLength;

                    if ((position === 0 || !isIdentifierPart(text.charCodeAt(position - 1), ScriptTarget.Latest)) &&
                        (endPosition === sourceLength || !isIdentifierPart(text.charCodeAt(endPosition), ScriptTarget.Latest))) {
                        // Found a real match.  Keep searching.
                        positions.push(position);
                    }
                    position = text.indexOf(symbolName, position + symbolNameLength + 1);
                }

                return positions;
            }

            function getLabelReferencesInNode(container: Node, targetLabel: Identifier): ReferencedSymbol[] {
                const references: ReferenceEntry[] = [];
                const sourceFile = container.getSourceFile();
                const labelName = targetLabel.text;
                const possiblePositions = getPossibleSymbolReferencePositions(sourceFile, labelName, container.getStart(), container.getEnd());
                forEach(possiblePositions, position => {
                    cancellationToken.throwIfCancellationRequested();

                    const node = getTouchingWord(sourceFile, position);
                    if (!node || node.getWidth() !== labelName.length) {
                        return;
                    }

                    // Only pick labels that are either the target label, or have a target that is the target label
                    if (node === targetLabel ||
                        (isJumpStatementTarget(node) && getTargetLabel(node, labelName) === targetLabel)) {
                        references.push(getReferenceEntryFromNode(node));
                    }
                });

                const definition: DefinitionInfo = {
                    containerKind: "",
                    containerName: "",
                    fileName: targetLabel.getSourceFile().fileName,
                    kind: ScriptElementKind.label,
                    name: labelName,
                    textSpan: createTextSpanFromBounds(targetLabel.getStart(), targetLabel.getEnd())
                };

                return [{ definition, references }];
            }

            function isValidReferencePosition(node: Node, searchSymbolName: string): boolean {
                if (node) {
                    // Compare the length so we filter out strict superstrings of the symbol we are looking for
                    switch (node.kind) {
                        case SyntaxKind.Identifier:
                            return node.getWidth() === searchSymbolName.length;

                        case SyntaxKind.StringLiteral:
                            if (isLiteralNameOfPropertyDeclarationOrIndexAccess(node) ||
                                isNameOfExternalModuleImportOrDeclaration(node)) {
                                // For string literals we have two additional chars for the quotes
                                return node.getWidth() === searchSymbolName.length + 2;
                            }
                            break;

                        case SyntaxKind.NumericLiteral:
                            if (isLiteralNameOfPropertyDeclarationOrIndexAccess(node)) {
                                return node.getWidth() === searchSymbolName.length;
                            }
                            break;
                    }
                }

                return false;
            }

            /** Search within node "container" for references for a search value, where the search value is defined as a
              * tuple of(searchSymbol, searchText, searchLocation, and searchMeaning).
              * searchLocation: a node where the search value
              */
            function getReferencesInNode(container: Node,
                searchSymbol: Symbol,
                searchText: string,
                searchLocation: Node,
                searchMeaning: SemanticMeaning,
                findInStrings: boolean,
                findInComments: boolean,
                result: ReferencedSymbol[],
                symbolToIndex: number[]): void {

                const sourceFile = container.getSourceFile();
                const tripleSlashDirectivePrefixRegex = /^\/\/\/\s*</;

                const start = findInComments ? container.getFullStart() : container.getStart();
                const possiblePositions = getPossibleSymbolReferencePositions(sourceFile, searchText, start, container.getEnd());

                if (possiblePositions.length) {
                    // Build the set of symbols to search for, initially it has only the current symbol
                    const searchSymbols = populateSearchSymbolSet(searchSymbol, searchLocation);

                    forEach(possiblePositions, position => {
                        cancellationToken.throwIfCancellationRequested();

                        const referenceLocation = getTouchingPropertyName(sourceFile, position);
                        if (!isValidReferencePosition(referenceLocation, searchText)) {
                            // This wasn't the start of a token.  Check to see if it might be a
                            // match in a comment or string if that's what the caller is asking
                            // for.
                            if ((findInStrings && isInString(sourceFile, position)) ||
                                (findInComments && isInNonReferenceComment(sourceFile, position))) {

                                // In the case where we're looking inside comments/strings, we don't have
                                // an actual definition.  So just use 'undefined' here.  Features like
                                // 'Rename' won't care (as they ignore the definitions), and features like
                                // 'FindReferences' will just filter out these results.
                                result.push({
                                    definition: undefined,
                                    references: [{
                                        fileName: sourceFile.fileName,
                                        textSpan: createTextSpan(position, searchText.length),
                                        isWriteAccess: false,
                                        isDefinition: false
                                    }]
                                });
                            }
                            return;
                        }

                        if (!(getMeaningFromLocation(referenceLocation) & searchMeaning)) {
                            return;
                        }

                        const referenceSymbol = typeChecker.getSymbolAtLocation(referenceLocation);
                        if (referenceSymbol) {
                            const referenceSymbolDeclaration = referenceSymbol.valueDeclaration;
                            const shorthandValueSymbol = typeChecker.getShorthandAssignmentValueSymbol(referenceSymbolDeclaration);
                            const relatedSymbol = getRelatedSymbol(searchSymbols, referenceSymbol, referenceLocation);

                            if (relatedSymbol) {
                                const referencedSymbol = getReferencedSymbol(relatedSymbol);
                                referencedSymbol.references.push(getReferenceEntryFromNode(referenceLocation));
                            }
                            /* Because in short-hand property assignment, an identifier which stored as name of the short-hand property assignment
                             * has two meaning : property name and property value. Therefore when we do findAllReference at the position where
                             * an identifier is declared, the language service should return the position of the variable declaration as well as
                             * the position in short-hand property assignment excluding property accessing. However, if we do findAllReference at the
                             * position of property accessing, the referenceEntry of such position will be handled in the first case.
                             */
                            else if (!(referenceSymbol.flags & SymbolFlags.Transient) && searchSymbols.indexOf(shorthandValueSymbol) >= 0) {
                                const referencedSymbol = getReferencedSymbol(shorthandValueSymbol);
                                referencedSymbol.references.push(getReferenceEntryFromNode(referenceSymbolDeclaration.name));
                            }
                        }
                    });
                }

                return;
=======
>>>>>>> 42515c717dd931efade8febbe29d4ebd3ffb013d

                        // We do not support the scenario where a host can modify a registered
                        // file's script kind, i.e. in one project some file is treated as ".ts"
                        // and in another as ".js"
                        Debug.assert(hostFileInformation.scriptKind === oldSourceFile.scriptKind, "Registered script kind (" + oldSourceFile.scriptKind + ") should match new script kind (" + hostFileInformation.scriptKind + ") for file: " + path);

                        return documentRegistry.updateDocumentWithKey(fileName, path, newSettings, documentRegistryBucketKey, hostFileInformation.scriptSnapshot, hostFileInformation.version, hostFileInformation.scriptKind);
                    }

                    // We didn't already have the file.  Fall through and acquire it from the registry.
                }

                // Could not find this file in the old program, create a new SourceFile for it.
                return documentRegistry.acquireDocumentWithKey(fileName, path, newSettings, documentRegistryBucketKey, hostFileInformation.scriptSnapshot, hostFileInformation.version, hostFileInformation.scriptKind);
            }

            function sourceFileUpToDate(sourceFile: SourceFile): boolean {
                if (!sourceFile) {
                    return false;
                }
                const path = sourceFile.path || toPath(sourceFile.fileName, currentDirectory, getCanonicalFileName);
                return sourceFile.version === hostCache.getVersion(path);
            }

            function programUpToDate(): boolean {
                // If we haven't create a program yet, then it is not up-to-date
                if (!program) {
                    return false;
                }

                // If number of files in the program do not match, it is not up-to-date
                const rootFileNames = hostCache.getRootFileNames();
                if (program.getSourceFiles().length !== rootFileNames.length) {
                    return false;
                }

                // If any file is not up-to-date, then the whole program is not up-to-date
                for (const fileName of rootFileNames) {
                    if (!sourceFileUpToDate(program.getSourceFile(fileName))) {
                        return false;
                    }
                }

                // If the compilation settings do no match, then the program is not up-to-date
                return compareDataObjects(program.getCompilerOptions(), hostCache.compilationSettings());
            }
        }

        function getProgram(): Program {
            synchronizeHostData();

            return program;
        }

        function cleanupSemanticCache(): void {
            // TODO: Should we jettison the program (or it's type checker) here?
        }

        function dispose(): void {
            if (program) {
                forEach(program.getSourceFiles(), f =>
                    documentRegistry.releaseDocument(f.fileName, program.getCompilerOptions()));
            }
        }

        /// Diagnostics
        function getSyntacticDiagnostics(fileName: string) {
            synchronizeHostData();

            return program.getSyntacticDiagnostics(getValidSourceFile(fileName), cancellationToken);
        }

        /**
         * getSemanticDiagnostics return array of Diagnostics. If '-d' is not enabled, only report semantic errors
         * If '-d' enabled, report both semantic and emitter errors
         */
        function getSemanticDiagnostics(fileName: string): Diagnostic[] {
            synchronizeHostData();

            const targetSourceFile = getValidSourceFile(fileName);

            // Only perform the action per file regardless of '-out' flag as LanguageServiceHost is expected to call this function per file.
            // Therefore only get diagnostics for given file.

            const semanticDiagnostics = program.getSemanticDiagnostics(targetSourceFile, cancellationToken);
            if (!program.getCompilerOptions().declaration) {
                return semanticDiagnostics;
            }

            // If '-d' is enabled, check for emitter error. One example of emitter error is export class implements non-export interface
            const declarationDiagnostics = program.getDeclarationDiagnostics(targetSourceFile, cancellationToken);
            return concatenate(semanticDiagnostics, declarationDiagnostics);
        }

        function getCompilerOptionsDiagnostics() {
            synchronizeHostData();
            return program.getOptionsDiagnostics(cancellationToken).concat(
                   program.getGlobalDiagnostics(cancellationToken));
        }

        function getCompletionsAtPosition(fileName: string, position: number): CompletionInfo {
            synchronizeHostData();
            return Completions.getCompletionsAtPosition(host, program.getTypeChecker(), log, program.getCompilerOptions(), getValidSourceFile(fileName), position);
        }

        function getCompletionEntryDetails(fileName: string, position: number, entryName: string): CompletionEntryDetails {
            synchronizeHostData();
            return Completions.getCompletionEntryDetails(program.getTypeChecker(), log, program.getCompilerOptions(), getValidSourceFile(fileName), position, entryName);
        }

        function getCompletionEntrySymbol(fileName: string, position: number, entryName: string): Symbol {
            synchronizeHostData();
            return Completions.getCompletionEntrySymbol(program.getTypeChecker(), log, program.getCompilerOptions(), getValidSourceFile(fileName), position, entryName);
        }

        function getQuickInfoAtPosition(fileName: string, position: number): QuickInfo {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);
            const node = getTouchingPropertyName(sourceFile, position);
            if (node === sourceFile) {
                return undefined;
            }

            if (isLabelName(node)) {
                return undefined;
            }

            const typeChecker = program.getTypeChecker();
            const symbol = typeChecker.getSymbolAtLocation(node);

            if (!symbol || typeChecker.isUnknownSymbol(symbol)) {
                // Try getting just type at this position and show
                switch (node.kind) {
                    case SyntaxKind.Identifier:
                    case SyntaxKind.PropertyAccessExpression:
                    case SyntaxKind.QualifiedName:
                    case SyntaxKind.ThisKeyword:
                    case SyntaxKind.ThisType:
                    case SyntaxKind.SuperKeyword:
                        // For the identifiers/this/super etc get the type at position
                        const type = typeChecker.getTypeAtLocation(node);
                        if (type) {
                            return {
                                kind: ScriptElementKind.unknown,
                                kindModifiers: ScriptElementKindModifier.none,
                                textSpan: createTextSpan(node.getStart(), node.getWidth()),
                                displayParts: typeToDisplayParts(typeChecker, type, getContainerNode(node)),
                                documentation: type.symbol ? type.symbol.getDocumentationComment() : undefined
                            };
                        }
                }

                return undefined;
            }

            const displayPartsDocumentationsAndKind = SymbolDisplay.getSymbolDisplayPartsDocumentationAndSymbolKind(typeChecker, symbol, sourceFile, getContainerNode(node), node);
            return {
                kind: displayPartsDocumentationsAndKind.symbolKind,
                kindModifiers: SymbolDisplay.getSymbolModifiers(symbol),
                textSpan: createTextSpan(node.getStart(), node.getWidth()),
                displayParts: displayPartsDocumentationsAndKind.displayParts,
                documentation: displayPartsDocumentationsAndKind.documentation
            };
        }

        /// Goto definition
        function getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] {
            synchronizeHostData();
            return GoToDefinition.getDefinitionAtPosition(program, getValidSourceFile(fileName), position);
        }

        function getTypeDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] {
            synchronizeHostData();
            return GoToDefinition.getTypeDefinitionAtPosition(program.getTypeChecker(), getValidSourceFile(fileName), position);
        }

        function getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[] {
            let results = getOccurrencesAtPositionCore(fileName, position);

            if (results) {
                const sourceFile = getCanonicalFileName(normalizeSlashes(fileName));

                // Get occurrences only supports reporting occurrences for the file queried.  So
                // filter down to that list.
                results = filter(results, r => getCanonicalFileName(ts.normalizeSlashes(r.fileName)) === sourceFile);
            }

            return results;
        }

        function getDocumentHighlights(fileName: string, position: number, filesToSearch: string[]): DocumentHighlights[] {
            synchronizeHostData();
            const sourceFilesToSearch = map(filesToSearch, f => program.getSourceFile(f));
            const sourceFile = getValidSourceFile(fileName);
            return DocumentHighlights.getDocumentHighlights(program.getTypeChecker(), cancellationToken, sourceFile, position, sourceFilesToSearch);
        }

        /// References and Occurrences
        function getOccurrencesAtPositionCore(fileName: string, position: number): ReferenceEntry[] {
            synchronizeHostData();

            return convertDocumentHighlights(getDocumentHighlights(fileName, position, [fileName]));

            function convertDocumentHighlights(documentHighlights: DocumentHighlights[]): ReferenceEntry[] {
                if (!documentHighlights) {
                    return undefined;
                }

                const result: ReferenceEntry[] = [];
                for (const entry of documentHighlights) {
                    for (const highlightSpan of entry.highlightSpans) {
                        result.push({
                            fileName: entry.fileName,
                            textSpan: highlightSpan.textSpan,
                            isWriteAccess: highlightSpan.kind === HighlightSpanKind.writtenReference,
                            isDefinition: false
                        });
                    }
                }

                return result;
            }
        }

        function findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): RenameLocation[] {
            const referencedSymbols = findReferencedSymbols(fileName, position, findInStrings, findInComments);
            return FindAllReferences.convertReferences(referencedSymbols);
        }

        function getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[] {
            const referencedSymbols = findReferencedSymbols(fileName, position, /*findInStrings*/ false, /*findInComments*/ false);
            return FindAllReferences.convertReferences(referencedSymbols);
        }

        function findReferences(fileName: string, position: number): ReferencedSymbol[] {
            const referencedSymbols = findReferencedSymbols(fileName, position, /*findInStrings*/ false, /*findInComments*/ false);

            // Only include referenced symbols that have a valid definition.
            return filter(referencedSymbols, rs => !!rs.definition);
        }

        function findReferencedSymbols(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): ReferencedSymbol[] {
            synchronizeHostData();
            return FindAllReferences.findReferencedSymbols(program.getTypeChecker(), cancellationToken, program.getSourceFiles(), getValidSourceFile(fileName), position, findInStrings, findInComments);
        }

        /// NavigateTo
        function getNavigateToItems(searchValue: string, maxResultCount?: number): NavigateToItem[] {
            synchronizeHostData();
            const checker = getProgram().getTypeChecker();
            return ts.NavigateTo.getNavigateToItems(program, checker, cancellationToken, searchValue, maxResultCount);
        }

        function getEmitOutput(fileName: string): EmitOutput {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);
            const outputFiles: OutputFile[] = [];

            function writeFile(fileName: string, data: string, writeByteOrderMark: boolean) {
                outputFiles.push({
                    name: fileName,
                    writeByteOrderMark: writeByteOrderMark,
                    text: data
                });
            }

            const emitOutput = program.emit(sourceFile, writeFile, cancellationToken);

            return {
                outputFiles,
                emitSkipped: emitOutput.emitSkipped
            };
        }

        // Signature help
        /**
         * This is a semantic operation.
         */
        function getSignatureHelpItems(fileName: string, position: number): SignatureHelpItems {
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);

            return SignatureHelp.getSignatureHelpItems(program, sourceFile, position, cancellationToken);
        }

        /// Syntactic features
        function getNonBoundSourceFile(fileName: string): SourceFile {
            return syntaxTreeCache.getCurrentSourceFile(fileName);
        }

        function getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan {
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            // Get node at the location
            const node = getTouchingPropertyName(sourceFile, startPos);

            if (node === sourceFile) {
                return;
            }

            switch (node.kind) {
                case SyntaxKind.PropertyAccessExpression:
                case SyntaxKind.QualifiedName:
                case SyntaxKind.StringLiteral:
                case SyntaxKind.FalseKeyword:
                case SyntaxKind.TrueKeyword:
                case SyntaxKind.NullKeyword:
                case SyntaxKind.SuperKeyword:
                case SyntaxKind.ThisKeyword:
                case SyntaxKind.ThisType:
                case SyntaxKind.Identifier:
                    break;

                // Cant create the text span
                default:
                    return;
            }

            let nodeForStartPos = node;
            while (true) {
                if (isRightSideOfPropertyAccess(nodeForStartPos) || isRightSideOfQualifiedName(nodeForStartPos)) {
                    // If on the span is in right side of the the property or qualified name, return the span from the qualified name pos to end of this node
                    nodeForStartPos = nodeForStartPos.parent;
                }
                else if (isNameOfModuleDeclaration(nodeForStartPos)) {
                    // If this is name of a module declarations, check if this is right side of dotted module name
                    // If parent of the module declaration which is parent of this node is module declaration and its body is the module declaration that this node is name of
                    // Then this name is name from dotted module
                    if (nodeForStartPos.parent.parent.kind === SyntaxKind.ModuleDeclaration &&
                        (<ModuleDeclaration>nodeForStartPos.parent.parent).body === nodeForStartPos.parent) {
                        // Use parent module declarations name for start pos
                        nodeForStartPos = (<ModuleDeclaration>nodeForStartPos.parent.parent).name;
                    }
                    else {
                        // We have to use this name for start pos
                        break;
                    }
                }
                else {
                    // Is not a member expression so we have found the node for start pos
                    break;
                }
            }

            return createTextSpanFromBounds(nodeForStartPos.getStart(), node.getEnd());
        }

        function getBreakpointStatementAtPosition(fileName: string, position: number) {
            // doesn't use compiler - no need to synchronize with host
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            return BreakpointResolver.spanInSourceFileAtLocation(sourceFile, position);
        }

        function getNavigationBarItems(fileName: string): NavigationBarItem[] {
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            return NavigationBar.getNavigationBarItems(sourceFile);
        }

        function getSemanticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[] {
            synchronizeHostData();
            return ts.getSemanticClassifications(program.getTypeChecker(), cancellationToken, getValidSourceFile(fileName), program.getClassifiableNames(), span);
        }

        function getEncodedSemanticClassifications(fileName: string, span: TextSpan): Classifications {
            synchronizeHostData();
            return ts.getEncodedSemanticClassifications(program.getTypeChecker(), cancellationToken, getValidSourceFile(fileName), program.getClassifiableNames(), span);
        }

        function getSyntacticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[] {
            // doesn't use compiler - no need to synchronize with host
            return ts.getSyntacticClassifications(cancellationToken, syntaxTreeCache.getCurrentSourceFile(fileName), span);
        }

        function getEncodedSyntacticClassifications(fileName: string, span: TextSpan): Classifications {
            // doesn't use compiler - no need to synchronize with host
            return ts.getEncodedSyntacticClassifications(cancellationToken, syntaxTreeCache.getCurrentSourceFile(fileName), span);
        }

        function getOutliningSpans(fileName: string): OutliningSpan[] {
            // doesn't use compiler - no need to synchronize with host
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            return OutliningElementsCollector.collectElements(sourceFile);
        }

        function getBraceMatchingAtPosition(fileName: string, position: number) {
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            const result: TextSpan[] = [];

            const token = getTouchingToken(sourceFile, position);

            if (token.getStart(sourceFile) === position) {
                const matchKind = getMatchingTokenKind(token);

                // Ensure that there is a corresponding token to match ours.
                if (matchKind) {
                    const parentElement = token.parent;

                    const childNodes = parentElement.getChildren(sourceFile);
                    for (const current of childNodes) {
                        if (current.kind === matchKind) {
                            const range1 = createTextSpan(token.getStart(sourceFile), token.getWidth(sourceFile));
                            const range2 = createTextSpan(current.getStart(sourceFile), current.getWidth(sourceFile));

                            // We want to order the braces when we return the result.
                            if (range1.start < range2.start) {
                                result.push(range1, range2);
                            }
                            else {
                                result.push(range2, range1);
                            }

                            break;
                        }
                    }
                }
            }

            return result;

            function getMatchingTokenKind(token: Node): ts.SyntaxKind {
                switch (token.kind) {
                    case ts.SyntaxKind.OpenBraceToken: return ts.SyntaxKind.CloseBraceToken;
                    case ts.SyntaxKind.OpenParenToken: return ts.SyntaxKind.CloseParenToken;
                    case ts.SyntaxKind.OpenBracketToken: return ts.SyntaxKind.CloseBracketToken;
                    case ts.SyntaxKind.LessThanToken: return ts.SyntaxKind.GreaterThanToken;
                    case ts.SyntaxKind.CloseBraceToken: return ts.SyntaxKind.OpenBraceToken;
                    case ts.SyntaxKind.CloseParenToken: return ts.SyntaxKind.OpenParenToken;
                    case ts.SyntaxKind.CloseBracketToken: return ts.SyntaxKind.OpenBracketToken;
                    case ts.SyntaxKind.GreaterThanToken: return ts.SyntaxKind.LessThanToken;
                }

                return undefined;
            }
        }

        function getIndentationAtPosition(fileName: string, position: number, editorOptions: EditorOptions) {
            let start = timestamp();
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            log("getIndentationAtPosition: getCurrentSourceFile: " + (timestamp() - start));

            start = timestamp();

            const result = formatting.SmartIndenter.getIndentation(position, sourceFile, editorOptions);
            log("getIndentationAtPosition: computeIndentation  : " + (timestamp() - start));

            return result;
        }

        function getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions): TextChange[] {
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            return formatting.formatSelection(start, end, sourceFile, getRuleProvider(options), options);
        }

        function getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions): TextChange[] {
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            return formatting.formatDocument(sourceFile, getRuleProvider(options), options);
        }

        function getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextChange[] {
            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            if (key === "}") {
                return formatting.formatOnClosingCurly(position, sourceFile, getRuleProvider(options), options);
            }
            else if (key === ";") {
                return formatting.formatOnSemicolon(position, sourceFile, getRuleProvider(options), options);
            }
            else if (key === "\n") {
                return formatting.formatOnEnter(position, sourceFile, getRuleProvider(options), options);
            }

            return [];
        }

<<<<<<< HEAD
        function getCodeFixesAtPosition(fileName: string, start: number, end: number, errorCodes: string[]): CodeAction[] {
            synchronizeHostData();
            const sourceFile = getValidSourceFile(fileName);
            const checker = program.getTypeChecker();
            let allFixes: CodeAction[] = [];

            forEach(errorCodes, error => {
                const context = {
                    errorCode: error,
                    sourceFile: sourceFile,
                    span: { start, length: end - start },
                    checker: checker,
                    newLineCharacter: getNewLineOrDefaultFromHost(host)
                };

                const fixes = codeFixProvider.getFixes(context);
                if (fixes) {
                    allFixes = allFixes.concat(fixes);
                }
            });

            return allFixes;
        }

        /**
         * Checks if position points to a valid position to add JSDoc comments, and if so,
         * returns the appropriate template. Otherwise returns an empty string.
         * Valid positions are
         *      - outside of comments, statements, and expressions, and
         *      - preceding a:
         *          - function/constructor/method declaration
         *          - class declarations
         *          - variable statements
         *          - namespace declarations
         *
         * Hosts should ideally check that:
         * - The line is all whitespace up to 'position' before performing the insertion.
         * - If the keystroke sequence "/\*\*" induced the call, we also check that the next
         * non-whitespace character is '*', which (approximately) indicates whether we added
         * the second '*' to complete an existing (JSDoc) comment.
         * @param fileName The file in which to perform the check.
         * @param position The (character-indexed) position in the file where the check should
         * be performed.
         */
=======
>>>>>>> 42515c717dd931efade8febbe29d4ebd3ffb013d
        function getDocCommentTemplateAtPosition(fileName: string, position: number): TextInsertion {
            return JsDoc.getDocCommentTemplateAtPosition(getNewLineOrDefaultFromHost(host), syntaxTreeCache.getCurrentSourceFile(fileName), position);
        }

        function isValidBraceCompletionAtPosition(fileName: string, position: number, openingBrace: number): boolean {
            // '<' is currently not supported, figuring out if we're in a Generic Type vs. a comparison is too
            // expensive to do during typing scenarios
            // i.e. whether we're dealing with:
            //      var x = new foo<| ( with class foo<T>{} )
            // or
            //      var y = 3 <|
            if (openingBrace === CharacterCodes.lessThan) {
                return false;
            }

            const sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            // Check if in a context where we don't want to perform any insertion
            if (isInString(sourceFile, position) || isInComment(sourceFile, position)) {
                return false;
            }

            if (isInsideJsxElementOrAttribute(sourceFile, position)) {
                return openingBrace === CharacterCodes.openBrace;
            }

            if (isInTemplateString(sourceFile, position)) {
                return false;
            }

            return true;
        }

        function getTodoComments(fileName: string, descriptors: TodoCommentDescriptor[]): TodoComment[] {
            // Note: while getting todo comments seems like a syntactic operation, we actually
            // treat it as a semantic operation here.  This is because we expect our host to call
            // this on every single file.  If we treat this syntactically, then that will cause
            // us to populate and throw away the tree in our syntax tree cache for each file.  By
            // treating this as a semantic operation, we can access any tree without throwing
            // anything away.
            synchronizeHostData();

            const sourceFile = getValidSourceFile(fileName);

            cancellationToken.throwIfCancellationRequested();

            const fileContents = sourceFile.text;
            const result: TodoComment[] = [];

            if (descriptors.length > 0) {
                const regExp = getTodoCommentsRegExp();

                let matchArray: RegExpExecArray;
                while (matchArray = regExp.exec(fileContents)) {
                    cancellationToken.throwIfCancellationRequested();

                    // If we got a match, here is what the match array will look like.  Say the source text is:
                    //
                    //      "    // hack   1"
                    //
                    // The result array with the regexp:    will be:
                    //
                    //      ["// hack   1", "// ", "hack   1", undefined, "hack"]
                    //
                    // Here are the relevant capture groups:
                    //  0) The full match for the entire regexp.
                    //  1) The preamble to the message portion.
                    //  2) The message portion.
                    //  3...N) The descriptor that was matched - by index.  'undefined' for each
                    //         descriptor that didn't match.  an actual value if it did match.
                    //
                    //  i.e. 'undefined' in position 3 above means TODO(jason) didn't match.
                    //       "hack"      in position 4 means HACK did match.
                    const firstDescriptorCaptureIndex = 3;
                    Debug.assert(matchArray.length === descriptors.length + firstDescriptorCaptureIndex);

                    const preamble = matchArray[1];
                    const matchPosition = matchArray.index + preamble.length;

                    // OK, we have found a match in the file.  This is only an acceptable match if
                    // it is contained within a comment.
                    const token = getTokenAtPosition(sourceFile, matchPosition);
                    if (!isInsideComment(sourceFile, token, matchPosition)) {
                        continue;
                    }

                    let descriptor: TodoCommentDescriptor = undefined;
                    for (let i = 0, n = descriptors.length; i < n; i++) {
                        if (matchArray[i + firstDescriptorCaptureIndex]) {
                            descriptor = descriptors[i];
                        }
                    }
                    Debug.assert(descriptor !== undefined);

                    // We don't want to match something like 'TODOBY', so we make sure a non
                    // letter/digit follows the match.
                    if (isLetterOrDigit(fileContents.charCodeAt(matchPosition + descriptor.text.length))) {
                        continue;
                    }

                    const message = matchArray[2];
                    result.push({
                        descriptor: descriptor,
                        message: message,
                        position: matchPosition
                    });
                }
            }

            return result;

            function escapeRegExp(str: string): string {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            }

            function getTodoCommentsRegExp(): RegExp {
                // NOTE: ?:  means 'non-capture group'.  It allows us to have groups without having to
                // filter them out later in the final result array.

                // TODO comments can appear in one of the following forms:
                //
                //  1)      // TODO     or  /////////// TODO
                //
                //  2)      /* TODO     or  /********** TODO
                //
                //  3)      /*
                //           *   TODO
                //           */
                //
                // The following three regexps are used to match the start of the text up to the TODO
                // comment portion.
                const singleLineCommentStart = /(?:\/\/+\s*)/.source;
                const multiLineCommentStart = /(?:\/\*+\s*)/.source;
                const anyNumberOfSpacesAndAsterisksAtStartOfLine = /(?:^(?:\s|\*)*)/.source;

                // Match any of the above three TODO comment start regexps.
                // Note that the outermost group *is* a capture group.  We want to capture the preamble
                // so that we can determine the starting position of the TODO comment match.
                const preamble = "(" + anyNumberOfSpacesAndAsterisksAtStartOfLine + "|" + singleLineCommentStart + "|" + multiLineCommentStart + ")";

                // Takes the descriptors and forms a regexp that matches them as if they were literals.
                // For example, if the descriptors are "TODO(jason)" and "HACK", then this will be:
                //
                //      (?:(TODO\(jason\))|(HACK))
                //
                // Note that the outermost group is *not* a capture group, but the innermost groups
                // *are* capture groups.  By capturing the inner literals we can determine after
                // matching which descriptor we are dealing with.
                const literals = "(?:" + map(descriptors, d => "(" + escapeRegExp(d.text) + ")").join("|") + ")";

                // After matching a descriptor literal, the following regexp matches the rest of the
                // text up to the end of the line (or */).
                const endOfLineOrEndOfComment = /(?:$|\*\/)/.source;
                const messageRemainder = /(?:.*?)/.source;

                // This is the portion of the match we'll return as part of the TODO comment result. We
                // match the literal portion up to the end of the line or end of comment.
                const messagePortion = "(" + literals + messageRemainder + ")";
                const regExpString = preamble + messagePortion + endOfLineOrEndOfComment;

                // The final regexp will look like this:
                // /((?:\/\/+\s*)|(?:\/\*+\s*)|(?:^(?:\s|\*)*))((?:(TODO\(jason\))|(HACK))(?:.*?))(?:$|\*\/)/gim

                // The flags of the regexp are important here.
                //  'g' is so that we are doing a global search and can find matches several times
                //  in the input.
                //
                //  'i' is for case insensitivity (We do this to match C# TODO comment code).
                //
                //  'm' is so we can find matches in a multi-line input.
                return new RegExp(regExpString, "gim");
            }

            function isLetterOrDigit(char: number): boolean {
                return (char >= CharacterCodes.a && char <= CharacterCodes.z) ||
                    (char >= CharacterCodes.A && char <= CharacterCodes.Z) ||
                    (char >= CharacterCodes._0 && char <= CharacterCodes._9);
            }
        }

        function getRenameInfo(fileName: string, position: number): RenameInfo {
            synchronizeHostData();
            const defaultLibFileName = host.getDefaultLibFileName(host.getCompilationSettings());
            return Rename.getRenameInfo(program.getTypeChecker(), defaultLibFileName, getCanonicalFileName, getValidSourceFile(fileName), position);
        }

        return {
            dispose,
            cleanupSemanticCache,
            getSyntacticDiagnostics,
            getSemanticDiagnostics,
            getCompilerOptionsDiagnostics,
            getSyntacticClassifications,
            getSemanticClassifications,
            getEncodedSyntacticClassifications,
            getEncodedSemanticClassifications,
            getCompletionsAtPosition,
            getCompletionEntryDetails,
            getCompletionEntrySymbol,
            getSignatureHelpItems,
            getQuickInfoAtPosition,
            getDefinitionAtPosition,
            getTypeDefinitionAtPosition,
            getReferencesAtPosition,
            findReferences,
            getOccurrencesAtPosition,
            getDocumentHighlights,
            getNameOrDottedNameSpan,
            getBreakpointStatementAtPosition,
            getNavigateToItems,
            getRenameInfo,
            findRenameLocations,
            getNavigationBarItems,
            getOutliningSpans,
            getTodoComments,
            getBraceMatchingAtPosition,
            getIndentationAtPosition,
            getFormattingEditsForRange,
            getFormattingEditsForDocument,
            getFormattingEditsAfterKeystroke,
            getDocCommentTemplateAtPosition,
            isValidBraceCompletionAtPosition,
            getCodeFixesAtPosition,
            getEmitOutput,
            getNonBoundSourceFile,
            getProgram
        };
    }

    /* @internal */
    export function getNameTable(sourceFile: SourceFile): Map<number> {
        if (!sourceFile.nameTable) {
            initializeNameTable(sourceFile);
        }

        return sourceFile.nameTable;
    }

    function initializeNameTable(sourceFile: SourceFile): void {
        const nameTable = createMap<number>();

        walk(sourceFile);
        sourceFile.nameTable = nameTable;

        function walk(node: Node) {
            switch (node.kind) {
                case SyntaxKind.Identifier:
                    nameTable[(<Identifier>node).text] = nameTable[(<Identifier>node).text] === undefined ? node.pos : -1;
                    break;
                case SyntaxKind.StringLiteral:
                case SyntaxKind.NumericLiteral:
                    // We want to store any numbers/strings if they were a name that could be
                    // related to a declaration.  So, if we have 'import x = require("something")'
                    // then we want 'something' to be in the name table.  Similarly, if we have
                    // "a['propname']" then we want to store "propname" in the name table.
                    if (isDeclarationName(node) ||
                        node.parent.kind === SyntaxKind.ExternalModuleReference ||
                        isArgumentOfElementAccessExpression(node) ||
                        isLiteralComputedPropertyDeclarationName(node)) {

                        nameTable[(<LiteralExpression>node).text] = nameTable[(<LiteralExpression>node).text] === undefined ? node.pos : -1;
                    }
                    break;
                default:
                    forEachChild(node, walk);
                    if (node.jsDocComments) {
                        for (const jsDocComment of node.jsDocComments) {
                            forEachChild(jsDocComment, walk);
                        }
                    }
            }
        }
    }

    function isArgumentOfElementAccessExpression(node: Node) {
        return node &&
            node.parent &&
            node.parent.kind === SyntaxKind.ElementAccessExpression &&
            (<ElementAccessExpression>node.parent).argumentExpression === node;
    }

    /// getDefaultLibraryFilePath
    declare const __dirname: string;

    /**
      * Get the path of the default library files (lib.d.ts) as distributed with the typescript
      * node package.
      * The functionality is not supported if the ts module is consumed outside of a node module.
      */
    export function getDefaultLibFilePath(options: CompilerOptions): string {
        // Check __dirname is defined and that we are on a node.js system.
        if (typeof __dirname !== "undefined") {
            return __dirname + directorySeparator + getDefaultLibFileName(options);
        }

        throw new Error("getDefaultLibFilePath is only supported when consumed as a node module. ");
    }

    function initializeServices() {
        objectAllocator = getServicesObjectAllocator();
    }

    initializeServices();
}
