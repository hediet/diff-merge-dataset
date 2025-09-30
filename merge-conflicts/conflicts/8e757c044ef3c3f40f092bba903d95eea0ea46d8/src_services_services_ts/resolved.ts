/// <reference path="..\compiler\program.ts"/>

/// <reference path='breakpoints.ts' />
/// <reference path='outliningElementsCollector.ts' />
/// <reference path='navigateTo.ts' />
/// <reference path='navigationBar.ts' />
/// <reference path='patternMatcher.ts' />
/// <reference path='signatureHelp.ts' />
/// <reference path='utilities.ts' />
/// <reference path='formatting\formatting.ts' />
/// <reference path='formatting\smartIndenter.ts' />

module ts {
    /** The version of the language service API */
    export let servicesVersion = "0.4"

    export interface Node {
        getSourceFile(): SourceFile;
        getChildCount(sourceFile?: SourceFile): number;
        getChildAt(index: number, sourceFile?: SourceFile): Node;
        getChildren(sourceFile?: SourceFile): Node[];
        getStart(sourceFile?: SourceFile): number;
        getFullStart(): number;
        getEnd(): number;
        getWidth(sourceFile?: SourceFile): number;
        getFullWidth(): number;
        getLeadingTriviaWidth(sourceFile?: SourceFile): number;
        getFullText(sourceFile?: SourceFile): string;
        getText(sourceFile?: SourceFile): string;
        getFirstToken(sourceFile?: SourceFile): Node;
        getLastToken(sourceFile?: SourceFile): Node;
    }

    export interface Symbol {
        getFlags(): SymbolFlags;
        getName(): string;
        getDeclarations(): Declaration[];
        getDocumentationComment(): SymbolDisplayPart[];
    }

    export interface Type {
        getFlags(): TypeFlags;
        getSymbol(): Symbol;
        getProperties(): Symbol[];
        getProperty(propertyName: string): Symbol;
        getApparentProperties(): Symbol[];
        getCallSignatures(): Signature[];
        getConstructSignatures(): Signature[];
        getStringIndexType(): Type;
        getNumberIndexType(): Type;
    }

    export interface Signature {
        getDeclaration(): SignatureDeclaration;
        getTypeParameters(): Type[];
        getParameters(): Symbol[];
        getReturnType(): Type;
        getDocumentationComment(): SymbolDisplayPart[];
    }

    export interface SourceFile {
        /* @internal */ version: string;
        /* @internal */ scriptSnapshot: IScriptSnapshot;
        /* @internal */ nameTable: Map<string>;

        /* @internal */ getNamedDeclarations(): Map<Declaration[]>;

        getLineAndCharacterOfPosition(pos: number): LineAndCharacter;
        getLineStarts(): number[];
        getPositionOfLineAndCharacter(line: number, character: number): number;
        update(newText: string, textChangeRange: TextChangeRange): SourceFile;
    }

    /**
     * Represents an immutable snapshot of a script at a specified time.Once acquired, the 
     * snapshot is observably immutable. i.e. the same calls with the same parameters will return
     * the same values.
     */
    export interface IScriptSnapshot {
        /** Gets a portion of the script snapshot specified by [start, end). */
        getText(start: number, end: number): string;

        /** Gets the length of this script snapshot. */
        getLength(): number;

        /**
         * Gets the TextChangeRange that describe how the text changed between this text and 
         * an older version.  This information is used by the incremental parser to determine
         * what sections of the script need to be re-parsed.  'undefined' can be returned if the 
         * change range cannot be determined.  However, in that case, incremental parsing will
         * not happen and the entire document will be re - parsed.
         */
        getChangeRange(oldSnapshot: IScriptSnapshot): TextChangeRange;
    }

    export module ScriptSnapshot {
        class StringScriptSnapshot implements IScriptSnapshot {
            private _lineStartPositions: number[] = undefined;

            constructor(private text: string) {
            }

            public getText(start: number, end: number): string {
                return this.text.substring(start, end);
            }

            public getLength(): number {
                return this.text.length;
            }

            public getChangeRange(oldSnapshot: IScriptSnapshot): TextChangeRange {
                // Text-based snapshots do not support incremental parsing. Return undefined
                // to signal that to the caller.
                return undefined;
            }
        }

        export function fromString(text: string): IScriptSnapshot {
            return new StringScriptSnapshot(text);
        }
    }
    export interface PreProcessedFileInfo {
        referencedFiles: FileReference[];
        importedFiles: FileReference[];
        isLibFile: boolean
    }

    let scanner: Scanner = createScanner(ScriptTarget.Latest, /*skipTrivia*/ true);

    let emptyArray: any[] = [];

    function createNode(kind: SyntaxKind, pos: number, end: number, flags: NodeFlags, parent?: Node): NodeObject {
        let node = <NodeObject> new (getNodeConstructor(kind))();
        node.pos = pos;
        node.end = end;
        node.flags = flags;
        node.parent = parent;
        return node;
    }

    class NodeObject implements Node {
        public kind: SyntaxKind;
        public pos: number;
        public end: number;
        public flags: NodeFlags;
        public parent: Node;
        private _children: Node[];

        public getSourceFile(): SourceFile {
            return getSourceFileOfNode(this);
        }

        public getStart(sourceFile?: SourceFile): number {
            return getTokenPosOfNode(this, sourceFile);
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
            return this.end - this.getFullStart();
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

        private addSyntheticNodes(nodes: Node[], pos: number, end: number): number {
            scanner.setTextPos(pos);
            while (pos < end) {
                let token = scanner.scan();
                let textPos = scanner.getTextPos();
                nodes.push(createNode(token, pos, textPos, NodeFlags.Synthetic, this));
                pos = textPos;
            }
            return pos;
        }

        private createSyntaxList(nodes: NodeArray<Node>): Node {
            let list = createNode(SyntaxKind.SyntaxList, nodes.pos, nodes.end, NodeFlags.Synthetic, this);
            list._children = [];
            let pos = nodes.pos;
            for (let node of nodes) {
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
                let processNode = (node: Node) => {
                    if (pos < node.pos) {
                        pos = this.addSyntheticNodes(children, pos, node.pos);
                    }
                    children.push(node);
                    pos = node.end;
                };
                let processNodes = (nodes: NodeArray<Node>) => {
                    if (pos < nodes.pos) {
                        pos = this.addSyntheticNodes(children, pos, nodes.pos);
                    }
                    children.push(this.createSyntaxList(<NodeArray<Node>>nodes));
                    pos = nodes.end;
                };
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
            let children = this.getChildren();
            for (let child of children) {
                if (child.kind < SyntaxKind.FirstNode) {
                    return child;
                }

                return child.getFirstToken(sourceFile);
            }
        }

        public getLastToken(sourceFile?: SourceFile): Node {
            let children = this.getChildren(sourceFile);
            for (let i = children.length - 1; i >= 0; i--) {
                let child = children[i];
                if (child.kind < SyntaxKind.FirstNode) {
                    return child;
                }

                return child.getLastToken(sourceFile);
            }
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
                this.documentationComment = getJsDocCommentsFromDeclarations(this.declarations, this.name, !(this.flags & SymbolFlags.Property));
            }

            return this.documentationComment;
        }
    }

    function getJsDocCommentsFromDeclarations(declarations: Declaration[], name: string, canUseParsedParamTagComments: boolean) {
        let documentationComment = <SymbolDisplayPart[]>[];
        let docComments = getJsDocCommentsSeparatedByNewLines();
        ts.forEach(docComments, docComment => {
            if (documentationComment.length) {
                documentationComment.push(lineBreakPart());
            }
            documentationComment.push(docComment);
        });

        return documentationComment;

        function getJsDocCommentsSeparatedByNewLines() {
            let paramTag = "@param";
            let jsDocCommentParts: SymbolDisplayPart[] = [];

            ts.forEach(declarations, (declaration, indexOfDeclaration) => {
                // Make sure we are collecting doc comment from declaration once,
                // In case of union property there might be same declaration multiple times 
                // which only varies in type parameter
                // Eg. let a: Array<string> | Array<number>; a.length
                // The property length will have two declarations of property length coming 
                // from Array<T> - Array<string> and Array<number>
                if (indexOf(declarations, declaration) === indexOfDeclaration) {
                    let sourceFileOfDeclaration = getSourceFileOfNode(declaration);
                    // If it is parameter - try and get the jsDoc comment with @param tag from function declaration's jsDoc comments
                    if (canUseParsedParamTagComments && declaration.kind === SyntaxKind.Parameter) {
                        ts.forEach(getJsDocCommentTextRange(declaration.parent, sourceFileOfDeclaration), jsDocCommentTextRange => {
                            let cleanedParamJsDocComment = getCleanedParamJsDocComment(jsDocCommentTextRange.pos, jsDocCommentTextRange.end, sourceFileOfDeclaration);
                            if (cleanedParamJsDocComment) {
                                jsDocCommentParts.push.apply(jsDocCommentParts, cleanedParamJsDocComment);
                            }
                        });
                    }

                    // If this is left side of dotted module declaration, there is no doc comments associated with this node
                    if (declaration.kind === SyntaxKind.ModuleDeclaration && (<ModuleDeclaration>declaration).body.kind === SyntaxKind.ModuleDeclaration) {
                        return;
                    }

                    // If this is dotted module name, get the doc comments from the parent
                    while (declaration.kind === SyntaxKind.ModuleDeclaration && declaration.parent.kind === SyntaxKind.ModuleDeclaration) {
                        declaration = <ModuleDeclaration>declaration.parent;
                    } 

                    // Get the cleaned js doc comment text from the declaration
                    ts.forEach(getJsDocCommentTextRange(
                        declaration.kind === SyntaxKind.VariableDeclaration ? declaration.parent.parent : declaration, sourceFileOfDeclaration), jsDocCommentTextRange => {
                            let cleanedJsDocComment = getCleanedJsDocComment(jsDocCommentTextRange.pos, jsDocCommentTextRange.end, sourceFileOfDeclaration);
                            if (cleanedJsDocComment) {
                                jsDocCommentParts.push.apply(jsDocCommentParts, cleanedJsDocComment);
                            }
                        });
                }
            });

            return jsDocCommentParts;

            function getJsDocCommentTextRange(node: Node, sourceFile: SourceFile): TextRange[] {
                return ts.map(getJsDocComments(node, sourceFile),
                    jsDocComment => {
                        return {
                            pos: jsDocComment.pos + "/*".length, // Consume /* from the comment
                            end: jsDocComment.end - "*/".length // Trim off comment end indicator 
                        };
                    });
            }

            function consumeWhiteSpacesOnTheLine(pos: number, end: number, sourceFile: SourceFile, maxSpacesToRemove?: number) {
                if (maxSpacesToRemove !== undefined) {
                    end = Math.min(end, pos + maxSpacesToRemove);
                }

                for (; pos < end; pos++) {
                    let ch = sourceFile.text.charCodeAt(pos);
                    if (!isWhiteSpace(ch) || isLineBreak(ch)) {
                        // Either found lineBreak or non whiteSpace
                        return pos;
                    }
                }

                return end;
            }

            function consumeLineBreaks(pos: number, end: number, sourceFile: SourceFile) {
                while (pos < end && isLineBreak(sourceFile.text.charCodeAt(pos))) {
                    pos++;
                }

                return pos;
            }

            function isName(pos: number, end: number, sourceFile: SourceFile, name: string) {
                return pos + name.length < end &&
                    sourceFile.text.substr(pos, name.length) === name &&
                    (isWhiteSpace(sourceFile.text.charCodeAt(pos + name.length)) ||
                        isLineBreak(sourceFile.text.charCodeAt(pos + name.length)));
            }

            function isParamTag(pos: number, end: number, sourceFile: SourceFile) {
                // If it is @param tag
                return isName(pos, end, sourceFile, paramTag);
            }

            function pushDocCommentLineText(docComments: SymbolDisplayPart[], text: string, blankLineCount: number) {
                // Add the empty lines in between texts
                while (blankLineCount--) {
                    docComments.push(textPart(""));
                }

                docComments.push(textPart(text));
            }

            function getCleanedJsDocComment(pos: number, end: number, sourceFile: SourceFile) {
                let spacesToRemoveAfterAsterisk: number;
                let docComments: SymbolDisplayPart[] = [];
                let blankLineCount = 0;
                let isInParamTag = false;

                while (pos < end) {
                    let docCommentTextOfLine = "";
                    // First consume leading white space
                    pos = consumeWhiteSpacesOnTheLine(pos, end, sourceFile);

                    // If the comment starts with '*' consume the spaces on this line
                    if (pos < end && sourceFile.text.charCodeAt(pos) === CharacterCodes.asterisk) {
                        let lineStartPos = pos + 1;
                        pos = consumeWhiteSpacesOnTheLine(pos + 1, end, sourceFile, spacesToRemoveAfterAsterisk);

                        // Set the spaces to remove after asterisk as margin if not already set
                        if (spacesToRemoveAfterAsterisk === undefined && pos < end && !isLineBreak(sourceFile.text.charCodeAt(pos))) {
                            spacesToRemoveAfterAsterisk = pos - lineStartPos;
                        }
                    }
                    else if (spacesToRemoveAfterAsterisk === undefined) {
                        spacesToRemoveAfterAsterisk = 0;
                    }

                    // Analyse text on this line
                    while (pos < end && !isLineBreak(sourceFile.text.charCodeAt(pos))) {
                        let ch = sourceFile.text.charAt(pos);
                        if (ch === "@") {
                            // If it is @param tag
                            if (isParamTag(pos, end, sourceFile)) {
                                isInParamTag = true;
                                pos += paramTag.length;
                                continue;
                            }
                            else {
                                isInParamTag = false;
                            }
                        }

                        // Add the ch to doc text if we arent in param tag
                        if (!isInParamTag) {
                            docCommentTextOfLine += ch;
                        }

                        // Scan next character
                        pos++;
                    }

                    // Continue with next line
                    pos = consumeLineBreaks(pos, end, sourceFile);
                    if (docCommentTextOfLine) {
                        pushDocCommentLineText(docComments, docCommentTextOfLine, blankLineCount);
                        blankLineCount = 0;
                    }
                    else if (!isInParamTag && docComments.length) { 
                        // This is blank line when there is text already parsed
                        blankLineCount++;
                    }
                }

                return docComments;
            }

            function getCleanedParamJsDocComment(pos: number, end: number, sourceFile: SourceFile) {
                let paramHelpStringMargin: number;
                let paramDocComments: SymbolDisplayPart[] = [];
                while (pos < end) {
                    if (isParamTag(pos, end, sourceFile)) {
                        let blankLineCount = 0;
                        let recordedParamTag = false;
                        // Consume leading spaces 
                        pos = consumeWhiteSpaces(pos + paramTag.length);
                        if (pos >= end) {
                            break;
                        }

                        // Ignore type expression
                        if (sourceFile.text.charCodeAt(pos) === CharacterCodes.openBrace) {
                            pos++;
                            for (let curlies = 1; pos < end; pos++) {
                                let charCode = sourceFile.text.charCodeAt(pos);

                                // { character means we need to find another } to match the found one
                                if (charCode === CharacterCodes.openBrace) {
                                    curlies++;
                                    continue;
                                }

                                // } char
                                if (charCode === CharacterCodes.closeBrace) {
                                    curlies--;
                                    if (curlies === 0) {
                                        // We do not have any more } to match the type expression is ignored completely
                                        pos++;
                                        break;
                                    }
                                    else {
                                        // there are more { to be matched with }
                                        continue;
                                    }
                                }

                                // Found start of another tag
                                if (charCode === CharacterCodes.at) {
                                    break;
                                }
                            }

                            // Consume white spaces
                            pos = consumeWhiteSpaces(pos);
                            if (pos >= end) {
                                break;
                            }
                        }

                        // Parameter name
                        if (isName(pos, end, sourceFile, name)) {
                            // Found the parameter we are looking for consume white spaces
                            pos = consumeWhiteSpaces(pos + name.length);
                            if (pos >= end) {
                                break;
                            }

                            let paramHelpString = "";
                            let firstLineParamHelpStringPos = pos;
                            while (pos < end) {
                                let ch = sourceFile.text.charCodeAt(pos);

                                // at line break, set this comment line text and go to next line 
                                if (isLineBreak(ch)) {
                                    if (paramHelpString) {
                                        pushDocCommentLineText(paramDocComments, paramHelpString, blankLineCount);
                                        paramHelpString = "";
                                        blankLineCount = 0;
                                        recordedParamTag = true;
                                    }
                                    else if (recordedParamTag) {
                                        blankLineCount++;
                                    }

                                    // Get the pos after cleaning start of the line
                                    setPosForParamHelpStringOnNextLine(firstLineParamHelpStringPos);
                                    continue;
                                }

                                // Done scanning param help string - next tag found
                                if (ch === CharacterCodes.at) {
                                    break;
                                }

                                paramHelpString += sourceFile.text.charAt(pos);

                                // Go to next character
                                pos++;
                            }

                            // If there is param help text, add it top the doc comments
                            if (paramHelpString) {
                                pushDocCommentLineText(paramDocComments, paramHelpString, blankLineCount);
                            }
                            paramHelpStringMargin = undefined;
                        }

                        // If this is the start of another tag, continue with the loop in seach of param tag with symbol name
                        if (sourceFile.text.charCodeAt(pos) === CharacterCodes.at) {
                            continue;
                        }
                    }

                    // Next character
                    pos++;
                }

                return paramDocComments;

                function consumeWhiteSpaces(pos: number) {
                    while (pos < end && isWhiteSpace(sourceFile.text.charCodeAt(pos))) {
                        pos++;
                    }

                    return pos;
                }

                function setPosForParamHelpStringOnNextLine(firstLineParamHelpStringPos: number) {
                    // Get the pos after consuming line breaks
                    pos = consumeLineBreaks(pos, end, sourceFile);
                    if (pos >= end) {
                        return;
                    }

                    if (paramHelpStringMargin === undefined) {
                        paramHelpStringMargin = sourceFile.getLineAndCharacterOfPosition(firstLineParamHelpStringPos).character;
                    }

                    // Now consume white spaces max 
                    let startOfLinePos = pos;
                    pos = consumeWhiteSpacesOnTheLine(pos, end, sourceFile, paramHelpStringMargin);
                    if (pos >= end) {
                        return;
                    }

                    let consumedSpaces = pos - startOfLinePos;
                    if (consumedSpaces < paramHelpStringMargin) {
                        let ch = sourceFile.text.charCodeAt(pos);
                        if (ch === CharacterCodes.asterisk) {
                            // Consume more spaces after asterisk
                            pos = consumeWhiteSpacesOnTheLine(pos + 1, end, sourceFile, paramHelpStringMargin - consumedSpaces - 1);
                        }
                    }
                }
            }
        }
    }

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
    }

    class SignatureObject implements Signature {
        checker: TypeChecker;
        declaration: SignatureDeclaration;
        typeParameters: TypeParameter[];
        parameters: Symbol[];
        resolvedReturnType: Type;
        minArgumentCount: number;
        hasRestParameter: boolean;
        hasStringLiterals: boolean;

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
                this.documentationComment = this.declaration ? getJsDocCommentsFromDeclarations(
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
        public text: string;
        public scriptSnapshot: IScriptSnapshot;
        public lineMap: number[];

        public statements: NodeArray<Statement>;
        public endOfFileToken: Node;

        public amdDependencies: { name: string; path: string }[];
        public amdModuleName: string;
        public referencedFiles: FileReference[];

        public syntacticDiagnostics: Diagnostic[];
        public referenceDiagnostics: Diagnostic[];
        public parseDiagnostics: Diagnostic[];
        public bindDiagnostics: Diagnostic[];

        public hasNoDefaultLib: boolean;
        public externalModuleIndicator: Node; // The first node that causes this file to be an external module
        public nodeCount: number;
        public identifierCount: number;
        public symbolCount: number;
        public version: string;
        public languageVersion: ScriptTarget;
        public identifiers: Map<string>;
        public nameTable: Map<string>;

        private namedDeclarations: Map<Declaration[]>;

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
            let result: Map<Declaration[]> = {};

            forEachChild(this, visit);

            return result;

            function addDeclaration(declaration: Declaration) {
                let name = getDeclarationName(declaration);
                if (name) {
                    let declarations = getDeclarations(name);
                    declarations.push(declaration);
                }
            }

            function getDeclarations(name: string) {
                return getProperty(result, name) || (result[name] = []);
            }

            function getDeclarationName(declaration: Declaration) {
                if (declaration.name) {
                    let result = getTextOfIdentifierOrLiteral(declaration.name);
                    if (result !== undefined) {
                        return result;
                    }

                    if (declaration.name.kind === SyntaxKind.ComputedPropertyName) {
                        let expr = (<ComputedPropertyName>declaration.name).expression;
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
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                        let functionDeclaration = <FunctionLikeDeclaration>node;
                        let declarationName = getDeclarationName(functionDeclaration);

                        if (declarationName) {
                            let declarations = getDeclarations(declarationName);
                            let lastDeclaration = lastOrUndefined(declarations);

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
                        // fall through
                    case SyntaxKind.Constructor:
                    case SyntaxKind.VariableStatement:
                    case SyntaxKind.VariableDeclarationList:
                    case SyntaxKind.ObjectBindingPattern:
                    case SyntaxKind.ArrayBindingPattern:
                    case SyntaxKind.ModuleBlock:
                        forEachChild(node, visit);
                        break;

                    case SyntaxKind.Block:
                        if (isFunctionBlock(node)) {
                            forEachChild(node, visit);
                        }
                        break;

                    case SyntaxKind.Parameter:
                        // Only consider properties defined as constructor parameters
                        if (!(node.flags & NodeFlags.AccessibilityModifier)) {
                            break;
                        }
                    // fall through
                    case SyntaxKind.VariableDeclaration:
                    case SyntaxKind.BindingElement:
                        if (isBindingPattern((<VariableDeclaration>node).name)) {
                            forEachChild((<VariableDeclaration>node).name, visit);
                            break;
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
                        let importClause = (<ImportDeclaration>node).importClause;
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
                }
            }
        }
    }

    //
    // Public interface of the host of a language service instance.
    //
    export interface LanguageServiceHost {
        getCompilationSettings(): CompilerOptions;
        getNewLine?(): string;
        getScriptFileNames(): string[];
        getScriptVersion(fileName: string): string;
        getScriptSnapshot(fileName: string): IScriptSnapshot;
        getLocalizedDiagnosticMessages?(): any;
        getCancellationToken?(): CancellationToken;
        getCurrentDirectory(): string;
        getDefaultLibFileName(options: CompilerOptions): string;
        log? (s: string): void;
        trace? (s: string): void;
        error? (s: string): void;
    }

    //
    // Public services of a language service instance associated
    // with a language service host instance
    //
    export interface LanguageService {
        cleanupSemanticCache(): void;

        getSyntacticDiagnostics(fileName: string): Diagnostic[];
        getSemanticDiagnostics(fileName: string): Diagnostic[];
        getCompilerOptionsDiagnostics(): Diagnostic[];

        getSyntacticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];
        getSemanticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[];

        getCompletionsAtPosition(fileName: string, position: number): CompletionInfo;
        getCompletionEntryDetails(fileName: string, position: number, entryName: string): CompletionEntryDetails;

        getQuickInfoAtPosition(fileName: string, position: number): QuickInfo;

        getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan;

        getBreakpointStatementAtPosition(fileName: string, position: number): TextSpan;

        getSignatureHelpItems(fileName: string, position: number): SignatureHelpItems;

        getRenameInfo(fileName: string, position: number): RenameInfo;
        findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): RenameLocation[];

        getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[];
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

        getEmitOutput(fileName: string): EmitOutput;

        getProgram(): Program;

        getSourceFile(fileName: string): SourceFile;

        dispose(): void;
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

    export interface RenameLocation {
        textSpan: TextSpan;
        fileName: string;
    }

    export interface ReferenceEntry {
        textSpan: TextSpan;
        fileName: string;
        isWriteAccess: boolean;
    }

    export interface DocumentHighlights {
        fileName: string;
        highlightSpans: HighlightSpan[];
    }

    export module HighlightSpanKind {
        export const none = "none";
        export const definition = "definition";
        export const reference = "reference";
        export const writtenReference = "writtenReference";
    } 

    export interface HighlightSpan {
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
        IndentSize: number;
        TabSize: number;
        NewLineCharacter: string;
        ConvertTabsToSpaces: boolean;
    }

    export interface FormatCodeOptions extends EditorOptions {
        InsertSpaceAfterCommaDelimiter: boolean;
        InsertSpaceAfterSemicolonInForStatements: boolean;
        InsertSpaceBeforeAndAfterBinaryOperators: boolean;
        InsertSpaceAfterKeywordsInControlFlowStatements: boolean;
        InsertSpaceAfterFunctionKeywordForAnonymousFunctions: boolean;
        InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: boolean;
        PlaceOpenBraceOnNewLineForFunctions: boolean;
        PlaceOpenBraceOnNewLineForControlBlocks: boolean;
        [s: string]: boolean | number| string;
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
        Start,
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
         */
        getClassificationsForLine(text: string, lexState: EndOfLineState, syntacticClassifierAbsent: boolean): ClassificationResult;
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
            version: string): SourceFile;

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
            version: string): SourceFile;

        /**
          * Informs the DocumentRegistry that a file is not needed any longer.
          *
          * Note: It is not allowed to call release on a SourceFile that was not acquired from
          * this registry originally.
          *
          * @param fileName The name of the file to be released
          * @param compilationSettings The compilation settings used to acquire the file
          */
        releaseDocument(fileName: string, compilationSettings: CompilerOptions): void
    }

    // TODO: move these to enums
    export module ScriptElementKind {
        export const unknown = "";
        export const warning = "warning";

        // predefined type (void) or keyword (class)
        export const keyword = "keyword";

        // top level script node
        export const scriptElement = "script";

        // module foo {}
        export const moduleElement = "module";

        // class X {}
        export const classElement = "class";

        // interface Y {}
        export const interfaceElement = "interface";

        // type T = ...
        export const typeElement = "type";

        // enum E
        export const enumElement = "enum";

        // Inside module and script only
        // let v = ..
        export const variableElement = "var";

        // Inside function
        export const localVariableElement = "local var";

        // Inside module and script only
        // function f() { }
        export const functionElement = "function";

        // Inside function
        export const localFunctionElement = "local function";

        // class X { [public|private]* foo() {} }
        export const memberFunctionElement = "method";

        // class X { [public|private]* [get|set] foo:number; }
        export const memberGetAccessorElement = "getter";
        export const memberSetAccessorElement = "setter";

        // class X { [public|private]* foo:number; }
        // interface Y { foo:number; }
        export const memberVariableElement = "property";

        // class X { constructor() { } }
        export const constructorImplementationElement = "constructor";

        // interface Y { ():number; }
        export const callSignatureElement = "call";

        // interface Y { []:number; }
        export const indexSignatureElement = "index";

        // interface Y { new():Y; }
        export const constructSignatureElement = "construct";

        // function foo(*Y*: string)
        export const parameterElement = "parameter";

        export const typeParameterElement = "type parameter";

        export const primitiveType = "primitive type";

        export const label = "label";

        export const alias = "alias";

        export const constElement = "const";

        export const letElement = "let";
    }

    export module ScriptElementKindModifier {
        export const none = "";
        export const publicMemberModifier = "public";
        export const privateMemberModifier = "private";
        export const protectedMemberModifier = "protected";
        export const exportedModifier = "export";
        export const ambientModifier = "declare";
        export const staticModifier = "static";
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
        public static typeAlias = "type alias name";
    }

    /// Language Service

    interface FormattingOptions {
        useTabs: boolean;
        spacesPerTab: number;
        indentSpaces: number;
        newLineCharacter: string;
    }

    // Information about a specific host file.
    interface HostFileInformation {
        hostFileName: string;
        version: string;
        scriptSnapshot: IScriptSnapshot;
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
            module: ModuleKind.None,
        };
    }

    export class OperationCanceledException { }

    export class CancellationTokenObject {

        public static None: CancellationTokenObject = new CancellationTokenObject(null)

        constructor(private cancellationToken: CancellationToken) {
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

    // Cache host information about scrip Should be refreshed 
    // at each language service public entry point, since we don't know when 
    // set of scripts handled by the host changes.
    class HostCache {
        private fileNameToEntry: Map<HostFileInformation>;
        private _compilationSettings: CompilerOptions;

        constructor(private host: LanguageServiceHost) {
            // script id => script index
            this.fileNameToEntry = {};

            // Initialize the list with the root file names
            let rootFileNames = host.getScriptFileNames();
            for (let fileName of rootFileNames) {
                this.createEntry(fileName);
            }

            // store the compilation settings
            this._compilationSettings = host.getCompilationSettings() || getDefaultCompilerOptions();
        }

        public compilationSettings() {
            return this._compilationSettings;
        }

        private createEntry(fileName: string) {
            let entry: HostFileInformation;
            let scriptSnapshot = this.host.getScriptSnapshot(fileName);
            if (scriptSnapshot) {
                entry = {
                    hostFileName: fileName,
                    version: this.host.getScriptVersion(fileName),
                    scriptSnapshot: scriptSnapshot
                };
            }

            return this.fileNameToEntry[normalizeSlashes(fileName)] = entry;
        }

        public getEntry(fileName: string): HostFileInformation {
            return lookUp(this.fileNameToEntry, normalizeSlashes(fileName));
        }

        public contains(fileName: string): boolean {
            return hasProperty(this.fileNameToEntry, normalizeSlashes(fileName));
        }

        public getOrCreateEntry(fileName: string): HostFileInformation {
            if (this.contains(fileName)) {
                return this.getEntry(fileName);
            }

            return this.createEntry(fileName);
        }

        public getRootFileNames(): string[] {
            let fileNames: string[] = [];

            forEachKey(this.fileNameToEntry, key => {
                if (hasProperty(this.fileNameToEntry, key) && this.fileNameToEntry[key])
                    fileNames.push(key);
            });

            return fileNames;
        }

        public getVersion(fileName: string): string {
            let file = this.getEntry(fileName);
            return file && file.version;
        }

        public getScriptSnapshot(fileName: string): IScriptSnapshot {
            let file = this.getEntry(fileName);
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
            let scriptSnapshot = this.host.getScriptSnapshot(fileName);
            if (!scriptSnapshot) {
                // The host does not know about this file.
                throw new Error("Could not find file: '" + fileName + "'.");
            }

            let version = this.host.getScriptVersion(fileName);
            let sourceFile: SourceFile;

            if (this.currentFileName !== fileName) {
                // This is a new file, just parse it
                sourceFile = createLanguageServiceSourceFile(fileName, scriptSnapshot, ScriptTarget.Latest, version, /*setNodeParents:*/ true);
            }
            else if (this.currentFileVersion !== version) {
                // This is the same file, just a newer version. Incrementally parse the file.
                let editRange = scriptSnapshot.getChangeRange(this.currentFileScriptSnapshot);
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

    /*
     * This function will compile source text from 'input' argument using specified compiler options.
     * If not options are provided - it will use a set of default compiler options.
     * Extra compiler options that will unconditionally be used bu this function are:
     * - separateCompilation = true
     * - allowNonTsExtensions = true
     */
    export function transpile(input: string, compilerOptions?: CompilerOptions, fileName?: string, diagnostics?: Diagnostic[]): string {
        let options = compilerOptions ? clone(compilerOptions) : getDefaultCompilerOptions();

        options.separateCompilation = true;

        // Filename can be non-ts file.
        options.allowNonTsExtensions = true;

        // Parse
        var inputFileName = fileName || "module.ts";
        var sourceFile = createSourceFile(inputFileName, input, options.target);

        // Store syntactic diagnostics
        if (diagnostics && sourceFile.parseDiagnostics) {
            diagnostics.push(...sourceFile.parseDiagnostics);
        }

        // Output
        let outputText: string;

        // Create a compilerHost object to allow the compiler to read and write files
        var compilerHost: CompilerHost = {
            getSourceFile: (fileName, target) => fileName === inputFileName ? sourceFile : undefined,
            writeFile: (name, text, writeByteOrderMark) => {
                Debug.assert(outputText === undefined, "Unexpected multiple outputs for the file: " + name);
                outputText = text;
            },
            getDefaultLibFileName: () => "lib.d.ts",
            useCaseSensitiveFileNames: () => false,
            getCanonicalFileName: fileName => fileName,
            getCurrentDirectory: () => "",
            getNewLine: () => (sys && sys.newLine) || "\r\n"
        };

        var program = createProgram([inputFileName], options, compilerHost);

        if (diagnostics) {
            diagnostics.push(...program.getGlobalDiagnostics());
        }

        // Emit
        program.emit();

        Debug.assert(outputText !== undefined, "Output generation failed");

        return outputText;
    }

    export function createLanguageServiceSourceFile(fileName: string, scriptSnapshot: IScriptSnapshot, scriptTarget: ScriptTarget, version: string, setNodeParents: boolean): SourceFile {
        let sourceFile = createSourceFile(fileName, scriptSnapshot.getText(0, scriptSnapshot.getLength()), scriptTarget, setNodeParents);
        setSourceFileFields(sourceFile, scriptSnapshot, version);
        // after full parsing we can use table with interned strings as name table
        sourceFile.nameTable = sourceFile.identifiers;
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
                    let newSourceFile = updateSourceFile(sourceFile, scriptSnapshot.getText(0, scriptSnapshot.getLength()), textChangeRange, aggressiveChecks);
                    setSourceFileFields(newSourceFile, scriptSnapshot, version);
                    // after incremental parsing nameTable might not be up-to-date
                    // drop it so it can be lazily recreated later
                    newSourceFile.nameTable = undefined;
                    return newSourceFile;
                }
            }
        }

        // Otherwise, just create a new source file.
        return createLanguageServiceSourceFile(sourceFile.fileName, scriptSnapshot, sourceFile.languageVersion, version, /*setNodeParents:*/ true);
    }

    export function createDocumentRegistry(): DocumentRegistry {
        // Maps from compiler setting target (ES3, ES5, etc.) to all the cached documents we have
        // for those settings.
        let buckets: Map<Map<DocumentRegistryEntry>> = {};

        function getKeyFromCompilationSettings(settings: CompilerOptions): string {
            return "_" + settings.target; //  + "|" + settings.propagateEnumConstantoString()
        }

        function getBucketForCompilationSettings(settings: CompilerOptions, createIfMissing: boolean): Map<DocumentRegistryEntry> {
            let key = getKeyFromCompilationSettings(settings);
            let bucket = lookUp(buckets, key);
            if (!bucket && createIfMissing) {
                buckets[key] = bucket = {};
            }
            return bucket;
        }

        function reportStats() {
            let bucketInfoArray = Object.keys(buckets).filter(name => name && name.charAt(0) === '_').map(name => {
                let entries = lookUp(buckets, name);
                let sourceFiles: { name: string; refCount: number; references: string[]; }[] = [];
                for (let i in entries) {
                    let entry = entries[i];
                    sourceFiles.push({
                        name: i,
                        refCount: entry.languageServiceRefCount,
                        references: entry.owners.slice(0)
                    });
                }
                sourceFiles.sort((x, y) => y.refCount - x.refCount);
                return {
                    bucket: name,
                    sourceFiles
                };
            });
            return JSON.stringify(bucketInfoArray, null, 2);
        }

        function acquireDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: IScriptSnapshot, version: string): SourceFile {
            return acquireOrUpdateDocument(fileName, compilationSettings, scriptSnapshot, version, /*acquiring:*/ true);
        }

        function updateDocument(fileName: string, compilationSettings: CompilerOptions, scriptSnapshot: IScriptSnapshot, version: string): SourceFile {
            return acquireOrUpdateDocument(fileName, compilationSettings, scriptSnapshot, version, /*acquiring:*/ false);
        }

        function acquireOrUpdateDocument(
            fileName: string,
            compilationSettings: CompilerOptions,
            scriptSnapshot: IScriptSnapshot,
            version: string,
            acquiring: boolean): SourceFile {

            let bucket = getBucketForCompilationSettings(compilationSettings, /*createIfMissing*/ true);
            let entry = lookUp(bucket, fileName);
            if (!entry) {
                Debug.assert(acquiring, "How could we be trying to update a document that the registry doesn't have?");

                // Have never seen this file with these settings.  Create a new source file for it.
                let sourceFile = createLanguageServiceSourceFile(fileName, scriptSnapshot, compilationSettings.target, version, /*setNodeParents:*/ false);

                bucket[fileName] = entry = {
                    sourceFile: sourceFile,
                    languageServiceRefCount: 0,
                    owners: []
                };
            }
            else {
                // We have an entry for this file.  However, it may be for a different version of 
                // the script snapshot.  If so, update it appropriately.  Otherwise, we can just
                // return it as is.
                if (entry.sourceFile.version !== version) {
                    entry.sourceFile = updateLanguageServiceSourceFile(entry.sourceFile, scriptSnapshot, version,
                        scriptSnapshot.getChangeRange(entry.sourceFile.scriptSnapshot));
                }
            }

            // If we're acquiring, then this is the first time this LS is asking for this document.
            // Increase our ref count so we know there's another LS using the document.  If we're
            // not acquiring, then that means the LS is 'updating' the file instead, and that means
            // it has already acquired the document previously.  As such, we do not need to increase
            // the ref count.
            if (acquiring) {
                entry.languageServiceRefCount++;
            }

            return entry.sourceFile;
        }

        function releaseDocument(fileName: string, compilationSettings: CompilerOptions): void {
            let bucket = getBucketForCompilationSettings(compilationSettings, false);
            Debug.assert(bucket !== undefined);

            let entry = lookUp(bucket, fileName);
            entry.languageServiceRefCount--;

            Debug.assert(entry.languageServiceRefCount >= 0);
            if (entry.languageServiceRefCount === 0) {
                delete bucket[fileName];
            }
        }

        return {
            acquireDocument,
            updateDocument,
            releaseDocument,
            reportStats
        };
    }

    export function preProcessFile(sourceText: string, readImportFiles = true): PreProcessedFileInfo {
        let referencedFiles: FileReference[] = [];
        let importedFiles: FileReference[] = [];
        let isNoDefaultLib = false;

        function processTripleSlashDirectives(): void {
            let commentRanges = getLeadingCommentRanges(sourceText, 0);
            forEach(commentRanges, commentRange => {
                let comment = sourceText.substring(commentRange.pos, commentRange.end);
                let referencePathMatchResult = getFileReferenceFromReferencePath(comment, commentRange);
                if (referencePathMatchResult) {
                    isNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
                    let fileReference = referencePathMatchResult.fileReference;
                    if (fileReference) {
                        referencedFiles.push(fileReference);
                    }
                }
            });
        }

        function recordModuleName() {
            let importPath = scanner.getTokenValue();
            let pos = scanner.getTokenPos();
            importedFiles.push({
                fileName: importPath,
                pos: pos,
                end: pos + importPath.length
            });
        }

        function processImport(): void {
            scanner.setText(sourceText);
            let token = scanner.scan();
            // Look for:
            //    import "mod";
            //    import d from "mod"
            //    import {a as A } from "mod";
            //    import * as NS  from "mod"
            //    import d, {a, b as B} from "mod"
            //    import i = require("mod");
            //
            //    export * from "mod"
            //    export {a as b} from "mod"

            while (token !== SyntaxKind.EndOfFileToken) {
                if (token === SyntaxKind.ImportKeyword) {
                    token = scanner.scan();
                    if (token === SyntaxKind.StringLiteral) {
                        // import "mod";
                        recordModuleName();
                        continue;
                    }
                    else {
                        if (token === SyntaxKind.Identifier) {
                            token = scanner.scan();
                            if (token === SyntaxKind.FromKeyword) {
                                token = scanner.scan();
                                if (token === SyntaxKind.StringLiteral) {
                                    // import d from "mod";
                                    recordModuleName();
                                    continue
                                }
                            }
                            else if (token === SyntaxKind.EqualsToken) {
                                token = scanner.scan();
                                if (token === SyntaxKind.RequireKeyword) {
                                    token = scanner.scan();
                                    if (token === SyntaxKind.OpenParenToken) {
                                        token = scanner.scan();
                                        if (token === SyntaxKind.StringLiteral) {
                                            //  import i = require("mod");
                                            recordModuleName();
                                            continue;
                                        }
                                    }
                                }
                            }
                            else if (token === SyntaxKind.CommaToken) {
                                // consume comma and keep going
                                token = scanner.scan();
                            }
                            else {
                                // unknown syntax
                                continue;
                            }
                        }

                        if (token === SyntaxKind.OpenBraceToken) {
                            token = scanner.scan();
                            // consume "{ a as B, c, d as D}" clauses
                            while (token !== SyntaxKind.CloseBraceToken) {
                                token = scanner.scan();
                            }

                            if (token === SyntaxKind.CloseBraceToken) {
                                token = scanner.scan();
                                if (token === SyntaxKind.FromKeyword) {
                                    token = scanner.scan();
                                    if (token === SyntaxKind.StringLiteral) {
                                        // import {a as A} from "mod";
                                        // import d, {a, b as B} from "mod"
                                        recordModuleName();
                                    }
                                }
                            }
                        }
                        else if (token === SyntaxKind.AsteriskToken) {
                            token = scanner.scan();
                            if (token === SyntaxKind.AsKeyword) {
                                token = scanner.scan();
                                if (token === SyntaxKind.Identifier) {
                                    token = scanner.scan();
                                    if (token === SyntaxKind.FromKeyword) {
                                        token = scanner.scan();
                                        if (token === SyntaxKind.StringLiteral) {
                                            // import * as NS from "mod"
                                            // import d, * as NS from "mod"
                                            recordModuleName();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else if (token === SyntaxKind.ExportKeyword) {
                    token = scanner.scan();
                    if (token === SyntaxKind.OpenBraceToken) {
                        token = scanner.scan();
                        // consume "{ a as B, c, d as D}" clauses
                        while (token !== SyntaxKind.CloseBraceToken) {
                            token = scanner.scan();
                        }

                        if (token === SyntaxKind.CloseBraceToken) {
                            token = scanner.scan();
                            if (token === SyntaxKind.FromKeyword) {
                                token = scanner.scan();
                                if (token === SyntaxKind.StringLiteral) {
                                    // export {a as A} from "mod";
                                    // export {a, b as B} from "mod"
                                    recordModuleName();
                                }
                            }
                        }
                    }
                    else if (token === SyntaxKind.AsteriskToken) {
                        token = scanner.scan();
                        if (token === SyntaxKind.FromKeyword) {
                            token = scanner.scan();
                            if (token === SyntaxKind.StringLiteral) {
                                // export * from "mod"
                                recordModuleName();
                            }
                        }
                    }
                }
                token = scanner.scan();
            }
            scanner.setText(undefined);
        }

        if (readImportFiles) {
            processImport();
        }
        processTripleSlashDirectives();
        return { referencedFiles, importedFiles, isLibFile: isNoDefaultLib };
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

    /** Returns true if node is a name of an object literal property, e.g. "a" in x = { "a": 1 } */
    function isNameOfPropertyAssignment(node: Node): boolean {
        return (node.kind === SyntaxKind.Identifier || node.kind === SyntaxKind.StringLiteral || node.kind === SyntaxKind.NumericLiteral) &&
            (node.parent.kind === SyntaxKind.PropertyAssignment || node.parent.kind === SyntaxKind.ShorthandPropertyAssignment) && (<PropertyDeclaration>node.parent).name === node;
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
                    let text = sourceFile.text;
                    let width = comment.end - comment.pos;
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
    let keywordCompletions: CompletionEntry[] = [];
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
            case SyntaxKind.ModuleDeclaration: return ScriptElementKind.moduleElement;
            case SyntaxKind.ClassDeclaration: return ScriptElementKind.classElement;
            case SyntaxKind.InterfaceDeclaration: return ScriptElementKind.interfaceElement;
            case SyntaxKind.TypeAliasDeclaration: return ScriptElementKind.typeElement;
            case SyntaxKind.EnumDeclaration: return ScriptElementKind.enumElement;
            case SyntaxKind.VariableDeclaration:
                return isConst(node)
                    ? ScriptElementKind.constElement
                    : isLet(node)
                        ? ScriptElementKind.letElement
                        : ScriptElementKind.variableElement;
            case SyntaxKind.FunctionDeclaration: return ScriptElementKind.functionElement;
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
            case SyntaxKind.EnumMember: return ScriptElementKind.variableElement;
            case SyntaxKind.Parameter: return (node.flags & NodeFlags.AccessibilityModifier) ? ScriptElementKind.memberVariableElement : ScriptElementKind.parameterElement;
            case SyntaxKind.ImportEqualsDeclaration:
            case SyntaxKind.ImportSpecifier:
            case SyntaxKind.ImportClause:
            case SyntaxKind.ExportSpecifier:
            case SyntaxKind.NamespaceImport:
                return ScriptElementKind.alias;
        }
        return ScriptElementKind.unknown;
    }

    export function createLanguageService(host: LanguageServiceHost, documentRegistry: DocumentRegistry = createDocumentRegistry()): LanguageService {
        let syntaxTreeCache: SyntaxTreeCache = new SyntaxTreeCache(host);
        let ruleProvider: formatting.RulesProvider;
        let program: Program;

        let useCaseSensitivefileNames = false;
        let cancellationToken = new CancellationTokenObject(host.getCancellationToken && host.getCancellationToken());

        // Check if the localized messages json is set, otherwise query the host for it
        if (!localizedDiagnosticMessages && host.getLocalizedDiagnosticMessages) {
            localizedDiagnosticMessages = host.getLocalizedDiagnosticMessages();
        }

        function log(message: string) {
            if (host.log) {
                host.log(message);
            }
        }

        function getCanonicalFileName(fileName: string) {
            return useCaseSensitivefileNames ? fileName : fileName.toLowerCase();
        }

        function getValidSourceFile(fileName: string): SourceFile {
            fileName = normalizeSlashes(fileName);
            let sourceFile = program.getSourceFile(getCanonicalFileName(fileName));
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
            // Get a fresh cache of the host information
            let hostCache = new HostCache(host);

            // If the program is already up-to-date, we can reuse it
            if (programUpToDate()) {
                return;
            }

            // IMPORTANT - It is critical from this moment onward that we do not check 
            // cancellation tokens.  We are about to mutate source files from a previous program
            // instance.  If we cancel midway through, we may end up in an inconsistent state where
            // the program points to old source files that have been invalidated because of 
            // incremental parsing.

            let oldSettings = program && program.getCompilerOptions();
            let newSettings = hostCache.compilationSettings();
            let changesInCompilationSettingsAffectSyntax = oldSettings && oldSettings.target !== newSettings.target;

            // Now create a new compiler
            let newProgram = createProgram(hostCache.getRootFileNames(), newSettings, {
                getSourceFile: getOrCreateSourceFile,
                getCancellationToken: () => cancellationToken,
                getCanonicalFileName: (fileName) => useCaseSensitivefileNames ? fileName : fileName.toLowerCase(),
                useCaseSensitiveFileNames: () => useCaseSensitivefileNames,
                getNewLine: () => host.getNewLine ? host.getNewLine() : "\r\n",
                getDefaultLibFileName: (options) => host.getDefaultLibFileName(options),
                writeFile: (fileName, data, writeByteOrderMark) => { },
                getCurrentDirectory: () => host.getCurrentDirectory()
            });

            // Release any files we have acquired in the old program but are 
            // not part of the new program.
            if (program) {
                let oldSourceFiles = program.getSourceFiles();
                for (let oldSourceFile of oldSourceFiles) {
                    let fileName = oldSourceFile.fileName;
                    if (!newProgram.getSourceFile(fileName) || changesInCompilationSettingsAffectSyntax) {
                        documentRegistry.releaseDocument(fileName, oldSettings);
                    }
                }
            }

            program = newProgram;

            // Make sure all the nodes in the program are both bound, and have their parent 
            // pointers set property.
            program.getTypeChecker();
            return;

            function getOrCreateSourceFile(fileName: string): SourceFile {
                // The program is asking for this file, check first if the host can locate it.
                // If the host can not locate the file, then it does not exist. return undefined
                // to the program to allow reporting of errors for missing files.
                let hostFileInformation = hostCache.getOrCreateEntry(fileName);
                if (!hostFileInformation) {
                    return undefined;
                }

                // Check if the language version has changed since we last created a program; if they are the same,
                // it is safe to reuse the souceFiles; if not, then the shape of the AST can change, and the oldSourceFile
                // can not be reused. we have to dump all syntax trees and create new ones.
                if (!changesInCompilationSettingsAffectSyntax) {
                    // Check if the old program had this file already
                    let oldSourceFile = program && program.getSourceFile(fileName);
                    if (oldSourceFile) {
                        // We already had a source file for this file name.  Go to the registry to 
                        // ensure that we get the right up to date version of it.  We need this to
                        // address the following 'race'.  Specifically, say we have the following:
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
                        return documentRegistry.updateDocument(fileName, newSettings, hostFileInformation.scriptSnapshot, hostFileInformation.version);
                    }

                    // We didn't already have the file.  Fall through and acquire it from the registry.
                }

                // Could not find this file in the old program, create a new SourceFile for it.
                return documentRegistry.acquireDocument(fileName, newSettings, hostFileInformation.scriptSnapshot, hostFileInformation.version);
            }

            function sourceFileUpToDate(sourceFile: SourceFile): boolean {
                return sourceFile && sourceFile.version === hostCache.getVersion(sourceFile.fileName);
            }

            function programUpToDate(): boolean {
                // If we haven't create a program yet, then it is not up-to-date
                if (!program) {
                    return false;
                }

                // If number of files in the program do not match, it is not up-to-date
                let rootFileNames = hostCache.getRootFileNames();
                if (program.getSourceFiles().length !== rootFileNames.length) {
                    return false;
                }

                // If any file is not up-to-date, then the whole program is not up-to-date
                for (let fileName of rootFileNames) {
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

            return program.getSyntacticDiagnostics(getValidSourceFile(fileName));
        }

        /**
         * getSemanticDiagnostiscs return array of Diagnostics. If '-d' is not enabled, only report semantic errors
         * If '-d' enabled, report both semantic and emitter errors  
         */
        function getSemanticDiagnostics(fileName: string): Diagnostic[] {
            synchronizeHostData();

            let targetSourceFile = getValidSourceFile(fileName);

            // For JavaScript files, we don't want to report the normal typescript semantic errors.
            // Instead, we just report errors for using TypeScript-only constructs from within a 
            // JavaScript file.
            if (isJavaScript(fileName)) {
                return getJavaScriptSemanticDiagnostics(targetSourceFile);
            }

            // Only perform the action per file regardless of '-out' flag as LanguageServiceHost is expected to call this function per file.
            // Therefore only get diagnostics for given file.

            let semanticDiagnostics = program.getSemanticDiagnostics(targetSourceFile);
            if (!program.getCompilerOptions().declaration) {
                return semanticDiagnostics;
            }

            // If '-d' is enabled, check for emitter error. One example of emitter error is export class implements non-export interface
            let declarationDiagnostics = program.getDeclarationDiagnostics(targetSourceFile);
            return concatenate(semanticDiagnostics, declarationDiagnostics);
        }

        function getJavaScriptSemanticDiagnostics(sourceFile: SourceFile): Diagnostic[] {
            let diagnostics: Diagnostic[] = [];
            walk(sourceFile);

            return diagnostics;

            function walk(node: Node): boolean {
                if (!node) {
                    return false;
                }

                switch (node.kind) {
                    case SyntaxKind.ImportEqualsDeclaration:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.import_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.ExportAssignment:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.export_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.ClassDeclaration:
                        let classDeclaration = <ClassDeclaration>node;
                        if (checkModifiers(classDeclaration.modifiers) ||
                            checkTypeParameters(classDeclaration.typeParameters)) {
                            return true;
                        }
                        break;
                    case SyntaxKind.HeritageClause:
                        let heritageClause = <HeritageClause>node;
                        if (heritageClause.token === SyntaxKind.ImplementsKeyword) {
                            diagnostics.push(createDiagnosticForNode(node, Diagnostics.implements_clauses_can_only_be_used_in_a_ts_file));
                            return true;
                        }
                        break;
                    case SyntaxKind.InterfaceDeclaration:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.interface_declarations_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.ModuleDeclaration:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.module_declarations_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.TypeAliasDeclaration:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.type_aliases_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                    case SyntaxKind.Constructor:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                    case SyntaxKind.FunctionExpression:
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.ArrowFunction:
                    case SyntaxKind.FunctionDeclaration:
                        let functionDeclaration = <FunctionLikeDeclaration>node;
                        if (checkModifiers(functionDeclaration.modifiers) ||
                            checkTypeParameters(functionDeclaration.typeParameters) ||
                            checkTypeAnnotation(functionDeclaration.type)) {
                            return true;
                        }
                        break;
                    case SyntaxKind.VariableStatement:
                        let variableStatement = <VariableStatement>node;
                        if (checkModifiers(variableStatement.modifiers)) {
                            return true;
                        }
                        break;
                    case SyntaxKind.VariableDeclaration:
                        let variableDeclaration = <VariableDeclaration>node;
                        if (checkTypeAnnotation(variableDeclaration.type)) {
                            return true;
                        }
                        break;
                    case SyntaxKind.CallExpression:
                    case SyntaxKind.NewExpression:
                        let expression = <CallExpression>node;
                        if (expression.typeArguments && expression.typeArguments.length > 0) {
                            let start = expression.typeArguments.pos;
                            diagnostics.push(createFileDiagnostic(sourceFile, start, expression.typeArguments.end - start,
                                Diagnostics.type_arguments_can_only_be_used_in_a_ts_file));
                            return true;
                        }
                        break;
                    case SyntaxKind.Parameter:
                        let parameter = <ParameterDeclaration>node;
                        if (parameter.modifiers) {
                            let start = parameter.modifiers.pos;
                            diagnostics.push(createFileDiagnostic(sourceFile, start, parameter.modifiers.end - start,
                                Diagnostics.parameter_modifiers_can_only_be_used_in_a_ts_file));
                            return true;
                        }
                        if (parameter.questionToken) {
                            diagnostics.push(createDiagnosticForNode(parameter.questionToken, Diagnostics.can_only_be_used_in_a_ts_file));
                            return true;
                        }
                        if (parameter.type) {
                            diagnostics.push(createDiagnosticForNode(parameter.type, Diagnostics.types_can_only_be_used_in_a_ts_file));
                            return true;
                        }
                        break;
                    case SyntaxKind.PropertyDeclaration:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.property_declarations_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.EnumDeclaration:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.enum_declarations_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.TypeAssertionExpression:
                        let typeAssertionExpression = <TypeAssertion>node;
                        diagnostics.push(createDiagnosticForNode(typeAssertionExpression.type, Diagnostics.type_assertion_expressions_can_only_be_used_in_a_ts_file));
                        return true;
                    case SyntaxKind.Decorator:
                        diagnostics.push(createDiagnosticForNode(node, Diagnostics.decorators_can_only_be_used_in_a_ts_file));
                        return true;
                }

                return forEachChild(node, walk);
            }

            function checkTypeParameters(typeParameters: NodeArray<TypeParameterDeclaration>): boolean {
                if (typeParameters) {
                    let start = typeParameters.pos;
                    diagnostics.push(createFileDiagnostic(sourceFile, start, typeParameters.end - start, Diagnostics.type_parameter_declarations_can_only_be_used_in_a_ts_file));
                    return true;
                }
                return false;
            }

            function checkTypeAnnotation(type: TypeNode): boolean {
                if (type) {
                    diagnostics.push(createDiagnosticForNode(type, Diagnostics.types_can_only_be_used_in_a_ts_file));
                    return true;
                }

                return false;
            }

            function checkModifiers(modifiers: ModifiersArray): boolean {
                if (modifiers) {
                    for (let modifier of modifiers) {
                        switch (modifier.kind) {
                            case SyntaxKind.PublicKeyword:
                            case SyntaxKind.PrivateKeyword:
                            case SyntaxKind.ProtectedKeyword:
                            case SyntaxKind.DeclareKeyword:
                                diagnostics.push(createDiagnosticForNode(modifier, Diagnostics._0_can_only_be_used_in_a_ts_file, tokenToString(modifier.kind)));
                                return true;

                            // These are all legal modifiers.
                            case SyntaxKind.StaticKeyword:
                            case SyntaxKind.ExportKeyword:
                            case SyntaxKind.ConstKeyword:
                            case SyntaxKind.DefaultKeyword:
                        }
                    }
                }

                return false;
            }
        }

        function getCompilerOptionsDiagnostics() {
            synchronizeHostData();
            return program.getGlobalDiagnostics();
        }

        /// Completion
        function getCompletionEntryDisplayNameForSymbol(symbol: Symbol, target: ScriptTarget, performCharacterChecks: boolean): string {
            let displayName = symbol.getName();
            if (displayName) {
                // If this is the default export, get the name of the declaration if it exists
                if (displayName === "default") {
                    let localSymbol = getLocalSymbolForExportDefault(symbol);
                    if (localSymbol && localSymbol.name) {
                        displayName = symbol.valueDeclaration.localSymbol.name;
                    }
                }

                let firstCharCode = displayName.charCodeAt(0);
                // First check of the displayName is not external module; if it is an external module, it is not valid entry
                if ((symbol.flags & SymbolFlags.Namespace) && (firstCharCode === CharacterCodes.singleQuote || firstCharCode === CharacterCodes.doubleQuote)) {
                    // If the symbol is external module, don't show it in the completion list
                    // (i.e declare module "http" { let x; } | // <= request completion here, "http" should not be there)
                    return undefined;
                }
            }

            return getCompletionEntryDisplayName(displayName, target, performCharacterChecks);
        }

        function getCompletionEntryDisplayName(displayName: string, target: ScriptTarget, performCharacterChecks: boolean): string {
            if (!displayName) {
                return undefined;
            }

            let firstCharCode = displayName.charCodeAt(0);
            if (displayName.length >= 2 &&
                firstCharCode === displayName.charCodeAt(displayName.length - 1) &&
                (firstCharCode === CharacterCodes.singleQuote || firstCharCode === CharacterCodes.doubleQuote)) {
                // If the user entered name for the symbol was quoted, removing the quotes is not enough, as the name could be an
                // invalid identifier name. We need to check if whatever was inside the quotes is actually a valid identifier name.
                displayName = displayName.substring(1, displayName.length - 1);
            }

            if (!displayName) {
                return undefined;
            }

            if (performCharacterChecks) {
                if (!isIdentifierStart(displayName.charCodeAt(0), target)) {
                    return undefined;
                }

                for (let i = 1, n = displayName.length; i < n; i++) {
                    if (!isIdentifierPart(displayName.charCodeAt(i), target)) {
                        return undefined;
                    }
                }
            }

            return unescapeIdentifier(displayName);
        }

        function getCompletionData(fileName: string, position: number) {
            let typeChecker = program.getTypeChecker();
            let syntacticStart = new Date().getTime();
            let sourceFile = getValidSourceFile(fileName);

            let start = new Date().getTime();
            let currentToken = getTokenAtPosition(sourceFile, position);
            log("getCompletionData: Get current token: " + (new Date().getTime() - start));

            start = new Date().getTime();
            // Completion not allowed inside comments, bail out if this is the case
            let insideComment = isInsideComment(sourceFile, currentToken, position);
            log("getCompletionData: Is inside comment: " + (new Date().getTime() - start));

            if (insideComment) {
                log("Returning an empty list because completion was inside a comment.");
                return undefined;
            }

            start = new Date().getTime();
            let previousToken = findPrecedingToken(position, sourceFile);
            log("getCompletionData: Get previous token 1: " + (new Date().getTime() - start));

            // The decision to provide completion depends on the contextToken, which is determined through the previousToken.
            // Note: 'previousToken' (and thus 'contextToken') can be undefined if we are the beginning of the file
            let contextToken = previousToken;

            // Check if the caret is at the end of an identifier; this is a partial identifier that we want to complete: e.g. a.toS|
            // Skip this partial identifier and adjust the contextToken to the token that precedes it.
            if (contextToken && position <= contextToken.end && isWord(contextToken.kind)) {
                let start = new Date().getTime();
                contextToken = findPrecedingToken(contextToken.getFullStart(), sourceFile);
                log("getCompletionData: Get previous token 2: " + (new Date().getTime() - start));
            }

            // Check if this is a valid completion location
            if (contextToken && isCompletionListBlocker(contextToken)) {
                log("Returning an empty list because completion was requested in an invalid position.");
                return undefined;
            }

            // Find the node where completion is requested on, in the case of a completion after 
            // a dot, it is the member access expression other wise, it is a request for all 
            // visible symbols in the scope, and the node is the current location.
            let node = currentToken;
            let isRightOfDot = false;
            if (contextToken && contextToken.kind === SyntaxKind.DotToken && contextToken.parent.kind === SyntaxKind.PropertyAccessExpression) {
                node = (<PropertyAccessExpression>contextToken.parent).expression;
                isRightOfDot = true;
            }
            else if (contextToken && contextToken.kind === SyntaxKind.DotToken && contextToken.parent.kind === SyntaxKind.QualifiedName) {
                node = (<QualifiedName>contextToken.parent).left;
                isRightOfDot = true;
            }

            let location = getTouchingPropertyName(sourceFile, position);
            var target = program.getCompilerOptions().target;

            let semanticStart = new Date().getTime();
            let isMemberCompletion: boolean;
            let isNewIdentifierLocation: boolean;
            let symbols: Symbol[] = [];

            if (isRightOfDot) {
                getTypeScriptMemberSymbols();
            }
            else {
                // For JavaScript or TypeScript, if we're not after a dot, then just try to get the
                // global symbols in scope.  These results should be valid for either language as
                // the set of symbols that can be referenced from this location.
                if (!tryGetGlobalSymbols()) {
                    return undefined;
                }
            }

            log("getCompletionData: Semantic work: " + (new Date().getTime() - semanticStart));

            return { symbols, isMemberCompletion, isNewIdentifierLocation, location, isRightOfDot };

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
                        let exportedSymbols = typeChecker.getExportsOfModule(symbol);
                        forEach(exportedSymbols, symbol => {
                            if (typeChecker.isValidPropertyAccess(<PropertyAccessExpression>(node.parent), symbol.name)) {
                                symbols.push(symbol);
                            }
                        });
                    }
                }

                let type = typeChecker.getTypeAtLocation(node);
                if (type) {
                    // Filter private properties
                    forEach(type.getApparentProperties(), symbol => {
                        if (typeChecker.isValidPropertyAccess(<PropertyAccessExpression>(node.parent), symbol.name)) {
                            symbols.push(symbol);
                        }
                    });
                }
            }

            function tryGetGlobalSymbols(): boolean {
                let containingObjectLiteral = getContainingObjectLiteralApplicableForCompletion(contextToken);
                if (containingObjectLiteral) {
                    // Object literal expression, look up possible property names from contextual type
                    isMemberCompletion = true;
                    isNewIdentifierLocation = true;

                    let contextualType = typeChecker.getContextualType(containingObjectLiteral);
                    if (!contextualType) {
                        return false;
                    }

                    let contextualTypeMembers = typeChecker.getPropertiesOfType(contextualType);
                    if (contextualTypeMembers && contextualTypeMembers.length > 0) {
                        // Add filtered items to the completion list
                        symbols = filterContextualMembersList(contextualTypeMembers, containingObjectLiteral.properties);
                    }
                }
                else if (getAncestor(contextToken, SyntaxKind.ImportClause)) {
                    // cursor is in import clause
                    // try to show exported member for imported module
                    isMemberCompletion = true;
                    isNewIdentifierLocation = true;
                    if (showCompletionsInImportsClause(contextToken)) {
                        let importDeclaration = <ImportDeclaration>getAncestor(contextToken, SyntaxKind.ImportDeclaration);
                        Debug.assert(importDeclaration !== undefined);

                        let exports: Symbol[];
                        if (importDeclaration.moduleSpecifier) {
                            let moduleSpecifierSymbol = typeChecker.getSymbolAtLocation(importDeclaration.moduleSpecifier);
                            if (moduleSpecifierSymbol) {
                                exports = typeChecker.getExportsOfModule(moduleSpecifierSymbol);
                            }
                        }

                        //let exports = typeInfoResolver.getExportsOfImportDeclaration(importDeclaration);
                        symbols = exports ? filterModuleExports(exports, importDeclaration) : emptyArray;
                    }
                }
                else {
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
                    let adjustedPosition = previousToken !== contextToken ?
                        previousToken.getStart() :
                        position;

                    let scopeNode = getScopeNode(contextToken, adjustedPosition, sourceFile) || sourceFile;

                    /// TODO filter meaning based on the current context
                    let symbolMeanings = SymbolFlags.Type | SymbolFlags.Value | SymbolFlags.Namespace | SymbolFlags.Alias;
                    symbols = typeChecker.getSymbolsInScope(scopeNode, symbolMeanings);
                }

                return true;
            }

            /**
             * Finds the first node that "embraces" the position, so that one may
             * accurately aggregate locals from the closest containing scope.
             */
            function getScopeNode(initialToken: Node, position: number, sourceFile: SourceFile) {
                var scope = initialToken;
                while (scope && !positionBelongsToNode(scope, position, sourceFile)) {
                    scope = scope.parent;
                }
                return scope;
            }

            function isCompletionListBlocker(previousToken: Node): boolean {
                let start = new Date().getTime();
                let result = isInStringOrRegularExpressionOrTemplateLiteral(previousToken) ||
                    isIdentifierDefinitionLocation(previousToken) ||
                    isRightOfIllegalDot(previousToken);
                log("getCompletionsAtPosition: isCompletionListBlocker: " + (new Date().getTime() - start));
                return result;
            }

            function showCompletionsInImportsClause(node: Node): boolean {
                if (node) {
                    // import {| 
                    // import {a,|
                    if (node.kind === SyntaxKind.OpenBraceToken || node.kind === SyntaxKind.CommaToken) {
                        return node.parent.kind === SyntaxKind.NamedImports;
                    }
                }

                return false;
            }

            function isNewIdentifierDefinitionLocation(previousToken: Node): boolean {
                if (previousToken) {
                    let containingNodeKind = previousToken.parent.kind;
                    switch (previousToken.kind) {
                        case SyntaxKind.CommaToken:
                            return containingNodeKind === SyntaxKind.CallExpression                         // func( a, |
                                || containingNodeKind === SyntaxKind.Constructor                            // constructor( a, |   public, protected, private keywords are allowed here, so show completion
                                || containingNodeKind === SyntaxKind.NewExpression                          // new C(a, |
                                || containingNodeKind === SyntaxKind.ArrayLiteralExpression                 // [a, |
                                || containingNodeKind === SyntaxKind.BinaryExpression;                      // let x = (a, |

              
                        case SyntaxKind.OpenParenToken:
                            return containingNodeKind === SyntaxKind.CallExpression               // func( |
                                || containingNodeKind === SyntaxKind.Constructor                  // constructor( |
                                || containingNodeKind === SyntaxKind.NewExpression                // new C(a|
                                || containingNodeKind === SyntaxKind.ParenthesizedExpression;     // let x = (a|

                        case SyntaxKind.OpenBracketToken:
                            return containingNodeKind === SyntaxKind.ArrayLiteralExpression;                 // [ |

                        case SyntaxKind.ModuleKeyword:                               // module | 
                            return true;

                        case SyntaxKind.DotToken:
                            return containingNodeKind === SyntaxKind.ModuleDeclaration; // module A.|

                        case SyntaxKind.OpenBraceToken:
                            return containingNodeKind === SyntaxKind.ClassDeclaration;  // class A{ |

                        case SyntaxKind.EqualsToken:
                            return containingNodeKind === SyntaxKind.VariableDeclaration // let x = a|
                                || containingNodeKind === SyntaxKind.BinaryExpression;   // x = a|

                        case SyntaxKind.TemplateHead:
                            return containingNodeKind === SyntaxKind.TemplateExpression; // `aa ${|

                        case SyntaxKind.TemplateMiddle:
                            return containingNodeKind === SyntaxKind.TemplateSpan; // `aa ${10} dd ${|

                        case SyntaxKind.PublicKeyword:
                        case SyntaxKind.PrivateKeyword:
                        case SyntaxKind.ProtectedKeyword:
                            return containingNodeKind === SyntaxKind.PropertyDeclaration; // class A{ public |
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

            function isInStringOrRegularExpressionOrTemplateLiteral(previousToken: Node): boolean {
                if (previousToken.kind === SyntaxKind.StringLiteral
                    || previousToken.kind === SyntaxKind.RegularExpressionLiteral
                    || isTemplateLiteralKind(previousToken.kind)) {
                    // The position has to be either: 1. entirely within the token text, or 
                    // 2. at the end position of an unterminated token.
                    let start = previousToken.getStart();
                    let end = previousToken.getEnd();

                    if (start < position && position < end) {
                        return true;
                    }
                    else if (position === end) {
                        return !!(<LiteralExpression>previousToken).isUnterminated;
                    }
                }

                return false;
            }

            function getContainingObjectLiteralApplicableForCompletion(previousToken: Node): ObjectLiteralExpression {
                // The locations in an object literal expression that are applicable for completion are property name definition locations.

                if (previousToken) {
                    let parent = previousToken.parent;

                    switch (previousToken.kind) {
                        case SyntaxKind.OpenBraceToken:  // let x = { |
                        case SyntaxKind.CommaToken:      // let x = { a: 0, |
                            if (parent && parent.kind === SyntaxKind.ObjectLiteralExpression) {
                                return <ObjectLiteralExpression>parent;
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

            function isIdentifierDefinitionLocation(previousToken: Node): boolean {
                if (previousToken) {
                    let containingNodeKind = previousToken.parent.kind;
                    switch (previousToken.kind) {
                        case SyntaxKind.CommaToken:
                            return containingNodeKind === SyntaxKind.VariableDeclaration ||
                                containingNodeKind === SyntaxKind.VariableDeclarationList ||
                                containingNodeKind === SyntaxKind.VariableStatement ||
                                containingNodeKind === SyntaxKind.EnumDeclaration ||           // enum a { foo, |
                                isFunction(containingNodeKind) ||
                                containingNodeKind === SyntaxKind.ClassDeclaration ||          // class A<T, |
                                containingNodeKind === SyntaxKind.FunctionDeclaration ||       // function A<T, |
                                containingNodeKind === SyntaxKind.InterfaceDeclaration ||      // interface A<T, |
                                containingNodeKind === SyntaxKind.ArrayBindingPattern ||       //  var [x, y|
                                containingNodeKind === SyntaxKind.ObjectBindingPattern;        // function func({ x, y|

                        case SyntaxKind.DotToken:
                            return containingNodeKind === SyntaxKind.ArrayBindingPattern;       // var [.|

                        case SyntaxKind.OpenBracketToken:
                            return containingNodeKind === SyntaxKind.ArrayBindingPattern;         //  var [x|

                        case SyntaxKind.OpenParenToken:
                            return containingNodeKind === SyntaxKind.CatchClause ||
                                isFunction(containingNodeKind);

                        case SyntaxKind.OpenBraceToken:
                            return containingNodeKind === SyntaxKind.EnumDeclaration ||        // enum a { |
                                containingNodeKind === SyntaxKind.InterfaceDeclaration ||      // interface a { |
                                containingNodeKind === SyntaxKind.TypeLiteral ||               // let x : { |
                                containingNodeKind === SyntaxKind.ObjectBindingPattern;        // function func({ x|

                        case SyntaxKind.SemicolonToken:
                            return containingNodeKind === SyntaxKind.PropertySignature &&
                                previousToken.parent && previousToken.parent.parent &&
                                (previousToken.parent.parent.kind === SyntaxKind.InterfaceDeclaration ||    // interface a { f; |
                                    previousToken.parent.parent.kind === SyntaxKind.TypeLiteral);           //  let x : { a; |

                        case SyntaxKind.LessThanToken:
                            return containingNodeKind === SyntaxKind.ClassDeclaration ||        // class A< |
                                containingNodeKind === SyntaxKind.FunctionDeclaration ||        // function A< |
                                containingNodeKind === SyntaxKind.InterfaceDeclaration ||       // interface A< |
                                isFunction(containingNodeKind);

                        case SyntaxKind.StaticKeyword:
                            return containingNodeKind === SyntaxKind.PropertyDeclaration;

                        case SyntaxKind.DotDotDotToken:
                            return containingNodeKind === SyntaxKind.Parameter ||
                                containingNodeKind === SyntaxKind.Constructor ||
                                (previousToken.parent && previousToken.parent.parent &&
                                    previousToken.parent.parent.kind === SyntaxKind.ArrayBindingPattern);  // var [ ...z|

                        case SyntaxKind.PublicKeyword:
                        case SyntaxKind.PrivateKeyword:
                        case SyntaxKind.ProtectedKeyword:
                            return containingNodeKind === SyntaxKind.Parameter;

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
                            return true;
                    }

                    // Previous token may have been a keyword that was converted to an identifier.
                    switch (previousToken.getText()) {
                        case "class":
                        case "interface":
                        case "enum":
                        case "function":
                        case "var":
                        case "static":
                        case "let":
                        case "const":
                        case "yield":
                            return true;
                    }
                }

                return false;
            }

            function isRightOfIllegalDot(previousToken: Node): boolean {
                if (previousToken && previousToken.kind === SyntaxKind.NumericLiteral) {
                    let text = previousToken.getFullText();
                    return text.charAt(text.length - 1) === ".";
                }

                return false;
            }

            function filterModuleExports(exports: Symbol[], importDeclaration: ImportDeclaration): Symbol[] {
                let exisingImports: Map<boolean> = {};

                if (!importDeclaration.importClause) {
                    return exports;
                }

                if (importDeclaration.importClause.namedBindings &&
                    importDeclaration.importClause.namedBindings.kind === SyntaxKind.NamedImports) {

                    forEach((<NamedImports>importDeclaration.importClause.namedBindings).elements, el => {
                        let name = el.propertyName || el.name;
                        exisingImports[name.text] = true;
                    });
                }

                if (isEmpty(exisingImports)) {
                    return exports;
                }
                return filter(exports, e => !lookUp(exisingImports, e.name));
            }

            function filterContextualMembersList(contextualMemberSymbols: Symbol[], existingMembers: Declaration[]): Symbol[] {
                if (!existingMembers || existingMembers.length === 0) {
                    return contextualMemberSymbols;
                }

                let existingMemberNames: Map<boolean> = {};
                forEach(existingMembers, m => {
                    if (m.kind !== SyntaxKind.PropertyAssignment && m.kind !== SyntaxKind.ShorthandPropertyAssignment) {
                        // Ignore omitted expressions for missing members in the object literal
                        return;
                    }

                    if (m.getStart() <= position && position <= m.getEnd()) {
                        // If this is the current item we are editing right now, do not filter it out
                        return;
                    }

                    // TODO(jfreeman): Account for computed property name
                    existingMemberNames[(<Identifier>m.name).text] = true;
                });

                let filteredMembers: Symbol[] = [];
                forEach(contextualMemberSymbols, s => {
                    if (!existingMemberNames[s.name]) {
                        filteredMembers.push(s);
                    }
                });

                return filteredMembers;
            }
        }

        function getCompletionsAtPosition(fileName: string, position: number): CompletionInfo {
            synchronizeHostData();

            let completionData = getCompletionData(fileName, position);
            if (!completionData) {
                return undefined;
            }

            let { symbols, isMemberCompletion, isNewIdentifierLocation, location, isRightOfDot } = completionData;

            let entries: CompletionEntry[];
            if (isRightOfDot && isJavaScript(fileName)) {
                entries = getCompletionEntriesFromSymbols(symbols);
                addRange(entries, getJavaScriptCompletionEntries());
            }
            else {
                if (!symbols || symbols.length === 0) {
                    return undefined;
                }

                entries = getCompletionEntriesFromSymbols(symbols);
            }

            // Add keywords if this is not a member completion list
            if (!isMemberCompletion) {
                addRange(entries, keywordCompletions);
            }

            return { isMemberCompletion, isNewIdentifierLocation, entries };

            function getJavaScriptCompletionEntries(): CompletionEntry[] {
                let entries: CompletionEntry[] = [];
                let allNames: Map<string> = {};
                let target = program.getCompilerOptions().target;

                for (let sourceFile of program.getSourceFiles()) {
                    let nameTable = getNameTable(sourceFile);
                    for (let name in nameTable) {
                        if (!allNames[name]) {
                            allNames[name] = name;
                            let displayName = getCompletionEntryDisplayName(name, target, /*performCharacterChecks:*/ true);
                            if (displayName) {
                                let entry = {
                                    name: displayName,
                                    kind: ScriptElementKind.warning,
                                    kindModifiers: "",
                                    sortText: "1"
                                };
                                entries.push(entry);
                            }
                        }
                    }
                }

                return entries;
            }

            function createCompletionEntry(symbol: Symbol, location: Node): CompletionEntry {
                // Try to get a valid display name for this symbol, if we could not find one, then ignore it. 
                // We would like to only show things that can be added after a dot, so for instance numeric properties can
                // not be accessed with a dot (a.1 <- invalid)
                let displayName = getCompletionEntryDisplayNameForSymbol(symbol, program.getCompilerOptions().target, /*performCharacterChecks:*/ true);
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

            function getCompletionEntriesFromSymbols(symbols: Symbol[]): CompletionEntry[] {
                let start = new Date().getTime();
                var entries: CompletionEntry[] = [];

                if (symbols) {
                    var nameToSymbol: Map<Symbol> = {};
                    for (let symbol of symbols) {
                        let entry = createCompletionEntry(symbol, location);
                        if (entry) {
                            let id = escapeIdentifier(entry.name);
                            if (!lookUp(nameToSymbol, id)) {
                                entries.push(entry);
                                nameToSymbol[id] = symbol;
                            }
                        }
                    }
                }

                log("getCompletionsAtPosition: getCompletionEntriesFromSymbols: " + (new Date().getTime() - start));
                return entries;
            }
        }

        function getCompletionEntryDetails(fileName: string, position: number, entryName: string): CompletionEntryDetails {
            synchronizeHostData();

            // Compute all the completion symbols again.
            let completionData = getCompletionData(fileName, position);
            if (completionData) {
                let { symbols, location } = completionData;

                // Find the symbol with the matching entry name.
                let target = program.getCompilerOptions().target;
                // We don't need to perform character checks here because we're only comparing the 
                // name against 'entryName' (which is known to be good), not building a new 
                // completion entry.
                let symbol = forEach(symbols, s => getCompletionEntryDisplayNameForSymbol(s, target, /*performCharacterChecks:*/ false) === entryName ? s : undefined);

                if (symbol) {
                    let displayPartsDocumentationsAndSymbolKind = getSymbolDisplayPartsDocumentationAndSymbolKind(symbol, getValidSourceFile(fileName), location, location, SemanticMeaning.All);
                    return {
                        name: entryName,
                        kind: displayPartsDocumentationsAndSymbolKind.symbolKind,
                        kindModifiers: getSymbolModifiers(symbol),
                        displayParts: displayPartsDocumentationsAndSymbolKind.displayParts,
                        documentation: displayPartsDocumentationsAndSymbolKind.documentation
                    };
                }
            }
            
            // Didn't find a symbol with this name.  See if we can find a keyword instead.
            let keywordCompletion = forEach(keywordCompletions, c => c.name === entryName);
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
            let flags = symbol.getFlags();

            if (flags & SymbolFlags.Class) return ScriptElementKind.classElement;
            if (flags & SymbolFlags.Enum) return ScriptElementKind.enumElement;
            if (flags & SymbolFlags.TypeAlias) return ScriptElementKind.typeElement;
            if (flags & SymbolFlags.Interface) return ScriptElementKind.interfaceElement;
            if (flags & SymbolFlags.TypeParameter) return ScriptElementKind.typeParameterElement;

            let result = getSymbolKindOfConstructorPropertyMethodAccessorFunctionOrVar(symbol, flags, location);
            if (result === ScriptElementKind.unknown) {
                if (flags & SymbolFlags.TypeParameter) return ScriptElementKind.typeParameterElement;
                if (flags & SymbolFlags.EnumMember) return ScriptElementKind.variableElement;
                if (flags & SymbolFlags.Alias) return ScriptElementKind.alias;
                if (flags & SymbolFlags.Module) return ScriptElementKind.moduleElement;
            }

            return result;
        }

        function getSymbolKindOfConstructorPropertyMethodAccessorFunctionOrVar(symbol: Symbol, flags: SymbolFlags, location: Node) {
            let typeChecker = program.getTypeChecker();

            if (typeChecker.isUndefinedSymbol(symbol)) {
                return ScriptElementKind.variableElement;
            }
            if (typeChecker.isArgumentsSymbol(symbol)) {
                return ScriptElementKind.localVariableElement;
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
                if (flags & SymbolFlags.UnionProperty) {
                    // If union property is result of union of non method (property/accessors/variables), it is labeled as property
                    let unionPropertyKind = forEach(typeChecker.getRootSymbols(symbol), rootSymbol => {
                        let rootSymbolFlags = rootSymbol.getFlags();
                        if (rootSymbolFlags & (SymbolFlags.PropertyOrAccessor | SymbolFlags.Variable)) {
                            return ScriptElementKind.memberVariableElement;
                        }
                        Debug.assert(!!(rootSymbolFlags & SymbolFlags.Method));
                    });
                    if (!unionPropertyKind) {
                        // If this was union of all methods, 
                        //make sure it has call signatures before we can label it as method
                        let typeOfUnionProperty = typeChecker.getTypeOfSymbolAtLocation(symbol, location);
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

        function getTypeKind(type: Type): string {
            let flags = type.getFlags();

            if (flags & TypeFlags.Enum) return ScriptElementKind.enumElement;
            if (flags & TypeFlags.Class) return ScriptElementKind.classElement;
            if (flags & TypeFlags.Interface) return ScriptElementKind.interfaceElement;
            if (flags & TypeFlags.TypeParameter) return ScriptElementKind.typeParameterElement;
            if (flags & TypeFlags.Intrinsic) return ScriptElementKind.primitiveType;
            if (flags & TypeFlags.StringLiteral) return ScriptElementKind.primitiveType;

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

            let typeChecker = program.getTypeChecker();

            let displayParts: SymbolDisplayPart[] = [];
            let documentation: SymbolDisplayPart[];
            let symbolFlags = symbol.flags;
            let symbolKind = getSymbolKindOfConstructorPropertyMethodAccessorFunctionOrVar(symbol, symbolFlags, location);
            let hasAddedSymbolInfo: boolean;
            let type: Type;

            // Class at constructor site need to be shown as constructor apart from property,method, vars
            if (symbolKind !== ScriptElementKind.unknown || symbolFlags & SymbolFlags.Class || symbolFlags & SymbolFlags.Alias) {
                // If it is accessor they are allowed only if location is at name of the accessor
                if (symbolKind === ScriptElementKind.memberGetAccessorElement || symbolKind === ScriptElementKind.memberSetAccessorElement) {
                    symbolKind = ScriptElementKind.memberVariableElement;
                }

                let signature: Signature;
                type = typeChecker.getTypeOfSymbolAtLocation(symbol, location);
                if (type) {
                    if (location.parent && location.parent.kind === SyntaxKind.PropertyAccessExpression) {
                        let right = (<PropertyAccessExpression>location.parent).name;
                        // Either the location is on the right of a property access, or on the left and the right is missing
                        if (right === location || (right && right.getFullWidth() === 0)) {
                            location = location.parent;
                        }
                    }

                    // try get the call/construct signature from the type if it matches
                    let callExpression: CallExpression;
                    if (location.kind === SyntaxKind.CallExpression || location.kind === SyntaxKind.NewExpression) {
                        callExpression = <CallExpression> location;
                    }
                    else if (isCallExpressionTarget(location) || isNewExpressionTarget(location)) {
                        callExpression = <CallExpression>location.parent;
                    }

                    if (callExpression) {
                        let candidateSignatures: Signature[] = [];
                        signature = typeChecker.getResolvedSignature(callExpression, candidateSignatures);
                        if (!signature && candidateSignatures.length) {
                            // Use the first candidate:
                            signature = candidateSignatures[0];
                        }

                        let useConstructSignatures = callExpression.kind === SyntaxKind.NewExpression || callExpression.expression.kind === SyntaxKind.SuperKeyword;
                        let allSignatures = useConstructSignatures ? type.getConstructSignatures() : type.getCallSignatures();

                        if (!contains(allSignatures, signature.target || signature)) {
                            // Get the first signature if there 
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
                                    if (!(type.flags & TypeFlags.Anonymous)) {
                                        displayParts.push.apply(displayParts, symbolToDisplayParts(typeChecker, type.symbol, enclosingDeclaration, /*meaning*/ undefined, SymbolFormatFlags.WriteTypeParametersOrArguments));
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
                        let functionDeclaration = <FunctionLikeDeclaration>location.parent;
                        let allSignatures = functionDeclaration.kind === SyntaxKind.Constructor ? type.getConstructSignatures() : type.getCallSignatures();
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
            if (symbolFlags & SymbolFlags.Class && !hasAddedSymbolInfo) {
                displayParts.push(keywordPart(SyntaxKind.ClassKeyword));
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
                displayParts.push(spacePart());
                displayParts.push(operatorPart(SyntaxKind.EqualsToken));
                displayParts.push(spacePart());
                displayParts.push.apply(displayParts, typeToDisplayParts(typeChecker, typeChecker.getDeclaredTypeOfSymbol(symbol), enclosingDeclaration));
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
                displayParts.push(keywordPart(SyntaxKind.ModuleKeyword));
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
                    let signatureDeclaration = <SignatureDeclaration>getDeclarationOfKind(symbol, SyntaxKind.TypeParameter).parent;
                    let signature = typeChecker.getSignatureFromDeclaration(signatureDeclaration);
                    if (signatureDeclaration.kind === SyntaxKind.ConstructSignature) {
                        displayParts.push(keywordPart(SyntaxKind.NewKeyword));
                        displayParts.push(spacePart());
                    }
                    else if (signatureDeclaration.kind !== SyntaxKind.CallSignature && signatureDeclaration.name) {
                        addFullSymbolName(signatureDeclaration.symbol);
                    }
                    displayParts.push.apply(displayParts, signatureToDisplayParts(typeChecker, signature, sourceFile, TypeFormatFlags.WriteTypeArgumentsOfSignature));
                }
            }
            if (symbolFlags & SymbolFlags.EnumMember) {
                addPrefixForAnyFunctionOrVar(symbol, "enum member");
                let declaration = symbol.declarations[0];
                if (declaration.kind === SyntaxKind.EnumMember) {
                    let constantValue = typeChecker.getConstantValue(<EnumMember>declaration);
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
                displayParts.push(keywordPart(SyntaxKind.ImportKeyword));
                displayParts.push(spacePart());
                addFullSymbolName(symbol);
                ts.forEach(symbol.declarations, declaration => {
                    if (declaration.kind === SyntaxKind.ImportEqualsDeclaration) {
                        let importEqualsDeclaration = <ImportEqualsDeclaration>declaration;
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
                            let internalAliasSymbol = typeChecker.getSymbolAtLocation(importEqualsDeclaration.moduleReference);
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
                        addPrefixForAnyFunctionOrVar(symbol, symbolKind);
                        // For properties, variables and local vars: show the type
                        if (symbolKind === ScriptElementKind.memberVariableElement ||
                            symbolFlags & SymbolFlags.Variable ||
                            symbolKind === ScriptElementKind.localVariableElement) {
                            displayParts.push(punctuationPart(SyntaxKind.ColonToken));
                            displayParts.push(spacePart());
                            // If the type is type parameter, format it specially
                            if (type.symbol && type.symbol.flags & SymbolFlags.TypeParameter) {
                                let typeParameterParts = mapToDisplayParts(writer => {
                                    typeChecker.getSymbolDisplayBuilder().buildTypeParameterDisplay(<TypeParameter>type, writer, enclosingDeclaration);
                                });
                                displayParts.push.apply(displayParts, typeParameterParts);
                            }
                            else {
                                displayParts.push.apply(displayParts, typeToDisplayParts(typeChecker, type, enclosingDeclaration));
                            }
                        }
                        else if (symbolFlags & SymbolFlags.Function ||
                            symbolFlags & SymbolFlags.Method ||
                            symbolFlags & SymbolFlags.Constructor ||
                            symbolFlags & SymbolFlags.Signature ||
                            symbolFlags & SymbolFlags.Accessor ||
                            symbolKind === ScriptElementKind.memberFunctionElement) {
                            let allSignatures = type.getCallSignatures();
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
            }

            return { displayParts, documentation, symbolKind };

            function addNewLineIfDisplayPartsExist() {
                if (displayParts.length) {
                    displayParts.push(lineBreakPart());
                }
            }

            function addFullSymbolName(symbol: Symbol, enclosingDeclaration?: Node) {
                let fullSymbolDisplayParts = symbolToDisplayParts(typeChecker, symbol, enclosingDeclaration || sourceFile, /*meaning*/ undefined,
                    SymbolFormatFlags.WriteTypeParametersOrArguments | SymbolFormatFlags.UseOnlyExternalAliasing);
                displayParts.push.apply(displayParts, fullSymbolDisplayParts);
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
                displayParts.push.apply(displayParts, signatureToDisplayParts(typeChecker, signature, enclosingDeclaration, flags | TypeFormatFlags.WriteTypeArgumentsOfSignature));
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
                let typeParameterParts = mapToDisplayParts(writer => {
                    typeChecker.getSymbolDisplayBuilder().buildTypeParameterDisplayFromSymbol(symbol, writer, enclosingDeclaration);
                });
                displayParts.push.apply(displayParts, typeParameterParts);
            }
        }

        function getQuickInfoAtPosition(fileName: string, position: number): QuickInfo {
            synchronizeHostData();

            let sourceFile = getValidSourceFile(fileName);
            let node = getTouchingPropertyName(sourceFile, position);
            if (!node) {
                return undefined;
            }

            if (isLabelName(node)) {
                return undefined;
            }

            let typeChecker = program.getTypeChecker();
            let symbol = typeChecker.getSymbolAtLocation(node);

            if (!symbol) {
                // Try getting just type at this position and show
                switch (node.kind) {
                    case SyntaxKind.Identifier:
                    case SyntaxKind.PropertyAccessExpression:
                    case SyntaxKind.QualifiedName:
                    case SyntaxKind.ThisKeyword:
                    case SyntaxKind.SuperKeyword:
                        // For the identifiers/this/super etc get the type at position
                        let type = typeChecker.getTypeAtLocation(node);
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

            let displayPartsDocumentationsAndKind = getSymbolDisplayPartsDocumentationAndSymbolKind(symbol, sourceFile, getContainerNode(node), node);
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

        /// Goto definition
        function getDefinitionAtPosition(fileName: string, position: number): DefinitionInfo[] {
            synchronizeHostData();

            let sourceFile = getValidSourceFile(fileName);

            let node = getTouchingPropertyName(sourceFile, position);
            if (!node) {
                return undefined;
            }

            // Labels
            if (isJumpStatementTarget(node)) {
                let labelName = (<Identifier>node).text;
                let label = getTargetLabel((<BreakOrContinueStatement>node.parent), (<Identifier>node).text);
                return label ? [createDefinitionInfo(label, ScriptElementKind.label, labelName, /*containerName*/ undefined)] : undefined;
            }

            /// Triple slash reference comments
            let comment = forEach(sourceFile.referencedFiles, r => (r.pos <= position && position < r.end) ? r : undefined);
            if (comment) {
                let referenceFile = tryResolveScriptReference(program, sourceFile, comment);
                if (referenceFile) {
                    return [{
                        fileName: referenceFile.fileName,
                        textSpan: createTextSpanFromBounds(0, 0),
                        kind: ScriptElementKind.scriptElement,
                        name: comment.fileName,
                        containerName: undefined,
                        containerKind: undefined
                    }];
                }
                return undefined;
            }

            let typeChecker = program.getTypeChecker();
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
                let declaration = symbol.declarations[0];
                if (node.kind === SyntaxKind.Identifier && node.parent === declaration) {
                    symbol = typeChecker.getAliasedSymbol(symbol);
                }
            }

            // Because name in short-hand property assignment has two different meanings: property name and property value,
            // using go-to-definition at such position should go to the variable declaration of the property value rather than
            // go to the declaration of the property name (in this case stay at the same position). However, if go-to-definition 
            // is performed at the location of property access, we would like to go to definition of the property in the short-hand
            // assignment. This case and others are handled by the following code.
            if (node.parent.kind === SyntaxKind.ShorthandPropertyAssignment) {
                let shorthandSymbol = typeChecker.getShorthandAssignmentValueSymbol(symbol.valueDeclaration);
                if (!shorthandSymbol) {
                    return [];
                }

                let shorthandDeclarations = shorthandSymbol.getDeclarations();
                let shorthandSymbolKind = getSymbolKind(shorthandSymbol, node);
                let shorthandSymbolName = typeChecker.symbolToString(shorthandSymbol);
                let shorthandContainerName = typeChecker.symbolToString(symbol.parent, node);
                return map(shorthandDeclarations,
                    declaration => createDefinitionInfo(declaration, shorthandSymbolKind, shorthandSymbolName, shorthandContainerName));
            }

            let result: DefinitionInfo[] = [];
            let declarations = symbol.getDeclarations();
            let symbolName = typeChecker.symbolToString(symbol); // Do not get scoped name, just the name of the symbol
            let symbolKind = getSymbolKind(symbol, node);
            let containerSymbol = symbol.parent;
            let containerName = containerSymbol ? typeChecker.symbolToString(containerSymbol, node) : "";

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
                        let classDeclaration = <ClassDeclaration>symbol.getDeclarations()[0];
                        Debug.assert(classDeclaration && classDeclaration.kind === SyntaxKind.ClassDeclaration);

                        return tryAddSignature(classDeclaration.members, /*selectConstructors*/ true, symbolKind, symbolName, containerName, result);
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
                let declarations: Declaration[] = [];
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
                    result.push(createDefinitionInfo(declarations[declarations.length - 1], symbolKind, symbolName, containerName));
                    return true;
                }

                return false;
            }
        }

        function getOccurrencesAtPosition(fileName: string, position: number): ReferenceEntry[] {
            let results = getOccurrencesAtPositionCore(fileName, position);
            
            if (results) {
                let sourceFile = getCanonicalFileName(normalizeSlashes(fileName));

                // Get occurrences only supports reporting occurrences for the file queried.  So 
                // filter down to that list.
                results = filter(results, r => getCanonicalFileName(ts.normalizeSlashes(r.fileName)) === sourceFile);
            }

            return results;
        }

        function getDocumentHighlights(fileName: string, position: number, filesToSearch: string[]): DocumentHighlights[] {
            synchronizeHostData();

            filesToSearch = map(filesToSearch, normalizeSlashes);
            let sourceFilesToSearch = filter(program.getSourceFiles(), f => contains(filesToSearch, f.fileName));
            let sourceFile = getValidSourceFile(fileName);

            let node = getTouchingWord(sourceFile, position);
            if (!node) {
                return undefined;
            }

            return getSemanticDocumentHighlights(node) || getSyntacticDocumentHighlights(node);

            function getHighlightSpanForNode(node: Node): HighlightSpan {
                let start = node.getStart();
                let end = node.getEnd();

                return {
                    fileName: sourceFile.fileName,
                    textSpan: createTextSpanFromBounds(start, end),
                    kind: HighlightSpanKind.none
                };
            }

            function getSemanticDocumentHighlights(node: Node): DocumentHighlights[] {
                if (node.kind === SyntaxKind.Identifier ||
                    node.kind === SyntaxKind.ThisKeyword ||
                    node.kind === SyntaxKind.SuperKeyword ||
                    isLiteralNameOfPropertyDeclarationOrIndexAccess(node) ||
                    isNameOfExternalModuleImportOrDeclaration(node)) {

                    let referencedSymbols = getReferencedSymbolsForNodes(node, sourceFilesToSearch, /*findInStrings:*/ false, /*findInComments:*/ false);
                    return convertReferencedSymbols(referencedSymbols);
                }

                return undefined;

                function convertReferencedSymbols(referencedSymbols: ReferencedSymbol[]): DocumentHighlights[] {
                    if (!referencedSymbols) {
                        return undefined;
                    }

                    let fileNameToDocumentHighlights: Map<DocumentHighlights> = {};
                    let result: DocumentHighlights[] = [];
                    for (let referencedSymbol of referencedSymbols) {
                        for (let referenceEntry of referencedSymbol.references) {
                            let fileName = referenceEntry.fileName;
                            let documentHighlights = getProperty(fileNameToDocumentHighlights, fileName);
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
                let fileName = sourceFile.fileName;

                var highlightSpans = getHighlightSpans(node);
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
                                    return getBreakOrContinueStatementOccurences(<BreakOrContinueStatement>node.parent);
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
                            default:
                                if (isModifier(node.kind) && node.parent &&
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
                    let statementAccumulator: ThrowStatement[] = []
                    aggregate(node);
                    return statementAccumulator;

                    function aggregate(node: Node): void {
                        if (node.kind === SyntaxKind.ThrowStatement) {
                            statementAccumulator.push(<ThrowStatement>node);
                        }
                        else if (node.kind === SyntaxKind.TryStatement) {
                            let tryStatement = <TryStatement>node;

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
                    };
                }

                /**
                 * For lack of a better name, this function takes a throw statement and returns the
                 * nearest ancestor that is a try-block (whose try statement has a catch clause),
                 * function-block, or source file.
                 */
                function getThrowStatementOwner(throwStatement: ThrowStatement): Node {
                    let child: Node = throwStatement;

                    while (child.parent) {
                        let parent = child.parent;

                        if (isFunctionBlock(parent) || parent.kind === SyntaxKind.SourceFile) {
                            return parent;
                        }
                    
                        // A throw-statement is only owned by a try-statement if the try-statement has
                        // a catch clause, and if the throw-statement occurs within the try block.
                        if (parent.kind === SyntaxKind.TryStatement) {
                            let tryStatement = <TryStatement>parent;

                            if (tryStatement.tryBlock === child && tryStatement.catchClause) {
                                return child;
                            }
                        }

                        child = parent;
                    }

                    return undefined;
                }

                function aggregateAllBreakAndContinueStatements(node: Node): BreakOrContinueStatement[] {
                    let statementAccumulator: BreakOrContinueStatement[] = []
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
                    };
                }

                function ownsBreakOrContinueStatement(owner: Node, statement: BreakOrContinueStatement): boolean {
                    let actualOwner = getBreakOrContinueOwner(statement);

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
                    let container = declaration.parent;

                    // Make sure we only highlight the keyword when it makes sense to do so.
                    if (isAccessibilityModifier(modifier)) {
                        if (!(container.kind === SyntaxKind.ClassDeclaration ||
                            (declaration.kind === SyntaxKind.Parameter && hasKind(container, SyntaxKind.Constructor)))) {
                            return undefined;
                        }
                    }
                    else if (modifier === SyntaxKind.StaticKeyword) {
                        if (container.kind !== SyntaxKind.ClassDeclaration) {
                            return undefined;
                        }
                    }
                    else if (modifier === SyntaxKind.ExportKeyword || modifier === SyntaxKind.DeclareKeyword) {
                        if (!(container.kind === SyntaxKind.ModuleBlock || container.kind === SyntaxKind.SourceFile)) {
                            return undefined;
                        }
                    }
                    else { 
                        // unsupported modifier
                        return undefined;
                    }

                    let keywords: Node[] = [];
                    let modifierFlag: NodeFlags = getFlagFromModifier(modifier);

                    let nodes: Node[];
                    switch (container.kind) {
                        case SyntaxKind.ModuleBlock:
                        case SyntaxKind.SourceFile:
                            nodes = (<Block>container).statements;
                            break;
                        case SyntaxKind.Constructor:
                            nodes = (<Node[]>(<ConstructorDeclaration>container).parameters).concat(
                                (<ClassDeclaration>container.parent).members);
                            break;
                        case SyntaxKind.ClassDeclaration:
                            nodes = (<ClassDeclaration>container).members;

                            // If we're an accessibility modifier, we're in an instance member and should search
                            // the constructor's parameter list for instance members as well.
                            if (modifierFlag & NodeFlags.AccessibilityModifier) {
                                let constructor = forEach((<ClassDeclaration>container).members, member => {
                                    return member.kind === SyntaxKind.Constructor && <ConstructorDeclaration>member;
                                });

                                if (constructor) {
                                    nodes = nodes.concat(constructor.parameters);
                                }
                            }
                            break;
                        default:
                            Debug.fail("Invalid container kind.")
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
                    let keywords: Node[] = [];

                    tryPushAccessorKeyword(accessorDeclaration.symbol, SyntaxKind.GetAccessor);
                    tryPushAccessorKeyword(accessorDeclaration.symbol, SyntaxKind.SetAccessor);

                    return map(keywords, getHighlightSpanForNode);

                    function tryPushAccessorKeyword(accessorSymbol: Symbol, accessorKind: SyntaxKind): void {
                        let accessor = getDeclarationOfKind(accessorSymbol, accessorKind);

                        if (accessor) {
                            forEach(accessor.getChildren(), child => pushKeywordIf(keywords, child, SyntaxKind.GetKeyword, SyntaxKind.SetKeyword));
                        }
                    }
                }

                function getConstructorOccurrences(constructorDeclaration: ConstructorDeclaration): HighlightSpan[] {
                    let declarations = constructorDeclaration.symbol.getDeclarations()

                    let keywords: Node[] = [];

                    forEach(declarations, declaration => {
                        forEach(declaration.getChildren(), token => {
                            return pushKeywordIf(keywords, token, SyntaxKind.ConstructorKeyword);
                        });
                    });

                    return map(keywords, getHighlightSpanForNode);
                }

                function getLoopBreakContinueOccurrences(loopNode: IterationStatement): HighlightSpan[] {
                    let keywords: Node[] = [];

                    if (pushKeywordIf(keywords, loopNode.getFirstToken(), SyntaxKind.ForKeyword, SyntaxKind.WhileKeyword, SyntaxKind.DoKeyword)) {
                        // If we succeeded and got a do-while loop, then start looking for a 'while' keyword.
                        if (loopNode.kind === SyntaxKind.DoStatement) {
                            let loopTokens = loopNode.getChildren();

                            for (let i = loopTokens.length - 1; i >= 0; i--) {
                                if (pushKeywordIf(keywords, loopTokens[i], SyntaxKind.WhileKeyword)) {
                                    break;
                                }
                            }
                        }
                    }

                    let breaksAndContinues = aggregateAllBreakAndContinueStatements(loopNode.statement);

                    forEach(breaksAndContinues, statement => {
                        if (ownsBreakOrContinueStatement(loopNode, statement)) {
                            pushKeywordIf(keywords, statement.getFirstToken(), SyntaxKind.BreakKeyword, SyntaxKind.ContinueKeyword);
                        }
                    });

                    return map(keywords, getHighlightSpanForNode);
                }

                function getBreakOrContinueStatementOccurences(breakOrContinueStatement: BreakOrContinueStatement): HighlightSpan[] {
                    let owner = getBreakOrContinueOwner(breakOrContinueStatement);

                    if (owner) {
                        switch (owner.kind) {
                            case SyntaxKind.ForStatement:
                            case SyntaxKind.ForInStatement:
                            case SyntaxKind.ForOfStatement:
                            case SyntaxKind.DoStatement:
                            case SyntaxKind.WhileStatement:
                                return getLoopBreakContinueOccurrences(<IterationStatement>owner)
                            case SyntaxKind.SwitchStatement:
                                return getSwitchCaseDefaultOccurrences(<SwitchStatement>owner);

                        }
                    }

                    return undefined;
                }

                function getSwitchCaseDefaultOccurrences(switchStatement: SwitchStatement): HighlightSpan[] {
                    let keywords: Node[] = [];

                    pushKeywordIf(keywords, switchStatement.getFirstToken(), SyntaxKind.SwitchKeyword);

                    // Go through each clause in the switch statement, collecting the 'case'/'default' keywords.
                    forEach(switchStatement.caseBlock.clauses, clause => {
                        pushKeywordIf(keywords, clause.getFirstToken(), SyntaxKind.CaseKeyword, SyntaxKind.DefaultKeyword);

                        let breaksAndContinues = aggregateAllBreakAndContinueStatements(clause);

                        forEach(breaksAndContinues, statement => {
                            if (ownsBreakOrContinueStatement(switchStatement, statement)) {
                                pushKeywordIf(keywords, statement.getFirstToken(), SyntaxKind.BreakKeyword);
                            }
                        });
                    });

                    return map(keywords, getHighlightSpanForNode);
                }

                function getTryCatchFinallyOccurrences(tryStatement: TryStatement): HighlightSpan[] {
                    let keywords: Node[] = [];

                    pushKeywordIf(keywords, tryStatement.getFirstToken(), SyntaxKind.TryKeyword);

                    if (tryStatement.catchClause) {
                        pushKeywordIf(keywords, tryStatement.catchClause.getFirstToken(), SyntaxKind.CatchKeyword);
                    }

                    if (tryStatement.finallyBlock) {
                        let finallyKeyword = findChildOfKind(tryStatement, SyntaxKind.FinallyKeyword, sourceFile);
                        pushKeywordIf(keywords, finallyKeyword, SyntaxKind.FinallyKeyword);
                    }

                    return map(keywords, getHighlightSpanForNode);
                }

                function getThrowOccurrences(throwStatement: ThrowStatement): HighlightSpan[] {
                    let owner = getThrowStatementOwner(throwStatement);

                    if (!owner) {
                        return undefined;
                    }

                    let keywords: Node[] = [];

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
                    let func = <FunctionLikeDeclaration>getContainingFunction(returnStatement);

                    // If we didn't find a containing function with a block body, bail out.
                    if (!(func && hasKind(func.body, SyntaxKind.Block))) {
                        return undefined;
                    }

                    let keywords: Node[] = []
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
                    let keywords: Node[] = [];

                    // Traverse upwards through all parent if-statements linked by their else-branches.
                    while (hasKind(ifStatement.parent, SyntaxKind.IfStatement) && (<IfStatement>ifStatement.parent).elseStatement === ifStatement) {
                        ifStatement = <IfStatement>ifStatement.parent;
                    }

                    // Now traverse back down through the else branches, aggregating if/else keywords of if-statements.
                    while (ifStatement) {
                        let children = ifStatement.getChildren();
                        pushKeywordIf(keywords, children[0], SyntaxKind.IfKeyword);

                        // Generally the 'else' keyword is second-to-last, so we traverse backwards.
                        for (let i = children.length - 1; i >= 0; i--) {
                            if (pushKeywordIf(keywords, children[i], SyntaxKind.ElseKeyword)) {
                                break;
                            }
                        }

                        if (!hasKind(ifStatement.elseStatement, SyntaxKind.IfStatement)) {
                            break
                        }

                        ifStatement = <IfStatement>ifStatement.elseStatement;
                    }

                    let result: HighlightSpan[] = [];

                    // We'd like to highlight else/ifs together if they are only separated by whitespace
                    // (i.e. the keywords are separated by no comments, no newlines).
                    for (let i = 0; i < keywords.length; i++) {
                        if (keywords[i].kind === SyntaxKind.ElseKeyword && i < keywords.length - 1) {
                            let elseKeyword = keywords[i];
                            let ifKeyword = keywords[i + 1]; // this *should* always be an 'if' keyword.

                            let shouldCombindElseAndIf = true;

                            // Avoid recalculating getStart() by iterating backwards.
                            for (let j = ifKeyword.getStart() - 1; j >= elseKeyword.end; j--) {
                                if (!isWhiteSpace(sourceFile.text.charCodeAt(j))) {
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

                let result: ReferenceEntry[] = [];
                for (let entry of documentHighlights) {
                    for (let highlightSpan of entry.highlightSpans) {
                        result.push({
                            fileName: entry.fileName,
                            textSpan: highlightSpan.textSpan,
                            isWriteAccess: highlightSpan.kind === HighlightSpanKind.writtenReference
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

            let referenceEntries: ReferenceEntry[] = [];

            for (let referenceSymbol of referenceSymbols) {
                addRange(referenceEntries, referenceSymbol.references);
            }

            return referenceEntries;
        }

        function findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): RenameLocation[] {
            var referencedSymbols = findReferencedSymbols(fileName, position, findInStrings, findInComments);
            return convertReferences(referencedSymbols);
        }

        function getReferencesAtPosition(fileName: string, position: number): ReferenceEntry[] {
            var referencedSymbols = findReferencedSymbols(fileName, position, /*findInStrings:*/ false, /*findInComments:*/ false);
            return convertReferences(referencedSymbols);
        }

        function findReferences(fileName: string, position: number): ReferencedSymbol[]{
            var referencedSymbols = findReferencedSymbols(fileName, position, /*findInStrings:*/ false, /*findInComments:*/ false);

            // Only include referenced symbols that have a valid definition.
            return filter(referencedSymbols, rs => !!rs.definition);
        }

        function findReferencedSymbols(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): ReferencedSymbol[] {
            synchronizeHostData();

            let sourceFile = getValidSourceFile(fileName);

            let node = getTouchingPropertyName(sourceFile, position);
            if (!node) {
                return undefined;
            }

            if (node.kind !== SyntaxKind.Identifier &&
                // TODO (drosen): This should be enabled in a later release - currently breaks rename.
                //node.kind !== SyntaxKind.ThisKeyword &&
                //node.kind !== SyntaxKind.SuperKeyword &&
                !isLiteralNameOfPropertyDeclarationOrIndexAccess(node) &&
                !isNameOfExternalModuleImportOrDeclaration(node)) {
                return undefined;
            }

            Debug.assert(node.kind === SyntaxKind.Identifier || node.kind === SyntaxKind.NumericLiteral || node.kind === SyntaxKind.StringLiteral);
            return getReferencedSymbolsForNodes(node, program.getSourceFiles(), findInStrings, findInComments);
        }

        function getReferencedSymbolsForNodes(node: Node, sourceFiles: SourceFile[], findInStrings: boolean, findInComments: boolean): ReferencedSymbol[] {
            let typeChecker = program.getTypeChecker();

            // Labels
            if (isLabelName(node)) {
                if (isJumpStatementTarget(node)) {
                    let labelDefinition = getTargetLabel((<BreakOrContinueStatement>node.parent), (<Identifier>node).text);
                    // if we have a label definition, look within its statement for references, if not, then
                    // the label is undefined and we have no results..
                    return labelDefinition ? getLabelReferencesInNode(labelDefinition.parent, labelDefinition) : undefined;
                }
                else {
                    // it is a label definition and not a target, search within the parent labeledStatement
                    return getLabelReferencesInNode(node.parent, <Identifier>node);
                }
            }

            if (node.kind === SyntaxKind.ThisKeyword) {
                return getReferencesForThisKeyword(node, sourceFiles);
            }

            if (node.kind === SyntaxKind.SuperKeyword) {
                return getReferencesForSuperKeyword(node);
            }

            let symbol = typeChecker.getSymbolAtLocation(node);

            // Could not find a symbol e.g. unknown identifier
            if (!symbol) {
                // Can't have references to something that we have no symbol for.
                return undefined;
            }

            let declarations = symbol.declarations;

            // The symbol was an internal symbol and does not have a declaration e.g.undefined symbol
            if (!declarations || !declarations.length) {
                return undefined;
            }

            let result: ReferencedSymbol[];

            // Compute the meaning from the location and the symbol it references
            let searchMeaning = getIntersectingMeaningFromDeclarations(getMeaningFromLocation(node), declarations);

            // Get the text to search for, we need to normalize it as external module names will have quote
            let declaredName = getDeclaredName(symbol, node);

            // Try to get the smallest valid scope that we can limit our search to;
            // otherwise we'll need to search globally (i.e. include each file).
            let scope = getSymbolScope(symbol);

            // Maps from a symbol ID to the ReferencedSymbol entry in 'result'.
            let symbolToIndex: number[] = [];

            if (scope) {
                result = [];
                getReferencesInNode(scope, symbol, declaredName, node, searchMeaning, findInStrings, findInComments, result, symbolToIndex);
            }
            else {
                let internedName = getInternedName(symbol, node, declarations)
                for (let sourceFile of sourceFiles) {
                    cancellationToken.throwIfCancellationRequested();

                    let nameTable = getNameTable(sourceFile);

                    if (lookUp(nameTable, internedName)) {
                        result = result || [];
                        getReferencesInNode(sourceFile, symbol, declaredName, node, searchMeaning, findInStrings, findInComments, result, symbolToIndex);
                    }
                }
            }

            return result;

            function getDefinition(symbol: Symbol): DefinitionInfo {
                let info = getSymbolDisplayPartsDocumentationAndSymbolKind(symbol, node.getSourceFile(), getContainerNode(node), node);
                let name = map(info.displayParts, p => p.text).join("");
                let declarations = symbol.declarations;
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

            function isImportOrExportSpecifierName(location: Node): boolean {
                return location.parent &&
                    (location.parent.kind === SyntaxKind.ImportSpecifier || location.parent.kind === SyntaxKind.ExportSpecifier) &&
                    (<ImportOrExportSpecifier>location.parent).propertyName === location;
            }

            function isImportOrExportSpecifierImportSymbol(symbol: Symbol) {
                return (symbol.flags & SymbolFlags.Alias) && forEach(symbol.declarations, declaration => {
                    return declaration.kind === SyntaxKind.ImportSpecifier || declaration.kind === SyntaxKind.ExportSpecifier;
                });
            }

            function getDeclaredName(symbol: Symbol, location: Node) {
                // Special case for function expressions, whose names are solely local to their bodies.
                let functionExpression = forEach(symbol.declarations, d => d.kind === SyntaxKind.FunctionExpression ? <FunctionExpression>d : undefined);

                // When a name gets interned into a SourceFile's 'identifiers' Map,
                // its name is escaped and stored in the same way its symbol name/identifier
                // name should be stored. Function expressions, however, are a special case,
                // because despite sometimes having a name, the binder unconditionally binds them
                // to a symbol with the name "__function".
                let name: string;
                if (functionExpression && functionExpression.name) {
                    name = functionExpression.name.text;
                }

                // If this is an export or import specifier it could have been renamed using the as syntax.
                // if so we want to search for whatever under the cursor, the symbol is pointing to the alias (name)
                // so check for the propertyName.
                if (isImportOrExportSpecifierName(location)) {
                    return location.getText();
                }

                name = typeChecker.symbolToString(symbol);

                return stripQuotes(name);
            }

            function getInternedName(symbol: Symbol, location: Node, declarations: Declaration[]): string {
                // If this is an export or import specifier it could have been renamed using the as syntax.
                // if so we want to search for whatever under the cursor, the symbol is pointing to the alias (name)
                // so check for the propertyName.
                if (isImportOrExportSpecifierName(location)) {
                    return location.getText();
                }

                // Special case for function expressions, whose names are solely local to their bodies.
                let functionExpression = forEach(declarations, d => d.kind === SyntaxKind.FunctionExpression ? <FunctionExpression>d : undefined);

                // When a name gets interned into a SourceFile's 'identifiers' Map,
                // its name is escaped and stored in the same way its symbol name/identifier
                // name should be stored. Function expressions, however, are a special case,
                // because despite sometimes having a name, the binder unconditionally binds them
                // to a symbol with the name "__function".
                let name = functionExpression && functionExpression.name
                    ? functionExpression.name.text
                    : symbol.name;

                return stripQuotes(name);
            }

            function stripQuotes(name: string) {
                let length = name.length;
                if (length >= 2 && name.charCodeAt(0) === CharacterCodes.doubleQuote && name.charCodeAt(length - 1) === CharacterCodes.doubleQuote) {
                    return name.substring(1, length - 1);
                };
                return name;
            }

            function getSymbolScope(symbol: Symbol): Node {
                // If this is private property or method, the scope is the containing class
                if (symbol.flags & (SymbolFlags.Property | SymbolFlags.Method)) {
                    let privateDeclaration = forEach(symbol.getDeclarations(), d => (d.flags & NodeFlags.Private) ? d : undefined);
                    if (privateDeclaration) {
                        return getAncestor(privateDeclaration, SyntaxKind.ClassDeclaration);
                    }
                }

                // If the symbol is an import we would like to find it if we are looking for what it imports.
                // So consider it visibile outside its declaration scope.
                if (symbol.flags & SymbolFlags.Alias) {
                    return undefined;
                }

                // if this symbol is visible from its parent container, e.g. exported, then bail out
                // if symbol correspond to the union property - bail out
                if (symbol.parent || (symbol.flags & SymbolFlags.UnionProperty)) {
                    return undefined;
                }

                let scope: Node = undefined;

                let declarations = symbol.getDeclarations();
                if (declarations) {
                    for (let declaration of declarations) {
                        let container = getContainerNode(declaration);

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
                let positions: number[] = [];

                /// TODO: Cache symbol existence for files to save text search
                // Also, need to make this work for unicode escapes.

                // Be resilient in the face of a symbol with no name or zero length name
                if (!symbolName || !symbolName.length) {
                    return positions;
                }

                let text = sourceFile.text;
                let sourceLength = text.length;
                let symbolNameLength = symbolName.length;

                let position = text.indexOf(symbolName, start);
                while (position >= 0) {
                    cancellationToken.throwIfCancellationRequested();

                    // If we are past the end, stop looking
                    if (position > end) break;

                    // We found a match.  Make sure it's not part of a larger word (i.e. the char 
                    // before and after it have to be a non-identifier char).
                    let endPosition = position + symbolNameLength;

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
                let references: ReferenceEntry[] = [];
                let sourceFile = container.getSourceFile();
                let labelName = targetLabel.text;
                let possiblePositions = getPossibleSymbolReferencePositions(sourceFile, labelName, container.getStart(), container.getEnd());
                forEach(possiblePositions, position => {
                    cancellationToken.throwIfCancellationRequested();

                    let node = getTouchingWord(sourceFile, position);
                    if (!node || node.getWidth() !== labelName.length) {
                        return;
                    }

                    // Only pick labels that are either the target label, or have a target that is the target label
                    if (node === targetLabel ||
                        (isJumpStatementTarget(node) && getTargetLabel(node, labelName) === targetLabel)) {
                        references.push(getReferenceEntryFromNode(node));
                    }
                });

                var definition: DefinitionInfo = {
                    containerKind: "",
                    containerName: "",
                    fileName: targetLabel.getSourceFile().fileName,
                    kind: ScriptElementKind.label,
                    name: labelName,
                    textSpan: createTextSpanFromBounds(targetLabel.getStart(), targetLabel.getEnd())
                }

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

                let sourceFile = container.getSourceFile();
                let tripleSlashDirectivePrefixRegex = /^\/\/\/\s*</

                let possiblePositions = getPossibleSymbolReferencePositions(sourceFile, searchText, container.getStart(), container.getEnd());

                if (possiblePositions.length) {
                    // Build the set of symbols to search for, initially it has only the current symbol
                    let searchSymbols = populateSearchSymbolSet(searchSymbol, searchLocation);

                    forEach(possiblePositions, position => {
                        cancellationToken.throwIfCancellationRequested();

                        let referenceLocation = getTouchingPropertyName(sourceFile, position);
                        if (!isValidReferencePosition(referenceLocation, searchText)) {
                            // This wasn't the start of a token.  Check to see if it might be a 
                            // match in a comment or string if that's what the caller is asking
                            // for.
                            if ((findInStrings && isInString(position)) ||
                                (findInComments && isInComment(position))) {

                                // In the case where we're looking inside comments/strings, we don't have
                                // an actual definition.  So just use 'undefined' here.  Features like
                                // 'Rename' won't care (as they ignore the definitions), and features like
                                // 'FindReferences' will just filter out these results.
                                result.push({
                                    definition: undefined,
                                    references: [{
                                        fileName: sourceFile.fileName,
                                        textSpan: createTextSpan(position, searchText.length),
                                        isWriteAccess: false
                                    }]
                                });
                            }
                            return;
                        }

                        if (!(getMeaningFromLocation(referenceLocation) & searchMeaning)) {
                            return;
                        }

                        let referenceSymbol = typeChecker.getSymbolAtLocation(referenceLocation);
                        if (referenceSymbol) {
                            let referenceSymbolDeclaration = referenceSymbol.valueDeclaration;
                            let shorthandValueSymbol = typeChecker.getShorthandAssignmentValueSymbol(referenceSymbolDeclaration);
                            var relatedSymbol = getRelatedSymbol(searchSymbols, referenceSymbol, referenceLocation);

                            if (relatedSymbol) {
                                var referencedSymbol = getReferencedSymbol(relatedSymbol);
                                referencedSymbol.references.push(getReferenceEntryFromNode(referenceLocation));
                            }
                            /* Because in short-hand property assignment, an identifier which stored as name of the short-hand property assignment
                             * has two meaning : property name and property value. Therefore when we do findAllReference at the position where
                             * an identifier is declared, the language service should return the position of the variable declaration as well as
                             * the position in short-hand property assignment excluding property accessing. However, if we do findAllReference at the
                             * position of property accessing, the referenceEntry of such position will be handled in the first case.
                             */
                            else if (!(referenceSymbol.flags & SymbolFlags.Transient) && searchSymbols.indexOf(shorthandValueSymbol) >= 0) {
                                var referencedSymbol = getReferencedSymbol(shorthandValueSymbol);
                                referencedSymbol.references.push(getReferenceEntryFromNode(referenceSymbolDeclaration.name));
                            }
                        }
                    });
                }

                return;

                function getReferencedSymbol(symbol: Symbol): ReferencedSymbol {
                    var symbolId = getSymbolId(symbol);
                    var index = symbolToIndex[symbolId];
                    if (index === undefined) {
                        index = result.length;
                        symbolToIndex[symbolId] = index;

                        result.push({
                            definition: getDefinition(symbol),
                            references: []
                        });
                    }

                    return result[index];
                }

                function isInString(position: number) {
                    let token = getTokenAtPosition(sourceFile, position);
                    return token && token.kind === SyntaxKind.StringLiteral && position > token.getStart();
                }

                function isInComment(position: number) {
                    let token = getTokenAtPosition(sourceFile, position);
                    if (token && position < token.getStart()) {
                        // First, we have to see if this position actually landed in a comment.
                        let commentRanges = getLeadingCommentRanges(sourceFile.text, token.pos);

                        // Then we want to make sure that it wasn't in a "///<" directive comment
                        // We don't want to unintentionally update a file name.
                        return forEach(commentRanges, c => {
                            if (c.pos < position && position < c.end) {
                                let commentText = sourceFile.text.substring(c.pos, c.end);
                                if (!tripleSlashDirectivePrefixRegex.test(commentText)) {
                                    return true;
                                }
                            }
                        });
                    }

                    return false;
                }
            }

            function getReferencesForSuperKeyword(superKeyword: Node): ReferencedSymbol[] {
                let searchSpaceNode = getSuperContainer(superKeyword, /*includeFunctions*/ false);
                if (!searchSpaceNode) {
                    return undefined;
                }
                // Whether 'super' occurs in a static context within a class.
                let staticFlag = NodeFlags.Static;

                switch (searchSpaceNode.kind) {
                    case SyntaxKind.PropertyDeclaration:
                    case SyntaxKind.PropertySignature:
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                    case SyntaxKind.Constructor:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                        staticFlag &= searchSpaceNode.flags;
                        searchSpaceNode = searchSpaceNode.parent; // re-assign to be the owning class
                        break;
                    default:
                        return undefined;
                }

                let references: ReferenceEntry[] = [];

                let sourceFile = searchSpaceNode.getSourceFile();
                let possiblePositions = getPossibleSymbolReferencePositions(sourceFile, "super", searchSpaceNode.getStart(), searchSpaceNode.getEnd());
                forEach(possiblePositions, position => {
                    cancellationToken.throwIfCancellationRequested();

                    let node = getTouchingWord(sourceFile, position);

                    if (!node || node.kind !== SyntaxKind.SuperKeyword) {
                        return;
                    }

                    let container = getSuperContainer(node, /*includeFunctions*/ false);

                    // If we have a 'super' container, we must have an enclosing class.
                    // Now make sure the owning class is the same as the search-space
                    // and has the same static qualifier as the original 'super's owner.
                    if (container && (NodeFlags.Static & container.flags) === staticFlag && container.parent.symbol === searchSpaceNode.symbol) {
                        references.push(getReferenceEntryFromNode(node));
                    }
                });

                var definition = getDefinition(searchSpaceNode.symbol);
                return [{ definition, references }];
            }

            function getReferencesForThisKeyword(thisOrSuperKeyword: Node, sourceFiles: SourceFile[]): ReferencedSymbol[] {
                let searchSpaceNode = getThisContainer(thisOrSuperKeyword, /* includeArrowFunctions */ false);

                // Whether 'this' occurs in a static context within a class.
                let staticFlag = NodeFlags.Static;

                switch (searchSpaceNode.kind) {
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                        if (isObjectLiteralMethod(searchSpaceNode)) {
                            break;
                        }
                    // fall through
                    case SyntaxKind.PropertyDeclaration:
                    case SyntaxKind.PropertySignature:
                    case SyntaxKind.Constructor:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                        staticFlag &= searchSpaceNode.flags
                        searchSpaceNode = searchSpaceNode.parent; // re-assign to be the owning class
                        break;
                    case SyntaxKind.SourceFile:
                        if (isExternalModule(<SourceFile>searchSpaceNode)) {
                            return undefined;
                        }
                    // Fall through
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.FunctionExpression:
                        break;
                    // Computed properties in classes are not handled here because references to this are illegal,
                    // so there is no point finding references to them.
                    default:
                        return undefined;
                }

                let references: ReferenceEntry[] = [];

                let possiblePositions: number[];
                if (searchSpaceNode.kind === SyntaxKind.SourceFile) {
                    forEach(sourceFiles, sourceFile => {
                        possiblePositions = getPossibleSymbolReferencePositions(sourceFile, "this", sourceFile.getStart(), sourceFile.getEnd());
                        getThisReferencesInFile(sourceFile, sourceFile, possiblePositions, references);
                    });
                }
                else {
                    let sourceFile = searchSpaceNode.getSourceFile();
                    possiblePositions = getPossibleSymbolReferencePositions(sourceFile, "this", searchSpaceNode.getStart(), searchSpaceNode.getEnd());
                    getThisReferencesInFile(sourceFile, searchSpaceNode, possiblePositions, references);
                }

                return [{
                    definition: {
                        containerKind: "",
                        containerName: "",
                        fileName: node.getSourceFile().fileName,
                        kind: ScriptElementKind.variableElement,
                        name: "this",
                        textSpan: createTextSpanFromBounds(node.getStart(), node.getEnd())
                    },
                    references: references
                }];

                function getThisReferencesInFile(sourceFile: SourceFile, searchSpaceNode: Node, possiblePositions: number[], result: ReferenceEntry[]): void {
                    forEach(possiblePositions, position => {
                        cancellationToken.throwIfCancellationRequested();

                        let node = getTouchingWord(sourceFile, position);
                        if (!node || node.kind !== SyntaxKind.ThisKeyword) {
                            return;
                        }

                        let container = getThisContainer(node, /* includeArrowFunctions */ false);

                        switch (searchSpaceNode.kind) {
                            case SyntaxKind.FunctionExpression:
                            case SyntaxKind.FunctionDeclaration:
                                if (searchSpaceNode.symbol === container.symbol) {
                                    result.push(getReferenceEntryFromNode(node));
                                }
                                break;
                            case SyntaxKind.MethodDeclaration:
                            case SyntaxKind.MethodSignature:
                                if (isObjectLiteralMethod(searchSpaceNode) && searchSpaceNode.symbol === container.symbol) {
                                    result.push(getReferenceEntryFromNode(node));
                                }
                                break;
                            case SyntaxKind.ClassDeclaration:
                                // Make sure the container belongs to the same class
                                // and has the appropriate static modifier from the original container.
                                if (container.parent && searchSpaceNode.symbol === container.parent.symbol && (container.flags & NodeFlags.Static) === staticFlag) {
                                    result.push(getReferenceEntryFromNode(node));
                                }
                                break;
                            case SyntaxKind.SourceFile:
                                if (container.kind === SyntaxKind.SourceFile && !isExternalModule(<SourceFile>container)) {
                                    result.push(getReferenceEntryFromNode(node));
                                }
                                break;
                        }
                    });
                }
            }

            function populateSearchSymbolSet(symbol: Symbol, location: Node): Symbol[] {
                // The search set contains at least the current symbol
                let result = [symbol];

                // If the symbol is an alias, add what it alaises to the list
                if (isImportOrExportSpecifierImportSymbol(symbol)) {
                    result.push(typeChecker.getAliasedSymbol(symbol));
                }

                // If the location is in a context sensitive location (i.e. in an object literal) try
                // to get a contextual type for it, and add the property symbol from the contextual
                // type to the search set
                if (isNameOfPropertyAssignment(location)) {
                    forEach(getPropertySymbolsFromContextualType(location), contextualSymbol => {
                        result.push.apply(result, typeChecker.getRootSymbols(contextualSymbol));
                    });

                    /* Because in short-hand property assignment, location has two meaning : property name and as value of the property
                     * When we do findAllReference at the position of the short-hand property assignment, we would want to have references to position of
                     * property name and variable declaration of the identifier.
                     * Like in below example, when querying for all references for an identifier 'name', of the property assignment, the language service
                     * should show both 'name' in 'obj' and 'name' in variable declaration
                     *      let name = "Foo";
                     *      let obj = { name };
                     * In order to do that, we will populate the search set with the value symbol of the identifier as a value of the property assignment
                     * so that when matching with potential reference symbol, both symbols from property declaration and variable declaration
                     * will be included correctly.
                     */
                    let shorthandValueSymbol = typeChecker.getShorthandAssignmentValueSymbol(location.parent);
                    if (shorthandValueSymbol) {
                        result.push(shorthandValueSymbol);
                    }
                }

                // If this is a union property, add all the symbols from all its source symbols in all unioned types.
                // If the symbol is an instantiation from a another symbol (e.g. widened symbol) , add the root the list
                forEach(typeChecker.getRootSymbols(symbol), rootSymbol => {
                    if (rootSymbol !== symbol) {
                        result.push(rootSymbol);
                    }

                    // Add symbol of properties/methods of the same name in base classes and implemented interfaces definitions
                    if (rootSymbol.parent && rootSymbol.parent.flags & (SymbolFlags.Class | SymbolFlags.Interface)) {
                        getPropertySymbolsFromBaseTypes(rootSymbol.parent, rootSymbol.getName(), result);
                    }
                });

                return result;
            }

            function getPropertySymbolsFromBaseTypes(symbol: Symbol, propertyName: string, result: Symbol[]): void {
                if (symbol && symbol.flags & (SymbolFlags.Class | SymbolFlags.Interface)) {
                    forEach(symbol.getDeclarations(), declaration => {
                        if (declaration.kind === SyntaxKind.ClassDeclaration) {
                            getPropertySymbolFromTypeReference(getClassExtendsHeritageClauseElement(<ClassDeclaration>declaration));
                            forEach(getClassImplementsHeritageClauseElements(<ClassDeclaration>declaration), getPropertySymbolFromTypeReference);
                        }
                        else if (declaration.kind === SyntaxKind.InterfaceDeclaration) {
                            forEach(getInterfaceBaseTypeNodes(<InterfaceDeclaration>declaration), getPropertySymbolFromTypeReference);
                        }
                    });
                }
                return;

                function getPropertySymbolFromTypeReference(typeReference: HeritageClauseElement) {
                    if (typeReference) {
                        let type = typeChecker.getTypeAtLocation(typeReference);
                        if (type) {
                            let propertySymbol = typeChecker.getPropertyOfType(type, propertyName);
                            if (propertySymbol) {
                                result.push(propertySymbol);
                            }

                            // Visit the typeReference as well to see if it directly or indirectly use that property
                            getPropertySymbolsFromBaseTypes(type.symbol, propertyName, result);
                        }
                    }
                }
            }

            function getRelatedSymbol(searchSymbols: Symbol[], referenceSymbol: Symbol, referenceLocation: Node): Symbol {
                if (searchSymbols.indexOf(referenceSymbol) >= 0) {
                    return referenceSymbol;
                }

                // If the reference symbol is an alias, check if what it is aliasing is one of the search
                // symbols.
                if (isImportOrExportSpecifierImportSymbol(referenceSymbol)) {
                    var aliasedSymbol = typeChecker.getAliasedSymbol(referenceSymbol);
                    if (searchSymbols.indexOf(aliasedSymbol) >= 0) {
                        return aliasedSymbol;
                    }
                }

                // If the reference location is in an object literal, try to get the contextual type for the 
                // object literal, lookup the property symbol in the contextual type, and use this symbol to
                // compare to our searchSymbol
                if (isNameOfPropertyAssignment(referenceLocation)) {
                    return forEach(getPropertySymbolsFromContextualType(referenceLocation), contextualSymbol => {
                        return forEach(typeChecker.getRootSymbols(contextualSymbol), s => searchSymbols.indexOf(s) >= 0 ? s : undefined);
                    });
                }

                // Unwrap symbols to get to the root (e.g. transient symbols as a result of widening)
                // Or a union property, use its underlying unioned symbols
                return forEach(typeChecker.getRootSymbols(referenceSymbol), rootSymbol => {
                    // if it is in the list, then we are done
                    if (searchSymbols.indexOf(rootSymbol) >= 0) {
                        return rootSymbol;
                    }

                    // Finally, try all properties with the same name in any type the containing type extended or implemented, and 
                    // see if any is in the list
                    if (rootSymbol.parent && rootSymbol.parent.flags & (SymbolFlags.Class | SymbolFlags.Interface)) {
                        let result: Symbol[] = [];
                        getPropertySymbolsFromBaseTypes(rootSymbol.parent, rootSymbol.getName(), result);
                        return forEach(result, s => searchSymbols.indexOf(s) >= 0 ? s : undefined);
                    }

                    return undefined;
                });
            }

            function getPropertySymbolsFromContextualType(node: Node): Symbol[] {
                if (isNameOfPropertyAssignment(node)) {
                    let objectLiteral = <ObjectLiteralExpression>node.parent.parent;
                    let contextualType = typeChecker.getContextualType(objectLiteral);
                    let name = (<Identifier>node).text;
                    if (contextualType) {
                        if (contextualType.flags & TypeFlags.Union) {
                            // This is a union type, first see if the property we are looking for is a union property (i.e. exists in all types)
                            // if not, search the constituent types for the property
                            let unionProperty = contextualType.getProperty(name)
                            if (unionProperty) {
                                return [unionProperty];
                            }
                            else {
                                let result: Symbol[] = [];
                                forEach((<UnionType>contextualType).types, t => {
                                    let symbol = t.getProperty(name);
                                    if (symbol) {
                                        result.push(symbol);
                                    }
                                });
                                return result;
                            }
                        }
                        else {
                            let symbol = contextualType.getProperty(name);
                            if (symbol) {
                                return [symbol];
                            }
                        }
                    }
                }
                return undefined;
            }

            /** Given an initial searchMeaning, extracted from a location, widen the search scope based on the declarations
              * of the corresponding symbol. e.g. if we are searching for "Foo" in value position, but "Foo" references a class
              * then we need to widen the search to include type positions as well.
              * On the contrary, if we are searching for "Bar" in type position and we trace bar to an interface, and an uninstantiated
              * module, we want to keep the search limited to only types, as the two declarations (interface and uninstantiated module)
              * do not intersect in any of the three spaces.
              */
            function getIntersectingMeaningFromDeclarations(meaning: SemanticMeaning, declarations: Declaration[]): SemanticMeaning {
                if (declarations) {
                    let lastIterationMeaning: SemanticMeaning;
                    do {
                        // The result is order-sensitive, for instance if initialMeaning === Namespace, and declarations = [class, instantiated module]
                        // we need to consider both as they initialMeaning intersects with the module in the namespace space, and the module
                        // intersects with the class in the value space.
                        // To achieve that we will keep iterating until the result stabilizes.

                        // Remember the last meaning
                        lastIterationMeaning = meaning;

                        for (let declaration of declarations) {
                            let declarationMeaning = getMeaningFromDeclaration(declaration);

                            if (declarationMeaning & meaning) {
                                meaning |= declarationMeaning;
                            }
                        }
                    }
                    while (meaning !== lastIterationMeaning);
                }
                return meaning;
            }
        }

        function getReferenceEntryFromNode(node: Node): ReferenceEntry {
            let start = node.getStart();
            let end = node.getEnd();

            if (node.kind === SyntaxKind.StringLiteral) {
                start += 1;
                end -= 1;
            }

            return {
                fileName: node.getSourceFile().fileName,
                textSpan: createTextSpanFromBounds(start, end),
                isWriteAccess: isWriteAccess(node)
            };
        }

        /** A node is considered a writeAccess iff it is a name of a declaration or a target of an assignment */
        function isWriteAccess(node: Node): boolean {
            if (node.kind === SyntaxKind.Identifier && isDeclarationName(node)) {
                return true;
            }

            let parent = node.parent;
            if (parent) {
                if (parent.kind === SyntaxKind.PostfixUnaryExpression || parent.kind === SyntaxKind.PrefixUnaryExpression) {
                    return true;
                }
                else if (parent.kind === SyntaxKind.BinaryExpression && (<BinaryExpression>parent).left === node) {
                    let operator = (<BinaryExpression>parent).operatorToken.kind;
                    return SyntaxKind.FirstAssignment <= operator && operator <= SyntaxKind.LastAssignment;
                }
            }

            return false;
        }

        /// NavigateTo
        function getNavigateToItems(searchValue: string, maxResultCount?: number): NavigateToItem[] {
            synchronizeHostData();

            return ts.NavigateTo.getNavigateToItems(program, cancellationToken, searchValue, maxResultCount);
        }

        function containErrors(diagnostics: Diagnostic[]): boolean {
            return forEach(diagnostics, diagnostic => diagnostic.category === DiagnosticCategory.Error);
        }

        function getEmitOutput(fileName: string): EmitOutput {
            synchronizeHostData();

            let sourceFile = getValidSourceFile(fileName);
            let outputFiles: OutputFile[] = [];

            function writeFile(fileName: string, data: string, writeByteOrderMark: boolean) {
                outputFiles.push({
                    name: fileName,
                    writeByteOrderMark: writeByteOrderMark,
                    text: data
                });
            }

            let emitOutput = program.emit(sourceFile, writeFile);

            return {
                outputFiles,
                emitSkipped: emitOutput.emitSkipped
            };
        }

        function getMeaningFromDeclaration(node: Node): SemanticMeaning {
            switch (node.kind) {
                case SyntaxKind.Parameter:
                case SyntaxKind.VariableDeclaration:
                case SyntaxKind.BindingElement:
                case SyntaxKind.PropertyDeclaration:
                case SyntaxKind.PropertySignature:
                case SyntaxKind.PropertyAssignment:
                case SyntaxKind.ShorthandPropertyAssignment:
                case SyntaxKind.EnumMember:
                case SyntaxKind.MethodDeclaration:
                case SyntaxKind.MethodSignature:
                case SyntaxKind.Constructor:
                case SyntaxKind.GetAccessor:
                case SyntaxKind.SetAccessor:
                case SyntaxKind.FunctionDeclaration:
                case SyntaxKind.FunctionExpression:
                case SyntaxKind.ArrowFunction:
                case SyntaxKind.CatchClause:
                    return SemanticMeaning.Value;

                case SyntaxKind.TypeParameter:
                case SyntaxKind.InterfaceDeclaration:
                case SyntaxKind.TypeAliasDeclaration:
                case SyntaxKind.TypeLiteral:
                    return SemanticMeaning.Type;

                case SyntaxKind.ClassDeclaration:
                case SyntaxKind.EnumDeclaration:
                    return SemanticMeaning.Value | SemanticMeaning.Type;

                case SyntaxKind.ModuleDeclaration:
                    if ((<ModuleDeclaration>node).name.kind === SyntaxKind.StringLiteral) {
                        return SemanticMeaning.Namespace | SemanticMeaning.Value;
                    }
                    else if (getModuleInstanceState(node) === ModuleInstanceState.Instantiated) {
                        return SemanticMeaning.Namespace | SemanticMeaning.Value;
                    }
                    else {
                        return SemanticMeaning.Namespace;
                    }

                case SyntaxKind.NamedImports:
                case SyntaxKind.ImportSpecifier:
                case SyntaxKind.ImportEqualsDeclaration:
                case SyntaxKind.ImportDeclaration:
                case SyntaxKind.ExportAssignment:
                case SyntaxKind.ExportDeclaration:
                    return SemanticMeaning.Value | SemanticMeaning.Type | SemanticMeaning.Namespace;

                // An external module can be a Value
                case SyntaxKind.SourceFile:
                    return SemanticMeaning.Namespace | SemanticMeaning.Value;
            }

            return SemanticMeaning.Value | SemanticMeaning.Type | SemanticMeaning.Namespace;

            Debug.fail("Unknown declaration type");
        }

        function isTypeReference(node: Node): boolean {
            if (isRightSideOfQualifiedNameOrPropertyAccess(node) ) {
                node = node.parent;
            }

            return node.parent.kind === SyntaxKind.TypeReference || node.parent.kind === SyntaxKind.HeritageClauseElement;
        }

        function isNamespaceReference(node: Node): boolean {
            return isQualifiedNameNamespaceReference(node) || isPropertyAccessNamespaceReference(node);
        }

        function isPropertyAccessNamespaceReference(node: Node): boolean {
            let root = node;
            let isLastClause = true;
            if (root.parent.kind === SyntaxKind.PropertyAccessExpression) {
                while (root.parent && root.parent.kind === SyntaxKind.PropertyAccessExpression) {
                    root = root.parent;
                }

                isLastClause = (<PropertyAccessExpression>root).name === node;
            }

            if (!isLastClause && root.parent.kind === SyntaxKind.HeritageClauseElement && root.parent.parent.kind === SyntaxKind.HeritageClause) {
                let decl = root.parent.parent.parent;
                return (decl.kind === SyntaxKind.ClassDeclaration && (<HeritageClause>root.parent.parent).token === SyntaxKind.ImplementsKeyword) ||
                    (decl.kind === SyntaxKind.InterfaceDeclaration && (<HeritageClause>root.parent.parent).token === SyntaxKind.ExtendsKeyword);
            }

            return false;
        }

        function isQualifiedNameNamespaceReference(node: Node): boolean {
            let root = node;
            let isLastClause = true;
            if (root.parent.kind === SyntaxKind.QualifiedName) {
                while (root.parent && root.parent.kind === SyntaxKind.QualifiedName) {
                    root = root.parent;
                }

                isLastClause = (<QualifiedName>root).right === node;
            }

            return root.parent.kind === SyntaxKind.TypeReference && !isLastClause;
        }

        function isInRightSideOfImport(node: Node) {
            while (node.parent.kind === SyntaxKind.QualifiedName) {
                node = node.parent;
            }
            return isInternalModuleImportEqualsDeclaration(node.parent) && (<ImportEqualsDeclaration>node.parent).moduleReference === node;
        }

        function getMeaningFromRightHandSideOfImportEquals(node: Node) {
            Debug.assert(node.kind === SyntaxKind.Identifier);

            //     import a = |b|; // Namespace
            //     import a = |b.c|; // Value, type, namespace
            //     import a = |b.c|.d; // Namespace

            if (node.parent.kind === SyntaxKind.QualifiedName &&
                (<QualifiedName>node.parent).right === node &&
                node.parent.parent.kind === SyntaxKind.ImportEqualsDeclaration) {
                return SemanticMeaning.Value | SemanticMeaning.Type | SemanticMeaning.Namespace;
            }
            return SemanticMeaning.Namespace;
        }

        function getMeaningFromLocation(node: Node): SemanticMeaning {
            if (node.parent.kind === SyntaxKind.ExportAssignment) {
                return SemanticMeaning.Value | SemanticMeaning.Type | SemanticMeaning.Namespace;
            }
            else if (isInRightSideOfImport(node)) {
                return getMeaningFromRightHandSideOfImportEquals(node);
            }
            else if (isDeclarationName(node)) {
                return getMeaningFromDeclaration(node.parent);
            }
            else if (isTypeReference(node)) {
                return SemanticMeaning.Type;
            }
            else if (isNamespaceReference(node)) {
                return SemanticMeaning.Namespace;
            }
            else {
                return SemanticMeaning.Value;
            }
        }

        // Signature help
        /**
         * This is a semantic operation.
         */
        function getSignatureHelpItems(fileName: string, position: number): SignatureHelpItems {
            synchronizeHostData();

            let sourceFile = getValidSourceFile(fileName);

            return SignatureHelp.getSignatureHelpItems(program, sourceFile, position, cancellationToken);
        }

        /// Syntactic features
        function getSourceFile(fileName: string): SourceFile {
            return syntaxTreeCache.getCurrentSourceFile(fileName);
        }

        function getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): TextSpan {
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            // Get node at the location
            let node = getTouchingPropertyName(sourceFile, startPos);

            if (!node) {
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
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            return BreakpointResolver.spanInSourceFileAtLocation(sourceFile, position);
        }

        function getNavigationBarItems(fileName: string): NavigationBarItem[]{
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            return NavigationBar.getNavigationBarItems(sourceFile);
        }

        function getSemanticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[] {
            synchronizeHostData();

            let sourceFile = getValidSourceFile(fileName);
            let typeChecker = program.getTypeChecker();

            let result: ClassifiedSpan[] = [];
            processNode(sourceFile);

            return result;

            function classifySymbol(symbol: Symbol, meaningAtPosition: SemanticMeaning) {
                let flags = symbol.getFlags();

                if (flags & SymbolFlags.Class) {
                    return ClassificationTypeNames.className;
                }
                else if (flags & SymbolFlags.Enum) {
                    return ClassificationTypeNames.enumName;
                }
                else if (flags & SymbolFlags.TypeAlias) {
                    return ClassificationTypeNames.typeAlias;
                }
                else if (meaningAtPosition & SemanticMeaning.Type) {
                    if (flags & SymbolFlags.Interface) {
                        return ClassificationTypeNames.interfaceName;
                    }
                    else if (flags & SymbolFlags.TypeParameter) {
                        return ClassificationTypeNames.typeParameterName;
                    }
                }
                else if (flags & SymbolFlags.Module) {
                    // Only classify a module as such if
                    //  - It appears in a namespace context.
                    //  - There exists a module declaration which actually impacts the value side.
                    if (meaningAtPosition & SemanticMeaning.Namespace ||
                        (meaningAtPosition & SemanticMeaning.Value && hasValueSideModule(symbol))) {
                        return ClassificationTypeNames.moduleName;
                    }
                }

                return undefined;

                /**
                 * Returns true if there exists a module that introduces entities on the value side.
                 */
                function hasValueSideModule(symbol: Symbol): boolean {
                    return forEach(symbol.declarations, declaration => {
                        return declaration.kind === SyntaxKind.ModuleDeclaration && getModuleInstanceState(declaration) == ModuleInstanceState.Instantiated;
                    });
                }
            }

            function processNode(node: Node) {
                // Only walk into nodes that intersect the requested span.
                if (node && textSpanIntersectsWith(span, node.getStart(), node.getWidth())) {
                    if (node.kind === SyntaxKind.Identifier && node.getWidth() > 0) {
                        let symbol = typeChecker.getSymbolAtLocation(node);
                        if (symbol) {
                            let type = classifySymbol(symbol, getMeaningFromLocation(node));
                            if (type) {
                                result.push({
                                    textSpan: createTextSpan(node.getStart(), node.getWidth()),
                                    classificationType: type
                                });
                            }
                        }
                    }

                    forEachChild(node, processNode);
                }
            }
        }

        function getSyntacticClassifications(fileName: string, span: TextSpan): ClassifiedSpan[] {
            // doesn't use compiler - no need to synchronize with host
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

            // Make a scanner we can get trivia from.
            let triviaScanner = createScanner(ScriptTarget.Latest, /*skipTrivia:*/ false, sourceFile.text);
            let mergeConflictScanner = createScanner(ScriptTarget.Latest, /*skipTrivia:*/ false, sourceFile.text);

            let result: ClassifiedSpan[] = [];
            processElement(sourceFile);

            return result;

            function classifyLeadingTrivia(token: Node): void {
                let tokenStart = skipTrivia(sourceFile.text, token.pos, /*stopAfterLineBreak:*/ false);
                if (tokenStart === token.pos) {
                    return;
                }

                // token has trivia.  Classify them appropriately.
                triviaScanner.setTextPos(token.pos);
                while (true) {
                    let start = triviaScanner.getTextPos();
                    let kind = triviaScanner.scan();
                    let end = triviaScanner.getTextPos();
                    let width = end - start;

                    if (textSpanIntersectsWith(span, start, width)) {
                        if (!isTrivia(kind)) {
                            return;
                        }

                        if (isComment(kind)) {
                            // Simple comment.  Just add as is.
                            result.push({
                                textSpan: createTextSpan(start, width),
                                classificationType: ClassificationTypeNames.comment
                            })
                            continue;
                        }

                        if (kind === SyntaxKind.ConflictMarkerTrivia) {
                            let text = sourceFile.text;
                            let ch = text.charCodeAt(start);

                            // for the <<<<<<< and >>>>>>> markers, we just add them in as comments
                            // in the classification stream.
                            if (ch === CharacterCodes.lessThan || ch === CharacterCodes.greaterThan) {
                                result.push({
                                    textSpan: createTextSpan(start, width),
                                    classificationType: ClassificationTypeNames.comment
                                });
                                continue;
                            }

                            // for the ======== add a comment for the first line, and then lex all
                            // subsequent lines up until the end of the conflict marker.
                            Debug.assert(ch === CharacterCodes.equals);
                            classifyDisabledMergeCode(text, start, end);
                        }
                    }
                }
            }

            function classifyDisabledMergeCode(text: string, start: number, end: number) {
                // Classify the line that the ======= marker is on as a comment.  Then just lex 
                // all further tokens and add them to the result.
                for (var i = start; i < end; i++) {
                    if (isLineBreak(text.charCodeAt(i))) {
                        break;
                    }
                }
                result.push({
                    textSpan: createTextSpanFromBounds(start, i),
                    classificationType: ClassificationTypeNames.comment
                });

                mergeConflictScanner.setTextPos(i);

                while (mergeConflictScanner.getTextPos() < end) {
                    classifyDisabledCodeToken();
                }
            }

            function classifyDisabledCodeToken() {
                let start = mergeConflictScanner.getTextPos();
                let tokenKind = mergeConflictScanner.scan();
                let end = mergeConflictScanner.getTextPos();

                let type = classifyTokenType(tokenKind);
                if (type) {
                    result.push({
                        textSpan: createTextSpanFromBounds(start, end),
                        classificationType: type
                    });
                }
            }

            function classifyToken(token: Node): void {
                classifyLeadingTrivia(token);

                if (token.getWidth() > 0) {
                    let type = classifyTokenType(token.kind, token);
                    if (type) {
                        result.push({
                            textSpan: createTextSpan(token.getStart(), token.getWidth()),
                            classificationType: type
                        });
                    }
                }
            }

            // for accurate classification, the actual token should be passed in.  however, for 
            // cases like 'disabled merge code' classification, we just get the token kind and
            // classify based on that instead.
            function classifyTokenType(tokenKind: SyntaxKind, token?: Node): string {
                if (isKeyword(tokenKind)) {
                    return ClassificationTypeNames.keyword;
                }

                // Special case < and >  If they appear in a generic context they are punctuation,
                // not operators.
                if (tokenKind === SyntaxKind.LessThanToken || tokenKind === SyntaxKind.GreaterThanToken) {
                    // If the node owning the token has a type argument list or type parameter list, then
                    // we can effectively assume that a '<' and '>' belong to those lists.
                    if (token && getTypeArgumentOrTypeParameterList(token.parent)) {
                        return ClassificationTypeNames.punctuation;
                    }
                }

                if (isPunctuation(tokenKind)) {
                    if (token) {
                        if (tokenKind === SyntaxKind.EqualsToken) {
                            // the '=' in a variable declaration is special cased here.
                            if (token.parent.kind === SyntaxKind.VariableDeclaration ||
                                token.parent.kind === SyntaxKind.PropertyDeclaration ||
                                token.parent.kind === SyntaxKind.Parameter) {
                                return ClassificationTypeNames.operator;
                            }
                        }

                        if (token.parent.kind === SyntaxKind.BinaryExpression ||
                            token.parent.kind === SyntaxKind.PrefixUnaryExpression ||
                            token.parent.kind === SyntaxKind.PostfixUnaryExpression ||
                            token.parent.kind === SyntaxKind.ConditionalExpression) {
                            return ClassificationTypeNames.operator;
                        }
                    }

                    return ClassificationTypeNames.punctuation;
                }
                else if (tokenKind === SyntaxKind.NumericLiteral) {
                    return ClassificationTypeNames.numericLiteral;
                }
                else if (tokenKind === SyntaxKind.StringLiteral) {
                    return ClassificationTypeNames.stringLiteral;
                }
                else if (tokenKind === SyntaxKind.RegularExpressionLiteral) {
                    // TODO: we should get another classification type for these literals.
                    return ClassificationTypeNames.stringLiteral;
                }
                else if (isTemplateLiteralKind(tokenKind)) {
                    // TODO (drosen): we should *also* get another classification type for these literals.
                    return ClassificationTypeNames.stringLiteral;
                }
                else if (tokenKind === SyntaxKind.Identifier) {
                    if (token) {
                        switch (token.parent.kind) {
                            case SyntaxKind.ClassDeclaration:
                                if ((<ClassDeclaration>token.parent).name === token) {
                                    return ClassificationTypeNames.className;
                                }
                                return;
                            case SyntaxKind.TypeParameter:
                                if ((<TypeParameterDeclaration>token.parent).name === token) {
                                    return ClassificationTypeNames.typeParameterName;
                                }
                                return;
                            case SyntaxKind.InterfaceDeclaration:
                                if ((<InterfaceDeclaration>token.parent).name === token) {
                                    return ClassificationTypeNames.interfaceName;
                                }
                                return;
                            case SyntaxKind.EnumDeclaration:
                                if ((<EnumDeclaration>token.parent).name === token) {
                                    return ClassificationTypeNames.enumName;
                                }
                                return;
                            case SyntaxKind.ModuleDeclaration:
                                if ((<ModuleDeclaration>token.parent).name === token) {
                                    return ClassificationTypeNames.moduleName;
                                }
                                return;
                        }
                    }

                    return ClassificationTypeNames.text;
                }
            }

            function processElement(element: Node) {
                // Ignore nodes that don't intersect the original span to classify.
                if (textSpanIntersectsWith(span, element.getFullStart(), element.getFullWidth())) {
                    let children = element.getChildren();
                    for (let child of children) {
                        if (isToken(child)) {
                            classifyToken(child);
                        }
                        else {
                            // Recurse into our child nodes.
                            processElement(child);
                        }
                    }
                }
            }
        }

        function getOutliningSpans(fileName: string): OutliningSpan[] {
            // doesn't use compiler - no need to synchronize with host
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            return OutliningElementsCollector.collectElements(sourceFile);
        }

        function getBraceMatchingAtPosition(fileName: string, position: number) {
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            let result: TextSpan[] = [];

            let token = getTouchingToken(sourceFile, position);

            if (token.getStart(sourceFile) === position) {
                let matchKind = getMatchingTokenKind(token);

                // Ensure that there is a corresponding token to match ours.
                if (matchKind) {
                    let parentElement = token.parent;

                    let childNodes = parentElement.getChildren(sourceFile);
                    for (let current of childNodes) {
                        if (current.kind === matchKind) {
                            let range1 = createTextSpan(token.getStart(sourceFile), token.getWidth(sourceFile));
                            let range2 = createTextSpan(current.getStart(sourceFile), current.getWidth(sourceFile));

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
                    case ts.SyntaxKind.OpenBraceToken:      return ts.SyntaxKind.CloseBraceToken
                    case ts.SyntaxKind.OpenParenToken:      return ts.SyntaxKind.CloseParenToken;
                    case ts.SyntaxKind.OpenBracketToken:    return ts.SyntaxKind.CloseBracketToken;
                    case ts.SyntaxKind.LessThanToken:       return ts.SyntaxKind.GreaterThanToken;
                    case ts.SyntaxKind.CloseBraceToken:     return ts.SyntaxKind.OpenBraceToken
                    case ts.SyntaxKind.CloseParenToken:     return ts.SyntaxKind.OpenParenToken;
                    case ts.SyntaxKind.CloseBracketToken:   return ts.SyntaxKind.OpenBracketToken;
                    case ts.SyntaxKind.GreaterThanToken:    return ts.SyntaxKind.LessThanToken;
                }

                return undefined;
            }
        }

        function getIndentationAtPosition(fileName: string, position: number, editorOptions: EditorOptions) {
            let start = new Date().getTime();
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            log("getIndentationAtPosition: getCurrentSourceFile: " + (new Date().getTime() - start));

            start = new Date().getTime();

            let result = formatting.SmartIndenter.getIndentation(position, sourceFile, editorOptions);
            log("getIndentationAtPosition: computeIndentation  : " + (new Date().getTime() - start));

            return result;
        }

        function getFormattingEditsForRange(fileName: string, start: number, end: number, options: FormatCodeOptions): TextChange[] {
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            return formatting.formatSelection(start, end, sourceFile, getRuleProvider(options), options);
        }

        function getFormattingEditsForDocument(fileName: string, options: FormatCodeOptions): TextChange[] {
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);
            return formatting.formatDocument(sourceFile, getRuleProvider(options), options);
        }

        function getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: FormatCodeOptions): TextChange[] {
            let sourceFile = syntaxTreeCache.getCurrentSourceFile(fileName);

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

        function getTodoComments(fileName: string, descriptors: TodoCommentDescriptor[]): TodoComment[] {
            // Note: while getting todo comments seems like a syntactic operation, we actually 
            // treat it as a semantic operation here.  This is because we expect our host to call
            // this on every single file.  If we treat this syntactically, then that will cause
            // us to populate and throw away the tree in our syntax tree cache for each file.  By
            // treating this as a semantic operation, we can access any tree without throwing 
            // anything away.
            synchronizeHostData();

            let sourceFile = getValidSourceFile(fileName);

            cancellationToken.throwIfCancellationRequested();

            let fileContents = sourceFile.text;
            let result: TodoComment[] = [];

            if (descriptors.length > 0) {
                let regExp = getTodoCommentsRegExp();

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
                    let firstDescriptorCaptureIndex = 3;
                    Debug.assert(matchArray.length === descriptors.length + firstDescriptorCaptureIndex);

                    let preamble = matchArray[1];
                    let matchPosition = matchArray.index + preamble.length;

                    // OK, we have found a match in the file.  This is only an acceptable match if
                    // it is contained within a comment.
                    let token = getTokenAtPosition(sourceFile, matchPosition);
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

                    let message = matchArray[2];
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
                let singleLineCommentStart = /(?:\/\/+\s*)/.source;
                let multiLineCommentStart = /(?:\/\*+\s*)/.source;
                let anyNumberOfSpacesAndAsterixesAtStartOfLine = /(?:^(?:\s|\*)*)/.source;

                // Match any of the above three TODO comment start regexps.
                // Note that the outermost group *is* a capture group.  We want to capture the preamble
                // so that we can determine the starting position of the TODO comment match.
                let preamble = "(" + anyNumberOfSpacesAndAsterixesAtStartOfLine + "|" + singleLineCommentStart + "|" + multiLineCommentStart + ")";

                // Takes the descriptors and forms a regexp that matches them as if they were literals.
                // For example, if the descriptors are "TODO(jason)" and "HACK", then this will be:
                //
                //      (?:(TODO\(jason\))|(HACK))
                //
                // Note that the outermost group is *not* a capture group, but the innermost groups
                // *are* capture groups.  By capturing the inner literals we can determine after 
                // matching which descriptor we are dealing with.
                let literals = "(?:" + map(descriptors, d => "(" + escapeRegExp(d.text) + ")").join("|") + ")";

                // After matching a descriptor literal, the following regexp matches the rest of the 
                // text up to the end of the line (or */).
                let endOfLineOrEndOfComment = /(?:$|\*\/)/.source
                let messageRemainder = /(?:.*?)/.source

                // This is the portion of the match we'll return as part of the TODO comment result. We
                // match the literal portion up to the end of the line or end of comment.
                let messagePortion = "(" + literals + messageRemainder + ")";
                let regExpString = preamble + messagePortion + endOfLineOrEndOfComment;

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

            let sourceFile = getValidSourceFile(fileName);
            let typeChecker = program.getTypeChecker();

            let node = getTouchingWord(sourceFile, position);

            // Can only rename an identifier.
            if (node && node.kind === SyntaxKind.Identifier) {
                let symbol = typeChecker.getSymbolAtLocation(node);

                // Only allow a symbol to be renamed if it actually has at least one declaration.
                if (symbol) {
                    let declarations = symbol.getDeclarations();
                    if (declarations && declarations.length > 0) {
                        // Disallow rename for elements that are defined in the standard TypeScript library.
                        let defaultLibFileName = host.getDefaultLibFileName(host.getCompilationSettings());
                        if (defaultLibFileName) {
                            for (let current of declarations) {
                                let sourceFile = current.getSourceFile();
                                if (sourceFile && getCanonicalFileName(ts.normalizePath(sourceFile.fileName)) === getCanonicalFileName(ts.normalizePath(defaultLibFileName))) {
                                    return getRenameInfoError(getLocaleSpecificMessage(Diagnostics.You_cannot_rename_elements_that_are_defined_in_the_standard_TypeScript_library.key));
                                }
                            }
                        }

                        let kind = getSymbolKind(symbol, node);
                        if (kind) {
                            return {
                                canRename: true,
                                localizedErrorMessage: undefined,
                                displayName: symbol.name,
                                fullDisplayName: typeChecker.getFullyQualifiedName(symbol),
                                kind: kind,
                                kindModifiers: getSymbolModifiers(symbol),
                                triggerSpan: createTextSpan(node.getStart(), node.getWidth())
                            };
                        }
                    }
                }
            }

            return getRenameInfoError(getLocaleSpecificMessage(Diagnostics.You_cannot_rename_this_element.key));

            function getRenameInfoError(localizedErrorMessage: string): RenameInfo {
                return {
                    canRename: false,
                    localizedErrorMessage: localizedErrorMessage,
                    displayName: undefined,
                    fullDisplayName: undefined,
                    kind: undefined,
                    kindModifiers: undefined,
                    triggerSpan: undefined
                };
            }
        }

        return {
            dispose,
            cleanupSemanticCache,
            getSyntacticDiagnostics,
            getSemanticDiagnostics,
            getCompilerOptionsDiagnostics,
            getSyntacticClassifications,
            getSemanticClassifications,
            getCompletionsAtPosition,
            getCompletionEntryDetails,
            getSignatureHelpItems,
            getQuickInfoAtPosition,
            getDefinitionAtPosition,
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
            getEmitOutput,
            getSourceFile,
            getProgram
        };
    }

    /* @internal */
    export function getNameTable(sourceFile: SourceFile): Map<string> {
        if (!sourceFile.nameTable) {
            initializeNameTable(sourceFile)
        }

        return sourceFile.nameTable;
    }

    function initializeNameTable(sourceFile: SourceFile): void {
        let nameTable: Map<string> = {};

        walk(sourceFile);
        sourceFile.nameTable = nameTable;

        function walk(node: Node) {
            switch (node.kind) {
                case SyntaxKind.Identifier:
                    nameTable[(<Identifier>node).text] = (<Identifier>node).text;
                    break;
                case SyntaxKind.StringLiteral:
                case SyntaxKind.NumericLiteral:
                    // We want to store any numbers/strings if they were a name that could be
                    // related to a declaration.  So, if we have 'import x = require("something")'
                    // then we want 'something' to be in the name table.  Similarly, if we have
                    // "a['propname']" then we want to store "propname" in the name table.
                    if (isDeclarationName(node) ||
                        node.parent.kind === SyntaxKind.ExternalModuleReference ||
                        isArgumentOfElementAccessExpression(node)) {

                        nameTable[(<LiteralExpression>node).text] = (<LiteralExpression>node).text;
                    }
                    break;
                default:
                    forEachChild(node, walk);
            }
        }
    }

    function isArgumentOfElementAccessExpression(node: Node) {
        return node &&
            node.parent &&
            node.parent.kind === SyntaxKind.ElementAccessExpression &&
            (<ElementAccessExpression>node.parent).argumentExpression === node;
    }

    /// Classifier
    export function createClassifier(): Classifier {
        let scanner = createScanner(ScriptTarget.Latest, /*skipTrivia*/ false);

        /// We do not have a full parser support to know when we should parse a regex or not
        /// If we consider every slash token to be a regex, we could be missing cases like "1/2/3", where
        /// we have a series of divide operator. this list allows us to be more accurate by ruling out 
        /// locations where a regexp cannot exist.
        let noRegexTable: boolean[] = [];
        noRegexTable[SyntaxKind.Identifier] = true;
        noRegexTable[SyntaxKind.StringLiteral] = true;
        noRegexTable[SyntaxKind.NumericLiteral] = true;
        noRegexTable[SyntaxKind.RegularExpressionLiteral] = true;
        noRegexTable[SyntaxKind.ThisKeyword] = true;
        noRegexTable[SyntaxKind.PlusPlusToken] = true;
        noRegexTable[SyntaxKind.MinusMinusToken] = true;
        noRegexTable[SyntaxKind.CloseParenToken] = true;
        noRegexTable[SyntaxKind.CloseBracketToken] = true;
        noRegexTable[SyntaxKind.CloseBraceToken] = true;
        noRegexTable[SyntaxKind.TrueKeyword] = true;
        noRegexTable[SyntaxKind.FalseKeyword] = true;

        // Just a stack of TemplateHeads and OpenCurlyBraces, used to perform rudimentary (inexact)
        // classification on template strings. Because of the context free nature of templates,
        // the only precise way to classify a template portion would be by propagating the stack across
        // lines, just as we do with the end-of-line state. However, this is a burden for implementers,
        // and the behavior is entirely subsumed by the syntactic classifier anyway, so we instead
        // flatten any nesting when the template stack is non-empty and encode it in the end-of-line state.
        // Situations in which this fails are
        //  1) When template strings are nested across different lines:
        //          `hello ${ `world
        //          ` }`
        //
        //     Where on the second line, you will get the closing of a template,
        //     a closing curly, and a new template.
        //
        //  2) When substitution expressions have curly braces and the curly brace falls on the next line:
        //          `hello ${ () => {
        //          return "world" } } `
        //
        //     Where on the second line, you will get the 'return' keyword,
        //     a string literal, and a template end consisting of '} } `'.
        let templateStack: SyntaxKind[] = [];

        /** Returns true if 'keyword2' can legally follow 'keyword1' in any language construct. */
        function canFollow(keyword1: SyntaxKind, keyword2: SyntaxKind) {
            if (isAccessibilityModifier(keyword1)) {
                if (keyword2 === SyntaxKind.GetKeyword ||
                    keyword2 === SyntaxKind.SetKeyword ||
                    keyword2 === SyntaxKind.ConstructorKeyword ||
                    keyword2 === SyntaxKind.StaticKeyword) {

                    // Allow things like "public get", "public constructor" and "public static".  
                    // These are all legal.
                    return true;
                }

                // Any other keyword following "public" is actually an identifier an not a real
                // keyword.
                return false;
            }

            // Assume any other keyword combination is legal.  This can be refined in the future
            // if there are more cases we want the classifier to be better at.
            return true;
        }
        
        // If there is a syntactic classifier ('syntacticClassifierAbsent' is false),
        // we will be more conservative in order to avoid conflicting with the syntactic classifier.
        function getClassificationsForLine(text: string, lexState: EndOfLineState, syntacticClassifierAbsent: boolean): ClassificationResult {
            let offset = 0;
            let token = SyntaxKind.Unknown;
            let lastNonTriviaToken = SyntaxKind.Unknown;

            // Empty out the template stack for reuse.
            while (templateStack.length > 0) {
                templateStack.pop();
            }

            // If we're in a string literal, then prepend: "\
            // (and a newline).  That way when we lex we'll think we're still in a string literal.
            //
            // If we're in a multiline comment, then prepend: /*
            // (and a newline).  That way when we lex we'll think we're still in a multiline comment.
            switch (lexState) {
                case EndOfLineState.InDoubleQuoteStringLiteral:
                    text = '"\\\n' + text;
                    offset = 3;
                    break;
                case EndOfLineState.InSingleQuoteStringLiteral:
                    text = "'\\\n" + text;
                    offset = 3;
                    break;
                case EndOfLineState.InMultiLineCommentTrivia:
                    text = "/*\n" + text;
                    offset = 3;
                    break;
                case EndOfLineState.InTemplateHeadOrNoSubstitutionTemplate:
                    text = "`\n" + text;
                    offset = 2;
                    break;
                case EndOfLineState.InTemplateMiddleOrTail:
                    text = "}\n" + text;
                    offset = 2;
                    // fallthrough
                case EndOfLineState.InTemplateSubstitutionPosition:
                    templateStack.push(SyntaxKind.TemplateHead);
                    break;
            }

            scanner.setText(text);

            let result: ClassificationResult = {
                finalLexState: EndOfLineState.Start,
                entries: []
            };

            // We can run into an unfortunate interaction between the lexical and syntactic classifier
            // when the user is typing something generic.  Consider the case where the user types:
            //
            //      Foo<number
            //
            // From the lexical classifier's perspective, 'number' is a keyword, and so the word will
            // be classified as such.  However, from the syntactic classifier's tree-based perspective
            // this is simply an expression with the identifier 'number' on the RHS of the less than
            // token.  So the classification will go back to being an identifier.  The moment the user
            // types again, number will become a keyword, then an identifier, etc. etc.
            //
            // To try to avoid this problem, we avoid classifying contextual keywords as keywords 
            // when the user is potentially typing something generic.  We just can't do a good enough
            // job at the lexical level, and so well leave it up to the syntactic classifier to make
            // the determination.
            //
            // In order to determine if the user is potentially typing something generic, we use a 
            // weak heuristic where we track < and > tokens.  It's a weak heuristic, but should
            // work well enough in practice.
            let angleBracketStack = 0;

            do {
                token = scanner.scan();

                if (!isTrivia(token)) {
                    if ((token === SyntaxKind.SlashToken || token === SyntaxKind.SlashEqualsToken) && !noRegexTable[lastNonTriviaToken]) {
                         if (scanner.reScanSlashToken() === SyntaxKind.RegularExpressionLiteral) {
                             token = SyntaxKind.RegularExpressionLiteral;
                         }
                    }
                    else if (lastNonTriviaToken === SyntaxKind.DotToken && isKeyword(token)) {
                        token = SyntaxKind.Identifier;
                    }
                    else if (isKeyword(lastNonTriviaToken) && isKeyword(token) && !canFollow(lastNonTriviaToken, token)) {
                        // We have two keywords in a row.  Only treat the second as a keyword if 
                        // it's a sequence that could legally occur in the language.  Otherwise
                        // treat it as an identifier.  This way, if someone writes "private var"
                        // we recognize that 'var' is actually an identifier here.
                        token = SyntaxKind.Identifier;
                    }
                    else if (lastNonTriviaToken === SyntaxKind.Identifier &&
                             token === SyntaxKind.LessThanToken) {
                        // Could be the start of something generic.  Keep track of that by bumping 
                        // up the current count of generic contexts we may be in.
                        angleBracketStack++;
                    }
                    else if (token === SyntaxKind.GreaterThanToken && angleBracketStack > 0) {
                        // If we think we're currently in something generic, then mark that that
                        // generic entity is complete.
                        angleBracketStack--;
                    }
                    else if (token === SyntaxKind.AnyKeyword ||
                             token === SyntaxKind.StringKeyword ||
                             token === SyntaxKind.NumberKeyword ||
                             token === SyntaxKind.BooleanKeyword ||
                             token === SyntaxKind.SymbolKeyword) {
                        if (angleBracketStack > 0 && !syntacticClassifierAbsent) {
                            // If it looks like we're could be in something generic, don't classify this 
                            // as a keyword.  We may just get overwritten by the syntactic classifier,
                            // causing a noisy experience for the user.
                            token = SyntaxKind.Identifier;
                        }
                    }
                    else if (token === SyntaxKind.TemplateHead) {
                        templateStack.push(token);
                    }
                    else if (token === SyntaxKind.OpenBraceToken) {
                        // If we don't have anything on the template stack,
                        // then we aren't trying to keep track of a previously scanned template head.
                        if (templateStack.length > 0) {
                            templateStack.push(token);
                        }
                    }
                    else if (token === SyntaxKind.CloseBraceToken) {
                        // If we don't have anything on the template stack,
                        // then we aren't trying to keep track of a previously scanned template head.
                        if (templateStack.length > 0) {
                            let lastTemplateStackToken = lastOrUndefined(templateStack);

                            if (lastTemplateStackToken === SyntaxKind.TemplateHead) {
                                token = scanner.reScanTemplateToken();

                                // Only pop on a TemplateTail; a TemplateMiddle indicates there is more for us.
                                if (token === SyntaxKind.TemplateTail) {
                                    templateStack.pop();
                                }
                                else {
                                    Debug.assert(token === SyntaxKind.TemplateMiddle, "Should have been a template middle. Was " + token);
                                }
                            }
                            else {
                                Debug.assert(lastTemplateStackToken === SyntaxKind.OpenBraceToken, "Should have been an open brace. Was: " + token);
                                templateStack.pop();
                            }
                        }
                    }

                    lastNonTriviaToken = token;
                }

                processToken();
            }
            while (token !== SyntaxKind.EndOfFileToken);

            return result;

            function processToken(): void {
                let start = scanner.getTokenPos();
                let end = scanner.getTextPos();

                addResult(end - start, classFromKind(token));

                if (end >= text.length) {
                    if (token === SyntaxKind.StringLiteral) {
                        // Check to see if we finished up on a multiline string literal.
                        let tokenText = scanner.getTokenText();
                        if (scanner.isUnterminated()) {
                            let lastCharIndex = tokenText.length - 1;

                            let numBackslashes = 0;
                            while (tokenText.charCodeAt(lastCharIndex - numBackslashes) === CharacterCodes.backslash) {
                                numBackslashes++;
                            }

                            // If we have an odd number of backslashes, then the multiline string is unclosed
                            if (numBackslashes & 1) {
                                let quoteChar = tokenText.charCodeAt(0);
                                result.finalLexState = quoteChar === CharacterCodes.doubleQuote
                                    ? EndOfLineState.InDoubleQuoteStringLiteral
                                    : EndOfLineState.InSingleQuoteStringLiteral;
                            }
                        }
                    }
                    else if (token === SyntaxKind.MultiLineCommentTrivia) {
                        // Check to see if the multiline comment was unclosed.
                        if (scanner.isUnterminated()) {
                            result.finalLexState = EndOfLineState.InMultiLineCommentTrivia;
                        }
                    }
                    else if (isTemplateLiteralKind(token)) {
                        if (scanner.isUnterminated()) {
                            if (token === SyntaxKind.TemplateTail) {
                                result.finalLexState = EndOfLineState.InTemplateMiddleOrTail;
                            }
                            else if (token === SyntaxKind.NoSubstitutionTemplateLiteral) {
                                result.finalLexState = EndOfLineState.InTemplateHeadOrNoSubstitutionTemplate;
                            }
                            else {
                                Debug.fail("Only 'NoSubstitutionTemplateLiteral's and 'TemplateTail's can be unterminated; got SyntaxKind #" + token);
                            }
                        }
                    }
                    else if (templateStack.length > 0 && lastOrUndefined(templateStack) === SyntaxKind.TemplateHead) {
                        result.finalLexState = EndOfLineState.InTemplateSubstitutionPosition;
                    }
                }
            }

            function addResult(length: number, classification: TokenClass): void {
                if (length > 0) {
                    // If this is the first classification we're adding to the list, then remove any 
                    // offset we have if we were continuing a construct from the previous line.
                    if (result.entries.length === 0) {
                        length -= offset;
                    }

                    result.entries.push({ length: length, classification: classification });
                }
            }
        }

        function isBinaryExpressionOperatorToken(token: SyntaxKind): boolean {
            switch (token) {
                case SyntaxKind.AsteriskToken:
                case SyntaxKind.SlashToken:
                case SyntaxKind.PercentToken:
                case SyntaxKind.PlusToken:
                case SyntaxKind.MinusToken:
                case SyntaxKind.LessThanLessThanToken:
                case SyntaxKind.GreaterThanGreaterThanToken:
                case SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                case SyntaxKind.LessThanToken:
                case SyntaxKind.GreaterThanToken:
                case SyntaxKind.LessThanEqualsToken:
                case SyntaxKind.GreaterThanEqualsToken:
                case SyntaxKind.InstanceOfKeyword:
                case SyntaxKind.InKeyword:
                case SyntaxKind.EqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.EqualsEqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsEqualsToken:
                case SyntaxKind.AmpersandToken:
                case SyntaxKind.CaretToken:
                case SyntaxKind.BarToken:
                case SyntaxKind.AmpersandAmpersandToken:
                case SyntaxKind.BarBarToken:
                case SyntaxKind.BarEqualsToken:
                case SyntaxKind.AmpersandEqualsToken:
                case SyntaxKind.CaretEqualsToken:
                case SyntaxKind.LessThanLessThanEqualsToken:
                case SyntaxKind.GreaterThanGreaterThanEqualsToken:
                case SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken:
                case SyntaxKind.PlusEqualsToken:
                case SyntaxKind.MinusEqualsToken:
                case SyntaxKind.AsteriskEqualsToken:
                case SyntaxKind.SlashEqualsToken:
                case SyntaxKind.PercentEqualsToken:
                case SyntaxKind.EqualsToken:
                case SyntaxKind.CommaToken:
                    return true;
                default:
                    return false;
            }
        }

        function isPrefixUnaryExpressionOperatorToken(token: SyntaxKind): boolean {
            switch (token) {
                case SyntaxKind.PlusToken:
                case SyntaxKind.MinusToken:
                case SyntaxKind.TildeToken:
                case SyntaxKind.ExclamationToken:
                case SyntaxKind.PlusPlusToken:
                case SyntaxKind.MinusMinusToken:
                    return true;
                default:
                    return false;
            }
        }

        function isKeyword(token: SyntaxKind): boolean {
            return token >= SyntaxKind.FirstKeyword && token <= SyntaxKind.LastKeyword;
        }

        function classFromKind(token: SyntaxKind) {
            if (isKeyword(token)) {
                return TokenClass.Keyword;
            }
            else if (isBinaryExpressionOperatorToken(token) || isPrefixUnaryExpressionOperatorToken(token)) {
                return TokenClass.Operator;
            }
            else if (token >= SyntaxKind.FirstPunctuation && token <= SyntaxKind.LastPunctuation) {
                return TokenClass.Punctuation;
            }

            switch (token) {
                case SyntaxKind.NumericLiteral:
                    return TokenClass.NumberLiteral;
                case SyntaxKind.StringLiteral:
                    return TokenClass.StringLiteral;
                case SyntaxKind.RegularExpressionLiteral:
                    return TokenClass.RegExpLiteral;
                case SyntaxKind.ConflictMarkerTrivia:
                case SyntaxKind.MultiLineCommentTrivia:
                case SyntaxKind.SingleLineCommentTrivia:
                    return TokenClass.Comment;
                case SyntaxKind.WhitespaceTrivia:
                case SyntaxKind.NewLineTrivia:
                    return TokenClass.Whitespace;
                case SyntaxKind.Identifier:
                default:
                    if (isTemplateLiteralKind(token)) {
                        return TokenClass.StringLiteral;
                    }
                    return TokenClass.Identifier;
            }
        }

        return { getClassificationsForLine };
    }

    /// getDefaultLibraryFilePath
    declare let __dirname: string;
    
    /**
      * Get the path of the default library file (lib.d.ts) as distributed with the typescript
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
        objectAllocator = {
            getNodeConstructor: kind => {
                function Node() {
                }
                let proto = kind === SyntaxKind.SourceFile ? new SourceFileObject() : new NodeObject();
                proto.kind = kind;
                proto.pos = 0;
                proto.end = 0;
                proto.flags = 0;
                proto.parent = undefined;
                Node.prototype = proto;
                return <any>Node;
            },
            getSymbolConstructor: () => SymbolObject,
            getTypeConstructor: () => TypeObject,
            getSignatureConstructor: () => SignatureObject,
        };
    }

    initializeServices();
}
