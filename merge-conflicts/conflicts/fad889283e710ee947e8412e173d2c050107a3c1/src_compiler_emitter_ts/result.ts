/// <reference path="checker.ts"/>
/// <reference path="declarationEmitter.ts"/>

module ts {
    // represents one LexicalEnvironment frame to store unique generated names
    interface ScopeFrame {
        names: Map<string>;
        previous: ScopeFrame;
    }

    export function isExternalModuleOrDeclarationFile(sourceFile: SourceFile) {
        return isExternalModule(sourceFile) || isDeclarationFile(sourceFile);
    }

    // flag enum used to request and track usages of few dedicated temp variables
    // enum values are used to set/check bit values and thus should not have bit collisions.
    const enum TempVariableKind {
        auto = 0,
        _i = 1,
        _n = 2,
    }

    // @internal
    // targetSourceFile is when users only want one file in entire project to be emitted. This is used in compileOnSave feature
    export function emitFiles(resolver: EmitResolver, host: EmitHost, targetSourceFile: SourceFile): EmitResult {
        let compilerOptions = host.getCompilerOptions();
        let languageVersion = compilerOptions.target || ScriptTarget.ES3;
        let sourceMapDataList: SourceMapData[] = compilerOptions.sourceMap ? [] : undefined;
        let diagnostics: Diagnostic[] = [];
        let newLine = host.getNewLine();

        if (targetSourceFile === undefined) {
            forEach(host.getSourceFiles(), sourceFile => {
                if (shouldEmitToOwnFile(sourceFile, compilerOptions)) {
                    let jsFilePath = getOwnEmitOutputFilePath(sourceFile, host, ".js");
                    emitFile(jsFilePath, sourceFile);
                }
            });

            if (compilerOptions.out) {
                emitFile(compilerOptions.out);
            }
        }
        else {
            // targetSourceFile is specified (e.g calling emitter from language service or calling getSemanticDiagnostic from language service)
            if (shouldEmitToOwnFile(targetSourceFile, compilerOptions)) {
                let jsFilePath = getOwnEmitOutputFilePath(targetSourceFile, host, ".js");
                emitFile(jsFilePath, targetSourceFile);
            }
            else if (!isDeclarationFile(targetSourceFile) && compilerOptions.out) {
                emitFile(compilerOptions.out);
            }
        }

        // Sort and make the unique list of diagnostics
        diagnostics = sortAndDeduplicateDiagnostics(diagnostics);

        return {
            emitSkipped: false,
            diagnostics,
            sourceMaps: sourceMapDataList
        };

        function isNodeDescendentOf(node: Node, ancestor: Node): boolean {
            while (node) {
                if (node === ancestor) return true;
                node = node.parent;
            }
            return false;
        }

        function isUniqueLocalName(name: string, container: Node): boolean {
            for (let node = container; isNodeDescendentOf(node, container); node = node.nextContainer) {
                if (node.locals && hasProperty(node.locals, name)) {
                    // We conservatively include alias symbols to cover cases where they're emitted as locals
                    if (node.locals[name].flags & (SymbolFlags.Value | SymbolFlags.ExportValue | SymbolFlags.Alias)) {
                        return false;
                    }
                }
            }
            return true;
        }

        function emitJavaScript(jsFilePath: string, root?: SourceFile) {
            let writer = createTextWriter(newLine);
            let write = writer.write;
            let writeTextOfNode = writer.writeTextOfNode;
            let writeLine = writer.writeLine;
            let increaseIndent = writer.increaseIndent;
            let decreaseIndent = writer.decreaseIndent;
            let preserveNewLines = compilerOptions.preserveNewLines || false;

            let currentSourceFile: SourceFile;

            let generatedNameSet: Map<string>;
            let nodeToGeneratedName: string[];
            let blockScopedVariableToGeneratedName: string[];
            let computedPropertyNamesToGeneratedNames: string[];

            let extendsEmitted = false;
            let decorateEmitted = false;
            let tempCount = 0;
            let tempVariables: Identifier[];
            let tempParameters: Identifier[];
<<<<<<< HEAD
            let externalImports: (ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration)[];
=======
            let predefinedTempsInUse = TempVariableKind.auto;

            let externalImports: ExternalImportInfo[];
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
            let exportSpecifiers: Map<ExportSpecifier[]>;
            let exportEquals: ExportAssignment;
            let hasExportStars: boolean;

            /** write emitted output to disk*/
            let writeEmittedFiles = writeJavaScriptFile;

            let detachedCommentsInfo: { nodePos: number; detachedCommentEndPos: number }[];

            let writeComment = writeCommentRange;

            /** Emit a node */
            let emit = emitNodeWithoutSourceMap;

            /** Called just before starting emit of a node */
            let emitStart = function (node: Node) { };

            /** Called once the emit of the node is done */
            let emitEnd = function (node: Node) { };

            /** Emit the text for the given token that comes after startPos
              * This by default writes the text provided with the given tokenKind
              * but if optional emitFn callback is provided the text is emitted using the callback instead of default text
              * @param tokenKind the kind of the token to search and emit
              * @param startPos the position in the source to start searching for the token
              * @param emitFn if given will be invoked to emit the text instead of actual token emit */
            let emitToken = emitTokenText;

            /** Called to before starting the lexical scopes as in function/class in the emitted code because of node
              * @param scopeDeclaration node that starts the lexical scope
              * @param scopeName Optional name of this scope instead of deducing one from the declaration node */
            let scopeEmitStart = function (scopeDeclaration: Node, scopeName?: string) { }

            /** Called after coming out of the scope */
            let scopeEmitEnd = function () { }

            /** Sourcemap data that will get encoded */
            let sourceMapData: SourceMapData;

            if (compilerOptions.sourceMap) {
                initializeEmitterWithSourceMaps();
            }

            if (root) {
                // Do not call emit directly. It does not set the currentSourceFile.
                emitSourceFile(root);
            }
            else {
                forEach(host.getSourceFiles(), sourceFile => {
                    if (!isExternalModuleOrDeclarationFile(sourceFile)) {
                        emitSourceFile(sourceFile);
                    }
                });
            }

            writeLine();
            writeEmittedFiles(writer.getText(), /*writeByteOrderMark*/ compilerOptions.emitBOM);
            return;

            function emitSourceFile(sourceFile: SourceFile): void {
                currentSourceFile = sourceFile;
                emit(sourceFile);
            }

            function generateNameForNode(node: Node) {
                switch (node.kind) {
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.ClassDeclaration:
                        generateNameForFunctionOrClassDeclaration(<Declaration>node);
                        break;
                    case SyntaxKind.ModuleDeclaration:
                        generateNameForModuleOrEnum(<ModuleDeclaration>node);
                        generateNameForNode((<ModuleDeclaration>node).body);
                        break;
                    case SyntaxKind.EnumDeclaration:
                        generateNameForModuleOrEnum(<EnumDeclaration>node);
                        break;
                    case SyntaxKind.ImportDeclaration:
                        generateNameForImportDeclaration(<ImportDeclaration>node);
                        break;
                    case SyntaxKind.ExportDeclaration:
                        generateNameForExportDeclaration(<ExportDeclaration>node);
                        break;
                    case SyntaxKind.ExportAssignment:
                        generateNameForExportAssignment(<ExportAssignment>node);
                        break;
                    case SyntaxKind.SourceFile:
                    case SyntaxKind.ModuleBlock:
                        forEach((<SourceFile | ModuleBlock>node).statements, generateNameForNode);
                        break;
                }
            }

            function isUniqueName(name: string): boolean {
                return !resolver.hasGlobalName(name) &&
                    !hasProperty(currentSourceFile.identifiers, name) &&
                    (!generatedNameSet || !hasProperty(generatedNameSet, name))
            }

            // in cases like
            // for (var x of []) {
            //     _i;
            // }
            // we should be able to detect if let _i was shadowed by some temp variable that was allocated in scope
            function nameConflictsWithSomeTempVariable(name: string): boolean {
                // temp variable names always start with '_'
                if (name.length < 2 || name.charCodeAt(0) !== CharacterCodes._) {
                    return false;
                }

                if (name === "_i") {
                    return !!(predefinedTempsInUse & TempVariableKind._i);
                }

                if (name === "_n") {
                    return !!(predefinedTempsInUse & TempVariableKind._n);
                }

                if (name.length === 2 && name.charCodeAt(1) >= CharacterCodes.a && name.charCodeAt(1) <= CharacterCodes.z) {
                    // handles _a .. _z
                    let n = name.charCodeAt(1) - CharacterCodes.a;
                    return n < tempCount;
                }
                else {
                    // handles _1, _2...
                    let n = +name.substring(1);
                    return !isNaN(n) && n >= 0 && n < (tempCount - 26);
                }
            }

            // This function generates a name using the following pattern:
            // _a .. _h, _j ... _z, _0, _1, ...
            // It is guaranteed that generated name will not shadow any existing user-defined names,
            // however it can hide another name generated by this function higher in the scope.
            // NOTE: names generated by 'makeTempVariableName' and 'makeUniqueName' will never conflict.
            // see comment for 'makeTempVariableName' for more information.
            function makeTempVariableName(location: Node, tempVariableKind: TempVariableKind): string {
                let tempName: string;
                if (tempVariableKind !== TempVariableKind.auto && !(predefinedTempsInUse & tempVariableKind)) {
                    tempName = tempVariableKind === TempVariableKind._i ? "_i" : "_n";
                    if (!resolver.resolvesToSomeValue(location, tempName)) {
                        predefinedTempsInUse |= tempVariableKind;
                        return tempName;
                    }
                }

                do {
                    // Note: we avoid generating _i and _n as those are common names we want in other places.
                    var char = CharacterCodes.a + tempCount;
                    if (char !== CharacterCodes.i && char !== CharacterCodes.n) {
                        if (tempCount < 26) {
                            tempName = "_" + String.fromCharCode(char);
                        }
                        else {
                            tempName = "_" + (tempCount - 26);
                        }
                    }

                    tempCount++;
                }
<<<<<<< HEAD

                return recordNameInCurrentScope(name);
            }

            function recordNameInCurrentScope(name: string): string {
                if (!currentScopeNames) {
                    currentScopeNames = {};
=======
                while (resolver.resolvesToSomeValue(location, tempName));

                return tempName;
            }

            // Generates a name that is unique within current file and does not collide with
            // any names in global scope.
            // NOTE: names generated by 'makeTempVariableName' and 'makeUniqueName' will never conflict
            // because of the way how these names are generated
            // - makeUniqueName builds a name by picking a base name (which should not be empty string)
            //   and appending suffix '_<number>'
            // - makeTempVariableName creates a name using the following pattern:
            //   _a .. _h, _j ... _z, _0, _1, ...
            // This means that names from 'makeTempVariableName' will have only one underscore at the beginning
            // and names from 'makeUniqieName' will have at least one underscore in the middle 
            // so they will never collide.
            function makeUniqueName(baseName: string): string {
                Debug.assert(!!baseName);

                // Find the first unique 'name_n', where n is a positive number
                if (baseName.charCodeAt(baseName.length - 1) !== CharacterCodes._) {
                    baseName += "_";
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
                }

                let i = 1;
                let generatedName: string;
                while (true) {
                    generatedName = baseName + i;
                    if (isUniqueName(generatedName)) {
                        break;
                    }
                    i++;
                }

                if (!generatedNameSet) {
                    generatedNameSet = {};
                }
                return generatedNameSet[generatedName] = generatedName;
            }

            function renameNode(node: Node, name: string): string {
                var nodeId = getNodeId(node);

                if (!nodeToGeneratedName) {
                    nodeToGeneratedName = [];
                }

                return nodeToGeneratedName[nodeId] = unescapeIdentifier(name);
            }

            function generateNameForFunctionOrClassDeclaration(node: Declaration) {
                if (!node.name) {
                    renameNode(node, makeUniqueName("default"));
                }
            }

            function generateNameForModuleOrEnum(node: ModuleDeclaration | EnumDeclaration) {
                if (node.name.kind === SyntaxKind.Identifier) {
                    let name = node.name.text;
                    // Use module/enum name itself if it is unique, otherwise make a unique variation
                    renameNode(node, isUniqueLocalName(name, node) ? name : makeUniqueName(name));
                }
            }

            function generateNameForImportOrExportDeclaration(node: ImportDeclaration | ExportDeclaration) {
                let expr = getExternalModuleName(node);
                let baseName = expr.kind === SyntaxKind.StringLiteral ?
                    escapeIdentifier(makeIdentifierFromModuleName((<LiteralExpression>expr).text)) : "module";
                renameNode(node, makeUniqueName(baseName));
            }

            function generateNameForImportDeclaration(node: ImportDeclaration) {
                if (node.importClause && node.importClause.namedBindings && node.importClause.namedBindings.kind === SyntaxKind.NamedImports) {
                    generateNameForImportOrExportDeclaration(node);
                }
            }

            function generateNameForExportDeclaration(node: ExportDeclaration) {
                if (node.moduleSpecifier) {
                    generateNameForImportOrExportDeclaration(node);
                }
            }

            function generateNameForExportAssignment(node: ExportAssignment) {
                if (node.expression && node.expression.kind !== SyntaxKind.Identifier) {
                    renameNode(node, makeUniqueName("default"));
                }
            }

            function getGeneratedNameForNode(node: Node) {
                let nodeId = getNodeId(node);
                if (!nodeToGeneratedName || !nodeToGeneratedName[nodeId]) {
                    generateNameForNode(node);
                }
                return nodeToGeneratedName ? nodeToGeneratedName[nodeId] : undefined;
            }

            function initializeEmitterWithSourceMaps() {
                let sourceMapDir: string; // The directory in which sourcemap will be

                // Current source map file and its index in the sources list
                let sourceMapSourceIndex = -1;

                // Names and its index map
                let sourceMapNameIndexMap: Map<number> = {};
                let sourceMapNameIndices: number[] = [];
                function getSourceMapNameIndex() {
                    return sourceMapNameIndices.length ? sourceMapNameIndices[sourceMapNameIndices.length - 1] : -1;
                }

                // Last recorded and encoded spans
                let lastRecordedSourceMapSpan: SourceMapSpan;
                let lastEncodedSourceMapSpan: SourceMapSpan = {
                    emittedLine: 1,
                    emittedColumn: 1,
                    sourceLine: 1,
                    sourceColumn: 1,
                    sourceIndex: 0
                };
                let lastEncodedNameIndex = 0;

                // Encoding for sourcemap span
                function encodeLastRecordedSourceMapSpan() {
                    if (!lastRecordedSourceMapSpan || lastRecordedSourceMapSpan === lastEncodedSourceMapSpan) {
                        return;
                    }

                    let prevEncodedEmittedColumn = lastEncodedSourceMapSpan.emittedColumn;
                    // Line/Comma delimiters
                    if (lastEncodedSourceMapSpan.emittedLine == lastRecordedSourceMapSpan.emittedLine) {
                        // Emit comma to separate the entry
                        if (sourceMapData.sourceMapMappings) {
                            sourceMapData.sourceMapMappings += ",";
                        }
                    }
                    else {
                        // Emit line delimiters
                        for (let encodedLine = lastEncodedSourceMapSpan.emittedLine; encodedLine < lastRecordedSourceMapSpan.emittedLine; encodedLine++) {
                            sourceMapData.sourceMapMappings += ";";
                        }
                        prevEncodedEmittedColumn = 1;
                    }

                    // 1. Relative Column 0 based
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.emittedColumn - prevEncodedEmittedColumn);

                    // 2. Relative sourceIndex
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.sourceIndex - lastEncodedSourceMapSpan.sourceIndex);

                    // 3. Relative sourceLine 0 based
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.sourceLine - lastEncodedSourceMapSpan.sourceLine);

                    // 4. Relative sourceColumn 0 based
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.sourceColumn - lastEncodedSourceMapSpan.sourceColumn);

                    // 5. Relative namePosition 0 based
                    if (lastRecordedSourceMapSpan.nameIndex >= 0) {
                        sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.nameIndex - lastEncodedNameIndex);
                        lastEncodedNameIndex = lastRecordedSourceMapSpan.nameIndex;
                    }

                    lastEncodedSourceMapSpan = lastRecordedSourceMapSpan;
                    sourceMapData.sourceMapDecodedMappings.push(lastEncodedSourceMapSpan);

                    function base64VLQFormatEncode(inValue: number) {
                        function base64FormatEncode(inValue: number) {
                            if (inValue < 64) {
                                return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.charAt(inValue);
                            }
                            throw TypeError(inValue + ": not a 64 based value");
                        }

                        // Add a new least significant bit that has the sign of the value.
                        // if negative number the least significant bit that gets added to the number has value 1
                        // else least significant bit value that gets added is 0
                        // eg. -1 changes to binary : 01 [1] => 3
                        //     +1 changes to binary : 01 [0] => 2
                        if (inValue < 0) {
                            inValue = ((-inValue) << 1) + 1;
                        }
                        else {
                            inValue = inValue << 1;
                        }

                        // Encode 5 bits at a time starting from least significant bits
                        let encodedStr = "";
                        do {
                            let currentDigit = inValue & 31; // 11111
                            inValue = inValue >> 5;
                            if (inValue > 0) {
                                // There are still more digits to decode, set the msb (6th bit)
                                currentDigit = currentDigit | 32;
                            }
                            encodedStr = encodedStr + base64FormatEncode(currentDigit);
                        } while (inValue > 0);

                        return encodedStr;
                    }
                }

                function recordSourceMapSpan(pos: number) {
                    let sourceLinePos = getLineAndCharacterOfPosition(currentSourceFile, pos);

                    // Convert the location to be one-based.
                    sourceLinePos.line++;
                    sourceLinePos.character++;

                    let emittedLine = writer.getLine();
                    let emittedColumn = writer.getColumn();

                    // If this location wasn't recorded or the location in source is going backwards, record the span
                    if (!lastRecordedSourceMapSpan ||
                        lastRecordedSourceMapSpan.emittedLine != emittedLine ||
                        lastRecordedSourceMapSpan.emittedColumn != emittedColumn ||
                        (lastRecordedSourceMapSpan.sourceIndex === sourceMapSourceIndex &&
                            (lastRecordedSourceMapSpan.sourceLine > sourceLinePos.line ||
                                (lastRecordedSourceMapSpan.sourceLine === sourceLinePos.line && lastRecordedSourceMapSpan.sourceColumn > sourceLinePos.character)))) {
                        // Encode the last recordedSpan before assigning new
                        encodeLastRecordedSourceMapSpan();

                        // New span
                        lastRecordedSourceMapSpan = {
                            emittedLine: emittedLine,
                            emittedColumn: emittedColumn,
                            sourceLine: sourceLinePos.line,
                            sourceColumn: sourceLinePos.character,
                            nameIndex: getSourceMapNameIndex(),
                            sourceIndex: sourceMapSourceIndex
                        };
                    }
                    else {
                        // Take the new pos instead since there is no change in emittedLine and column since last location
                        lastRecordedSourceMapSpan.sourceLine = sourceLinePos.line;
                        lastRecordedSourceMapSpan.sourceColumn = sourceLinePos.character;
                        lastRecordedSourceMapSpan.sourceIndex = sourceMapSourceIndex;
                    }
                }

                function recordEmitNodeStartSpan(node: Node) {
                    // Get the token pos after skipping to the token (ignoring the leading trivia)
                    recordSourceMapSpan(skipTrivia(currentSourceFile.text, node.pos));
                }

                function recordEmitNodeEndSpan(node: Node) {
                    recordSourceMapSpan(node.end);
                }

                function writeTextWithSpanRecord(tokenKind: SyntaxKind, startPos: number, emitFn?: () => void) {
                    let tokenStartPos = ts.skipTrivia(currentSourceFile.text, startPos);
                    recordSourceMapSpan(tokenStartPos);
                    let tokenEndPos = emitTokenText(tokenKind, tokenStartPos, emitFn);
                    recordSourceMapSpan(tokenEndPos);
                    return tokenEndPos;
                }

                function recordNewSourceFileStart(node: SourceFile) {
                    // Add the file to tsFilePaths
                    // If sourceroot option: Use the relative path corresponding to the common directory path
                    // otherwise source locations relative to map file location
                    let sourcesDirectoryPath = compilerOptions.sourceRoot ? host.getCommonSourceDirectory() : sourceMapDir;

                    sourceMapData.sourceMapSources.push(getRelativePathToDirectoryOrUrl(sourcesDirectoryPath,
                        node.fileName,
                        host.getCurrentDirectory(),
                        host.getCanonicalFileName,
                        /*isAbsolutePathAnUrl*/ true));
                    sourceMapSourceIndex = sourceMapData.sourceMapSources.length - 1;

                    // The one that can be used from program to get the actual source file
                    sourceMapData.inputSourceFileNames.push(node.fileName);
                }

                function recordScopeNameOfNode(node: Node, scopeName?: string) {
                    function recordScopeNameIndex(scopeNameIndex: number) {
                        sourceMapNameIndices.push(scopeNameIndex);
                    }

                    function recordScopeNameStart(scopeName: string) {
                        let scopeNameIndex = -1;
                        if (scopeName) {
                            let parentIndex = getSourceMapNameIndex();
                            if (parentIndex !== -1) {
                                // Child scopes are always shown with a dot (even if they have no name),
                                // unless it is a computed property. Then it is shown with brackets,
                                // but the brackets are included in the name.
                                let name = (<Declaration>node).name;
                                if (!name || name.kind !== SyntaxKind.ComputedPropertyName) {
                                    scopeName = "." + scopeName;
                                }
                                scopeName = sourceMapData.sourceMapNames[parentIndex] + scopeName;
                            }

                            scopeNameIndex = getProperty(sourceMapNameIndexMap, scopeName);
                            if (scopeNameIndex === undefined) {
                                scopeNameIndex = sourceMapData.sourceMapNames.length;
                                sourceMapData.sourceMapNames.push(scopeName);
                                sourceMapNameIndexMap[scopeName] = scopeNameIndex;
                            }
                        }
                        recordScopeNameIndex(scopeNameIndex);
                    }

                    if (scopeName) {
                        // The scope was already given a name  use it
                        recordScopeNameStart(scopeName);
                    }
                    else if (node.kind === SyntaxKind.FunctionDeclaration ||
                        node.kind === SyntaxKind.FunctionExpression ||
                        node.kind === SyntaxKind.MethodDeclaration ||
                        node.kind === SyntaxKind.MethodSignature ||
                        node.kind === SyntaxKind.GetAccessor ||
                        node.kind === SyntaxKind.SetAccessor ||
                        node.kind === SyntaxKind.ModuleDeclaration ||
                        node.kind === SyntaxKind.ClassDeclaration ||
                        node.kind === SyntaxKind.EnumDeclaration) {
                        // Declaration and has associated name use it
                        if ((<Declaration>node).name) {
                            let name = (<Declaration>node).name;
                            // For computed property names, the text will include the brackets
                            scopeName = name.kind === SyntaxKind.ComputedPropertyName
                                ? getTextOfNode(name)
                                : (<Identifier>(<Declaration>node).name).text;
                        }
                        recordScopeNameStart(scopeName);
                    }
                    else {
                        // Block just use the name from upper level scope
                        recordScopeNameIndex(getSourceMapNameIndex());
                    }
                }

                function recordScopeNameEnd() {
                    sourceMapNameIndices.pop();
                };

                function writeCommentRangeWithMap(curentSourceFile: SourceFile, writer: EmitTextWriter, comment: CommentRange, newLine: string) {
                    recordSourceMapSpan(comment.pos);
                    writeCommentRange(currentSourceFile, writer, comment, newLine);
                    recordSourceMapSpan(comment.end);
                }

                function serializeSourceMapContents(version: number, file: string, sourceRoot: string, sources: string[], names: string[], mappings: string) {
                    if (typeof JSON !== "undefined") {
                        return JSON.stringify({
                            version: version,
                            file: file,
                            sourceRoot: sourceRoot,
                            sources: sources,
                            names: names,
                            mappings: mappings
                        });
                    }

                    return "{\"version\":" + version + ",\"file\":\"" + escapeString(file) + "\",\"sourceRoot\":\"" + escapeString(sourceRoot) + "\",\"sources\":[" + serializeStringArray(sources) + "],\"names\":[" + serializeStringArray(names) + "],\"mappings\":\"" + escapeString(mappings) + "\"}";

                    function serializeStringArray(list: string[]): string {
                        let output = "";
                        for (let i = 0, n = list.length; i < n; i++) {
                            if (i) {
                                output += ",";
                            }
                            output += "\"" + escapeString(list[i]) + "\"";
                        }
                        return output;
                    }
                }

                function writeJavaScriptAndSourceMapFile(emitOutput: string, writeByteOrderMark: boolean) {
                    // Write source map file
                    encodeLastRecordedSourceMapSpan();
                    writeFile(host, diagnostics, sourceMapData.sourceMapFilePath, serializeSourceMapContents(
                        3,
                        sourceMapData.sourceMapFile,
                        sourceMapData.sourceMapSourceRoot,
                        sourceMapData.sourceMapSources,
                        sourceMapData.sourceMapNames,
                        sourceMapData.sourceMapMappings), /*writeByteOrderMark*/ false);
                    sourceMapDataList.push(sourceMapData);

                    // Write sourcemap url to the js file and write the js file
                    writeJavaScriptFile(emitOutput + "//# sourceMappingURL=" + sourceMapData.jsSourceMappingURL, writeByteOrderMark);
                }

                // Initialize source map data
                let sourceMapJsFile = getBaseFileName(normalizeSlashes(jsFilePath));
                sourceMapData = {
                    sourceMapFilePath: jsFilePath + ".map",
                    jsSourceMappingURL: sourceMapJsFile + ".map",
                    sourceMapFile: sourceMapJsFile,
                    sourceMapSourceRoot: compilerOptions.sourceRoot || "",
                    sourceMapSources: [],
                    inputSourceFileNames: [],
                    sourceMapNames: [],
                    sourceMapMappings: "",
                    sourceMapDecodedMappings: []
                };

                // Normalize source root and make sure it has trailing "/" so that it can be used to combine paths with the
                // relative paths of the sources list in the sourcemap
                sourceMapData.sourceMapSourceRoot = ts.normalizeSlashes(sourceMapData.sourceMapSourceRoot);
                if (sourceMapData.sourceMapSourceRoot.length && sourceMapData.sourceMapSourceRoot.charCodeAt(sourceMapData.sourceMapSourceRoot.length - 1) !== CharacterCodes.slash) {
                    sourceMapData.sourceMapSourceRoot += directorySeparator;
                }

                if (compilerOptions.mapRoot) {
                    sourceMapDir = normalizeSlashes(compilerOptions.mapRoot);
                    if (root) { // emitting single module file
                        // For modules or multiple emit files the mapRoot will have directory structure like the sources
                        // So if src\a.ts and src\lib\b.ts are compiled together user would be moving the maps into mapRoot\a.js.map and mapRoot\lib\b.js.map
                        sourceMapDir = getDirectoryPath(getSourceFilePathInNewDir(root, host, sourceMapDir));
                    }

                    if (!isRootedDiskPath(sourceMapDir) && !isUrl(sourceMapDir)) {
                        // The relative paths are relative to the common directory
                        sourceMapDir = combinePaths(host.getCommonSourceDirectory(), sourceMapDir);
                        sourceMapData.jsSourceMappingURL = getRelativePathToDirectoryOrUrl(
                            getDirectoryPath(normalizePath(jsFilePath)), // get the relative sourceMapDir path based on jsFilePath
                            combinePaths(sourceMapDir, sourceMapData.jsSourceMappingURL), // this is where user expects to see sourceMap
                            host.getCurrentDirectory(),
                            host.getCanonicalFileName,
                            /*isAbsolutePathAnUrl*/ true);
                    }
                    else {
                        sourceMapData.jsSourceMappingURL = combinePaths(sourceMapDir, sourceMapData.jsSourceMappingURL);
                    }
                }
                else {
                    sourceMapDir = getDirectoryPath(normalizePath(jsFilePath));
                }

                function emitNodeWithSourceMap(node: Node, allowGeneratedIdentifiers?: boolean) {
                    if (node) {
                        if (nodeIsSynthesized(node)) {
                            return emitNodeWithoutSourceMap(node, /*allowGeneratedIdentifiers*/ false);
                        }
                        if (node.kind != SyntaxKind.SourceFile) {
                            recordEmitNodeStartSpan(node);
                            emitNodeWithoutSourceMap(node, allowGeneratedIdentifiers);
                            recordEmitNodeEndSpan(node);
                        }
                        else {
                            recordNewSourceFileStart(<SourceFile>node);
                            emitNodeWithoutSourceMap(node, /*allowGeneratedIdentifiers*/ false);
                        }
                    }
                }

                writeEmittedFiles = writeJavaScriptAndSourceMapFile;
                emit = emitNodeWithSourceMap;
                emitStart = recordEmitNodeStartSpan;
                emitEnd = recordEmitNodeEndSpan;
                emitToken = writeTextWithSpanRecord;
                scopeEmitStart = recordScopeNameOfNode;
                scopeEmitEnd = recordScopeNameEnd;
                writeComment = writeCommentRangeWithMap;
            }

            function writeJavaScriptFile(emitOutput: string, writeByteOrderMark: boolean) {
                writeFile(host, diagnostics, jsFilePath, emitOutput, writeByteOrderMark);
            }

<<<<<<< HEAD
            // Create a temporary variable with a unique unused name. The forLoopVariable parameter signals that the
            // name should be one that is appropriate for a for loop variable.
            function createTempVariable(location: Node, preferredName?: string): Identifier {
                for (var name = preferredName; !name || isExistingName(location, name); tempCount++) {
                    // _a .. _h, _j ... _z, _0, _1, ...

                    // Note: we avoid generating _i and _n as those are common names we want in other places.
                    var char = CharacterCodes.a + tempCount;
                    if (char === CharacterCodes.i || char === CharacterCodes.n) {
                        continue;
                    }

                    if (tempCount < 26) {
                        name = "_" + String.fromCharCode(char);
                    }
                    else {
                        name = "_" + (tempCount - 26);
                    }
                }
                
                // This is necessary so that a name generated via renameNonTopLevelLetAndConst will see the name
                // we just generated.
                recordNameInCurrentScope(name);

=======
            // Create a temporary variable with a unique unused name.
            function createTempVariable(location: Node, tempVariableKind = TempVariableKind.auto): Identifier {
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
                let result = <Identifier>createSynthesizedNode(SyntaxKind.Identifier);
                result.text = makeTempVariableName(location, tempVariableKind);
                return result;
            }

            function recordTempDeclaration(name: Identifier): void {
                if (!tempVariables) {
                    tempVariables = [];
                }
                tempVariables.push(name);
            }

            function createAndRecordTempVariable(location: Node, tempVariableKind?: TempVariableKind): Identifier {
                let temp = createTempVariable(location, tempVariableKind);
                recordTempDeclaration(temp);

                return temp;
            }

            function emitTempDeclarations(newLine: boolean) {
                if (tempVariables) {
                    if (newLine) {
                        writeLine();
                    }
                    else {
                        write(" ");
                    }
                    write("var ");
                    emitCommaList(tempVariables);
                    write(";");
                }
            }

            function emitTokenText(tokenKind: SyntaxKind, startPos: number, emitFn?: () => void) {
                let tokenString = tokenToString(tokenKind);
                if (emitFn) {
                    emitFn();
                }
                else {
                    write(tokenString);
                }
                return startPos + tokenString.length;
            }

            function emitOptional(prefix: string, node: Node) {
                if (node) {
                    write(prefix);
                    emit(node);
                }
            }

            function emitParenthesizedIf(node: Node, parenthesized: boolean) {
                if (parenthesized) {
                    write("(");
                }
                emit(node);
                if (parenthesized) {
                    write(")");
                }
            }

            function emitTrailingCommaIfPresent(nodeList: NodeArray<Node>): void {
                if (nodeList.hasTrailingComma) {
                    write(",");
                }
            }

            function emitLinePreservingList(parent: Node, nodes: NodeArray<Node>, allowTrailingComma: boolean, spacesBetweenBraces: boolean) {
                Debug.assert(nodes.length > 0);

                increaseIndent();

                if (preserveNewLines && nodeStartPositionsAreOnSameLine(parent, nodes[0])) {
                    if (spacesBetweenBraces) {
                        write(" ");
                    }
                }
                else {
                    writeLine();
                }

                for (let i = 0, n = nodes.length; i < n; i++) {
                    if (i) {
                        if (preserveNewLines && nodeEndIsOnSameLineAsNodeStart(nodes[i - 1], nodes[i])) {
                            write(", ");
                        }
                        else {
                            write(",");
                            writeLine();
                        }
                    }

                    emit(nodes[i]);
                }

                if (nodes.hasTrailingComma && allowTrailingComma) {
                    write(",");
                }

                decreaseIndent();

                if (preserveNewLines && nodeEndPositionsAreOnSameLine(parent, lastOrUndefined(nodes))) {
                    if (spacesBetweenBraces) {
                        write(" ");
                    }
                }
                else {
                    writeLine();
                }
            }

            function emitList(nodes: Node[], start: number, count: number, multiLine: boolean, trailingComma: boolean) {
                for (let i = 0; i < count; i++) {
                    if (multiLine) {
                        if (i) {
                            write(",");
                        }
                        writeLine();
                    }
                    else {
                        if (i) {
                            write(", ");
                        }
                    }
                    emit(nodes[start + i]);
                }
                if (trailingComma) {
                    write(",");
                }
                if (multiLine) {
                    writeLine();
                }
            }

            function emitCommaList(nodes: Node[]) {
                if (nodes) {
                    emitList(nodes, 0, nodes.length, /*multiline*/ false, /*trailingComma*/ false);
                }
            }

            function emitLines(nodes: Node[]) {
                emitLinesStartingAt(nodes, /*startIndex*/ 0);
            }

            function emitLinesStartingAt(nodes: Node[], startIndex: number): void {
                for (let i = startIndex; i < nodes.length; i++) {
                    writeLine();
                    emit(nodes[i]);
                }
            }

            function isBinaryOrOctalIntegerLiteral(node: LiteralExpression, text: string): boolean {
                if (node.kind === SyntaxKind.NumericLiteral && text.length > 1) {
                    switch (text.charCodeAt(1)) {
                        case CharacterCodes.b:
                        case CharacterCodes.B:
                        case CharacterCodes.o:
                        case CharacterCodes.O:
                            return true;
                    }
                }

                return false;
            }

            function emitLiteral(node: LiteralExpression) {
                let text = getLiteralText(node);

                if (compilerOptions.sourceMap && (node.kind === SyntaxKind.StringLiteral || isTemplateLiteralKind(node.kind))) {
                    writer.writeLiteral(text);
                }
                // For versions below ES6, emit binary & octal literals in their canonical decimal form.
                else if (languageVersion < ScriptTarget.ES6 && isBinaryOrOctalIntegerLiteral(node, text)) {
                    write(node.text);
                }
                else {
                    write(text);
                }
            }

            function getLiteralText(node: LiteralExpression) {
                // Any template literal or string literal with an extended escape
                // (e.g. "\u{0067}") will need to be downleveled as a escaped string literal.
                if (languageVersion < ScriptTarget.ES6 && (isTemplateLiteralKind(node.kind) || node.hasExtendedUnicodeEscape)) {
                    return getQuotedEscapedLiteralText('"', node.text, '"');
                }
                
                // If we don't need to downlevel and we can reach the original source text using
                // the node's parent reference, then simply get the text as it was originally written.
                if (node.parent) {
                    return getSourceTextOfNodeFromSourceFile(currentSourceFile, node);
                }
                
                // If we can't reach the original source text, use the canonical form if it's a number,
                // or an escaped quoted form of the original text if it's string-like.
                switch (node.kind) {
                    case SyntaxKind.StringLiteral:
                        return getQuotedEscapedLiteralText('"', node.text, '"');
                    case SyntaxKind.NoSubstitutionTemplateLiteral:
                        return getQuotedEscapedLiteralText('`', node.text, '`');
                    case SyntaxKind.TemplateHead:
                        return getQuotedEscapedLiteralText('`', node.text, '${');
                    case SyntaxKind.TemplateMiddle:
                        return getQuotedEscapedLiteralText('}', node.text, '${');
                    case SyntaxKind.TemplateTail:
                        return getQuotedEscapedLiteralText('}', node.text, '`');
                    case SyntaxKind.NumericLiteral:
                        return node.text;
                }

                Debug.fail(`Literal kind '${node.kind}' not accounted for.`);
            }

            function getQuotedEscapedLiteralText(leftQuote: string, text: string, rightQuote: string) {
                return leftQuote + escapeNonAsciiCharacters(escapeString(text)) + rightQuote;
            }

            function emitDownlevelRawTemplateLiteral(node: LiteralExpression) {
                // Find original source text, since we need to emit the raw strings of the tagged template.
                // The raw strings contain the (escaped) strings of what the user wrote.
                // Examples: `\n` is converted to "\\n", a template string with a newline to "\n".
                let text = getSourceTextOfNodeFromSourceFile(currentSourceFile, node);
                
                // text contains the original source, it will also contain quotes ("`"), dolar signs and braces ("${" and "}"),
                // thus we need to remove those characters.
                // First template piece starts with "`", others with "}"
                // Last template piece ends with "`", others with "${"
                let isLast = node.kind === SyntaxKind.NoSubstitutionTemplateLiteral || node.kind === SyntaxKind.TemplateTail;
                text = text.substring(1, text.length - (isLast ? 1 : 2));
                
                // Newline normalization:
                // ES6 Spec 11.8.6.1 - Static Semantics of TV's and TRV's
                // <CR><LF> and <CR> LineTerminatorSequences are normalized to <LF> for both TV and TRV.
                text = text.replace(/\r\n?/g, "\n");
                text = escapeString(text);

                write('"' + text + '"');
            }

            function emitDownlevelTaggedTemplateArray(node: TaggedTemplateExpression, literalEmitter: (literal: LiteralExpression) => void) {
                write("[");
                if (node.template.kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
                    literalEmitter(<LiteralExpression>node.template);
                }
                else {
                    literalEmitter((<TemplateExpression>node.template).head);
                    forEach((<TemplateExpression>node.template).templateSpans, (child) => {
                        write(", ");
                        literalEmitter(child.literal);
                    });
                }
                write("]");
            }

            function emitDownlevelTaggedTemplate(node: TaggedTemplateExpression) {
                let tempVariable = createAndRecordTempVariable(node);
                write("(");
                emit(tempVariable);
                write(" = ");
                emitDownlevelTaggedTemplateArray(node, emit);
                write(", ");

                emit(tempVariable);
                write(".raw = ");
                emitDownlevelTaggedTemplateArray(node, emitDownlevelRawTemplateLiteral);
                write(", ");

                emitParenthesizedIf(node.tag, needsParenthesisForPropertyAccessOrInvocation(node.tag));
                write("(");
                emit(tempVariable);
                
                // Now we emit the expressions
                if (node.template.kind === SyntaxKind.TemplateExpression) {
                    forEach((<TemplateExpression>node.template).templateSpans, templateSpan => {
                        write(", ");
                        let needsParens = templateSpan.expression.kind === SyntaxKind.BinaryExpression
                            && (<BinaryExpression>templateSpan.expression).operatorToken.kind === SyntaxKind.CommaToken;
                        emitParenthesizedIf(templateSpan.expression, needsParens);
                    });
                }
                write("))");
            }

            function emitTemplateExpression(node: TemplateExpression): void {
                // In ES6 mode and above, we can simply emit each portion of a template in order, but in
                // ES3 & ES5 we must convert the template expression into a series of string concatenations.
                if (languageVersion >= ScriptTarget.ES6) {
                    forEachChild(node, emit);
                    return;
                }

                let emitOuterParens = isExpression(node.parent)
                    && templateNeedsParens(node, <Expression>node.parent);

                if (emitOuterParens) {
                    write("(");
                }

                let headEmitted = false;
                if (shouldEmitTemplateHead()) {
                    emitLiteral(node.head);
                    headEmitted = true;
                }

                for (let i = 0, n = node.templateSpans.length; i < n; i++) {
                    let templateSpan = node.templateSpans[i];

                    // Check if the expression has operands and binds its operands less closely than binary '+'.
                    // If it does, we need to wrap the expression in parentheses. Otherwise, something like
                    //    `abc${ 1 << 2 }`
                    // becomes
                    //    "abc" + 1 << 2 + ""
                    // which is really
                    //    ("abc" + 1) << (2 + "")
                    // rather than
                    //    "abc" + (1 << 2) + ""
                    let needsParens = templateSpan.expression.kind !== SyntaxKind.ParenthesizedExpression
                        && comparePrecedenceToBinaryPlus(templateSpan.expression) !== Comparison.GreaterThan;

                    if (i > 0 || headEmitted) {
                        // If this is the first span and the head was not emitted, then this templateSpan's
                        // expression will be the first to be emitted. Don't emit the preceding ' + ' in that
                        // case.
                        write(" + ");
                    }

                    emitParenthesizedIf(templateSpan.expression, needsParens);

                    // Only emit if the literal is non-empty.
                    // The binary '+' operator is left-associative, so the first string concatenation
                    // with the head will force the result up to this point to be a string.
                    // Emitting a '+ ""' has no semantic effect for middles and tails.
                    if (templateSpan.literal.text.length !== 0) {
                        write(" + ")
                        emitLiteral(templateSpan.literal);
                    }
                }

                if (emitOuterParens) {
                    write(")");
                }

                function shouldEmitTemplateHead() {
                    // If this expression has an empty head literal and the first template span has a non-empty
                    // literal, then emitting the empty head literal is not necessary.
                    //     `${ foo } and ${ bar }`
                    // can be emitted as
                    //     foo + " and " + bar
                    // This is because it is only required that one of the first two operands in the emit
                    // output must be a string literal, so that the other operand and all following operands
                    // are forced into strings.
                    //
                    // If the first template span has an empty literal, then the head must still be emitted.
                    //     `${ foo }${ bar }`
                    // must still be emitted as
                    //     "" + foo + bar

                    // There is always atleast one templateSpan in this code path, since
                    // NoSubstitutionTemplateLiterals are directly emitted via emitLiteral()
                    Debug.assert(node.templateSpans.length !== 0);

                    return node.head.text.length !== 0 || node.templateSpans[0].literal.text.length === 0;
                }

                function templateNeedsParens(template: TemplateExpression, parent: Expression) {
                    switch (parent.kind) {
                        case SyntaxKind.CallExpression:
                        case SyntaxKind.NewExpression:
                            return (<CallExpression>parent).expression === template;
                        case SyntaxKind.TaggedTemplateExpression:
                        case SyntaxKind.ParenthesizedExpression:
                            return false;
                        default:
                            return comparePrecedenceToBinaryPlus(parent) !== Comparison.LessThan;
                    }
                }

                /**
                 * Returns whether the expression has lesser, greater,
                 * or equal precedence to the binary '+' operator
                 */
                function comparePrecedenceToBinaryPlus(expression: Expression): Comparison {
                    // All binary expressions have lower precedence than '+' apart from '*', '/', and '%'
                    // which have greater precedence and '-' which has equal precedence.
                    // All unary operators have a higher precedence apart from yield.
                    // Arrow functions and conditionals have a lower precedence,
                    // although we convert the former into regular function expressions in ES5 mode,
                    // and in ES6 mode this function won't get called anyway.
                    //
                    // TODO (drosen): Note that we need to account for the upcoming 'yield' and
                    //                spread ('...') unary operators that are anticipated for ES6.
                    switch (expression.kind) {
                        case SyntaxKind.BinaryExpression:
                            switch ((<BinaryExpression>expression).operatorToken.kind) {
                                case SyntaxKind.AsteriskToken:
                                case SyntaxKind.SlashToken:
                                case SyntaxKind.PercentToken:
                                    return Comparison.GreaterThan;
                                case SyntaxKind.PlusToken:
                                case SyntaxKind.MinusToken:
                                    return Comparison.EqualTo;
                                default:
                                    return Comparison.LessThan;
                            }
                        case SyntaxKind.ConditionalExpression:
                            return Comparison.LessThan;
                        default:
                            return Comparison.GreaterThan;
                    }
                }
            }

            function emitTemplateSpan(span: TemplateSpan) {
                emit(span.expression);
                emit(span.literal);
            }

            // This function specifically handles numeric/string literals for enum and accessor 'identifiers'.
            // In a sense, it does not actually emit identifiers as much as it declares a name for a specific property.
            // For example, this is utilized when feeding in a result to Object.defineProperty.
            function emitExpressionForPropertyName(node: DeclarationName) {
                Debug.assert(node.kind !== SyntaxKind.BindingElement);

                if (node.kind === SyntaxKind.StringLiteral) {
                    emitLiteral(<LiteralExpression>node);
                }
                else if (node.kind === SyntaxKind.ComputedPropertyName) {
                    // if this is a decorated computed property, we will need to capture the result
                    // of the property expression so that we can apply decorators later. This is to ensure 
                    // we don't introduce unintended side effects:
                    //
                    //   class C {
                    //     [_a = x]() { }
                    //   }
                    //
                    // The emit for the decorated computed property decorator is:
                    //
                    //   Object.defineProperty(C.prototype, _a, __decorate([dec], C.prototype, _a, Object.getOwnPropertyDescriptor(C.prototype, _a)));
                    //
                    if (nodeIsDecorated(node.parent)) {
                        if (!computedPropertyNamesToGeneratedNames) {
                            computedPropertyNamesToGeneratedNames = [];
                        }

                        let generatedName = computedPropertyNamesToGeneratedNames[node.id];
                        if (generatedName) {
                            // we have already generated a variable for this node, write that value instead.
                            write(generatedName);
                            return;
                        }

                        let generatedVariable = createTempVariable(node);
                        generatedName = generatedVariable.text;
                        recordTempDeclaration(generatedVariable);
                        computedPropertyNamesToGeneratedNames[node.id] = generatedName;
                        write(generatedName);
                        write(" = ");
                    }

                    emit((<ComputedPropertyName>node).expression);
                }
                else {
                    write("\"");

                    if (node.kind === SyntaxKind.NumericLiteral) {
                        write((<LiteralExpression>node).text);
                    }
                    else {
                        writeTextOfNode(currentSourceFile, node);
                    }

                    write("\"");
                }
            }

            function isNotExpressionIdentifier(node: Identifier) {
                let parent = node.parent;
                switch (parent.kind) {
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
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                    case SyntaxKind.FunctionExpression:
                    case SyntaxKind.ClassDeclaration:
                    case SyntaxKind.InterfaceDeclaration:
                    case SyntaxKind.EnumDeclaration:
                    case SyntaxKind.ModuleDeclaration:
                    case SyntaxKind.ImportEqualsDeclaration:
                    case SyntaxKind.ImportClause:
                    case SyntaxKind.NamespaceImport:
                        return (<Declaration>parent).name === node;
                    case SyntaxKind.ImportSpecifier:
                    case SyntaxKind.ExportSpecifier:
                        return (<ImportOrExportSpecifier>parent).name === node || (<ImportOrExportSpecifier>parent).propertyName === node;
                    case SyntaxKind.BreakStatement:
                    case SyntaxKind.ContinueStatement:
                    case SyntaxKind.ExportAssignment:
                        return false;
                    case SyntaxKind.LabeledStatement:
                        return (<LabeledStatement>node.parent).label === node;
                }
            }

            function emitExpressionIdentifier(node: Identifier) {
                let substitution = resolver.getExpressionNameSubstitution(node, getGeneratedNameForNode);
                if (substitution) {
                    write(substitution);
                }
                else {
                    writeTextOfNode(currentSourceFile, node);
                }
            }

            function getGeneratedNameForIdentifier(node: Identifier): string {
                if (nodeIsSynthesized(node) || !blockScopedVariableToGeneratedName) {
                    return undefined;
                }

                var variableId = resolver.getBlockScopedVariableId(node)
                if (variableId === undefined) {
                    return undefined;
                }

                return blockScopedVariableToGeneratedName[variableId];
            }

            function emitIdentifier(node: Identifier, allowGeneratedIdentifiers: boolean) {
                if (allowGeneratedIdentifiers) {
                    let generatedName = getGeneratedNameForIdentifier(node);
                    if (generatedName) {
                        write(generatedName);
                        return;
                    }
                }
                if (!node.parent) {
                    write(node.text);
                }
                else if (!isNotExpressionIdentifier(node)) {
                    emitExpressionIdentifier(node);
                }
                else {
                    writeTextOfNode(currentSourceFile, node);
                }
            }

            function emitThis(node: Node) {
                if (resolver.getNodeCheckFlags(node) & NodeCheckFlags.LexicalThis) {
                    write("_this");
                }
                else {
                    write("this");
                }
            }

            function emitSuper(node: Node) {
                if (languageVersion >= ScriptTarget.ES6) {
                    write("super");
                }
                else {
                    var flags = resolver.getNodeCheckFlags(node);
                    if (flags & NodeCheckFlags.SuperInstance) {
                        write("_super.prototype");
                    }
                    else {
                        write("_super");
                    }
                }
            }

            function emitObjectBindingPattern(node: BindingPattern) {
                write("{ ");
                let elements = node.elements;
                emitList(elements, 0, elements.length, /*multiLine*/ false, /*trailingComma*/ elements.hasTrailingComma);
                write(" }");
            }

            function emitArrayBindingPattern(node: BindingPattern) {
                write("[");
                let elements = node.elements;
                emitList(elements, 0, elements.length, /*multiLine*/ false, /*trailingComma*/ elements.hasTrailingComma);
                write("]");
            }

            function emitBindingElement(node: BindingElement) {
                if (node.propertyName) {
                    emit(node.propertyName, /*allowGeneratedIdentifiers*/ false);
                    write(": ");
                }
                if (node.dotDotDotToken) {
                    write("...");
                }
                if (isBindingPattern(node.name)) {
                    emit(node.name);
                }
                else {
                    emitModuleMemberName(node);
                }
                emitOptional(" = ", node.initializer);
            }

            function emitSpreadElementExpression(node: SpreadElementExpression) {
                write("...");
                emit((<SpreadElementExpression>node).expression);
            }

            function needsParenthesisForPropertyAccessOrInvocation(node: Expression) {
                switch (node.kind) {
                    case SyntaxKind.Identifier:
                    case SyntaxKind.ArrayLiteralExpression:
                    case SyntaxKind.PropertyAccessExpression:
                    case SyntaxKind.ElementAccessExpression:
                    case SyntaxKind.CallExpression:
                    case SyntaxKind.ParenthesizedExpression:
                        // This list is not exhaustive and only includes those cases that are relevant
                        // to the check in emitArrayLiteral. More cases can be added as needed.
                        return false;
                }
                return true;
            }

            function emitListWithSpread(elements: Expression[], multiLine: boolean, trailingComma: boolean) {
                let pos = 0;
                let group = 0;
                let length = elements.length;
                while (pos < length) {
                    // Emit using the pattern <group0>.concat(<group1>, <group2>, ...)
                    if (group === 1) {
                        write(".concat(");
                    }
                    else if (group > 1) {
                        write(", ");
                    }
                    let e = elements[pos];
                    if (e.kind === SyntaxKind.SpreadElementExpression) {
                        e = (<SpreadElementExpression>e).expression;
                        emitParenthesizedIf(e, /*parenthesized*/ group === 0 && needsParenthesisForPropertyAccessOrInvocation(e));
                        pos++;
                    }
                    else {
                        let i = pos;
                        while (i < length && elements[i].kind !== SyntaxKind.SpreadElementExpression) {
                            i++;
                        }
                        write("[");
                        if (multiLine) {
                            increaseIndent();
                        }
                        emitList(elements, pos, i - pos, multiLine, trailingComma && i === length);
                        if (multiLine) {
                            decreaseIndent();
                        }
                        write("]");
                        pos = i;
                    }
                    group++;
                }
                if (group > 1) {
                    write(")");
                }
            }

            function isSpreadElementExpression(node: Node) {
                return node.kind === SyntaxKind.SpreadElementExpression;
            }

            function emitArrayLiteral(node: ArrayLiteralExpression) {
                let elements = node.elements;
                if (elements.length === 0) {
                    write("[]");
                }
                else if (languageVersion >= ScriptTarget.ES6 || !forEach(elements, isSpreadElementExpression)) {
                    write("[");
                    emitLinePreservingList(node, node.elements, elements.hasTrailingComma, /*spacesBetweenBraces:*/ false);
                    write("]");
                }
                else {
                    emitListWithSpread(elements, /*multiLine*/(node.flags & NodeFlags.MultiLine) !== 0,
                        /*trailingComma*/ elements.hasTrailingComma);
                }
            }

            function emitDownlevelObjectLiteralWithComputedProperties(node: ObjectLiteralExpression, firstComputedPropertyIndex: number): void {
                let parenthesizedObjectLiteral = createDownlevelObjectLiteralWithComputedProperties(node, firstComputedPropertyIndex);
                return emit(parenthesizedObjectLiteral);
            }

            function createDownlevelObjectLiteralWithComputedProperties(originalObjectLiteral: ObjectLiteralExpression, firstComputedPropertyIndex: number): ParenthesizedExpression {
                // For computed properties, we need to create a unique handle to the object
                // literal so we can modify it without risking internal assignments tainting the object.
                let tempVar = createAndRecordTempVariable(originalObjectLiteral);

                // Hold onto the initial non-computed properties in a new object literal,
                // then create the rest through property accesses on the temp variable.
                let initialObjectLiteral = <ObjectLiteralExpression>createSynthesizedNode(SyntaxKind.ObjectLiteralExpression);
                initialObjectLiteral.properties = <NodeArray<ObjectLiteralElement>>originalObjectLiteral.properties.slice(0, firstComputedPropertyIndex);
                initialObjectLiteral.flags |= NodeFlags.MultiLine;

                // The comma expressions that will patch the object literal.
                // This will end up being something like '_a = { ... }, _a.x = 10, _a.y = 20, _a'.
                let propertyPatches = createBinaryExpression(tempVar, SyntaxKind.EqualsToken, initialObjectLiteral);

                ts.forEach(originalObjectLiteral.properties, property => {
                    let patchedProperty = tryCreatePatchingPropertyAssignment(originalObjectLiteral, tempVar, property);
                    if (patchedProperty) {
                        // TODO(drosen): Preserve comments
                        //let leadingComments = getLeadingCommentRanges(currentSourceFile.text, property.pos);
                        //let trailingComments = getTrailingCommentRanges(currentSourceFile.text, property.end);
                        //addCommentsToSynthesizedNode(patchedProperty, leadingComments, trailingComments);

                        propertyPatches = createBinaryExpression(propertyPatches, SyntaxKind.CommaToken, patchedProperty);
                    }
                });

                // Finally, return the temp variable.
                propertyPatches = createBinaryExpression(propertyPatches, SyntaxKind.CommaToken, createIdentifier(tempVar.text, /*startsOnNewLine:*/ true));

                let result = createParenthesizedExpression(propertyPatches);
                
                // TODO(drosen): Preserve comments
                // let leadingComments = getLeadingCommentRanges(currentSourceFile.text, originalObjectLiteral.pos);
                // let trailingComments = getTrailingCommentRanges(currentSourceFile.text, originalObjectLiteral.end);
                //addCommentsToSynthesizedNode(result, leadingComments, trailingComments);

                return result;
            }

            function addCommentsToSynthesizedNode(node: SynthesizedNode, leadingCommentRanges: CommentRange[], trailingCommentRanges: CommentRange[]): void {
                node.leadingCommentRanges = leadingCommentRanges;
                node.trailingCommentRanges = trailingCommentRanges;
            }

            // Returns 'undefined' if a property has already been accounted for
            // (e.g. a 'get' accessor which has already been emitted along with its 'set' accessor).
            function tryCreatePatchingPropertyAssignment(objectLiteral: ObjectLiteralExpression, tempVar: Identifier, property: ObjectLiteralElement): Expression {
                let leftHandSide = createMemberAccessForPropertyName(tempVar, property.name);
                let maybeRightHandSide = tryGetRightHandSideOfPatchingPropertyAssignment(objectLiteral, property);

                return maybeRightHandSide && createBinaryExpression(leftHandSide, SyntaxKind.EqualsToken, maybeRightHandSide, /*startsOnNewLine:*/ true);
            }

            function tryGetRightHandSideOfPatchingPropertyAssignment(objectLiteral: ObjectLiteralExpression, property: ObjectLiteralElement) {
                switch (property.kind) {
                    case SyntaxKind.PropertyAssignment:
                        return (<PropertyAssignment>property).initializer;

                    case SyntaxKind.ShorthandPropertyAssignment:
                        // TODO: (andersh) Technically it isn't correct to make an identifier here since getExpressionNamePrefix returns
                        // a string containing a dotted name. In general I'm not a fan of mini tree rewriters as this one, elsewhere we
                        // manage by just emitting strings (which is a lot more performant).
                        //let prefix = createIdentifier(resolver.getExpressionNamePrefix((<ShorthandPropertyAssignment>property).name));
                        //return createPropertyAccessExpression(prefix, (<ShorthandPropertyAssignment>property).name);
                        return createIdentifier(resolver.getExpressionNameSubstitution((<ShorthandPropertyAssignment>property).name, getGeneratedNameForNode));

                    case SyntaxKind.MethodDeclaration:
                        return createFunctionExpression((<MethodDeclaration>property).parameters, (<MethodDeclaration>property).body);

                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                        let { firstAccessor, getAccessor, setAccessor } = getAllAccessorDeclarations(objectLiteral.properties, <AccessorDeclaration>property);

                        // Only emit the first accessor.
                        if (firstAccessor !== property) {
                            return undefined;
                        }

                        let propertyDescriptor = <ObjectLiteralExpression>createSynthesizedNode(SyntaxKind.ObjectLiteralExpression);

                        let descriptorProperties = <NodeArray<ObjectLiteralElement>>[];
                        if (getAccessor) {
                            let getProperty = createPropertyAssignment(createIdentifier("get"), createFunctionExpression(getAccessor.parameters, getAccessor.body));
                            descriptorProperties.push(getProperty);
                        }
                        if (setAccessor) {
                            let setProperty = createPropertyAssignment(createIdentifier("set"), createFunctionExpression(setAccessor.parameters, setAccessor.body));
                            descriptorProperties.push(setProperty);
                        }

                        let trueExpr = <PrimaryExpression>createSynthesizedNode(SyntaxKind.TrueKeyword);

                        let enumerableTrue = createPropertyAssignment(createIdentifier("enumerable"), trueExpr);
                        descriptorProperties.push(enumerableTrue);

                        let configurableTrue = createPropertyAssignment(createIdentifier("configurable"), trueExpr);
                        descriptorProperties.push(configurableTrue);

                        propertyDescriptor.properties = descriptorProperties;

                        let objectDotDefineProperty = createPropertyAccessExpression(createIdentifier("Object"), createIdentifier("defineProperty"));
                        return createCallExpression(objectDotDefineProperty, createNodeArray(propertyDescriptor));

                    default:
                        Debug.fail(`ObjectLiteralElement kind ${property.kind} not accounted for.`);
                }
            }

            function createParenthesizedExpression(expression: Expression) {
                let result = <ParenthesizedExpression>createSynthesizedNode(SyntaxKind.ParenthesizedExpression);
                result.expression = expression;

                return result;
            }

            function createNodeArray<T extends Node>(...elements: T[]): NodeArray<T> {
                let result = <NodeArray<T>>elements;
                result.pos = -1;
                result.end = -1;

                return result;
            }

            function createBinaryExpression(left: Expression, operator: SyntaxKind, right: Expression, startsOnNewLine?: boolean): BinaryExpression {
                let result = <BinaryExpression>createSynthesizedNode(SyntaxKind.BinaryExpression, startsOnNewLine);
                result.operatorToken = createSynthesizedNode(operator);
                result.left = left;
                result.right = right;

                return result;
            }

            function createExpressionStatement(expression: Expression): ExpressionStatement {
                let result = <ExpressionStatement>createSynthesizedNode(SyntaxKind.ExpressionStatement);
                result.expression = expression;
                return result;
            }

            function createMemberAccessForPropertyName(expression: LeftHandSideExpression, memberName: DeclarationName): PropertyAccessExpression | ElementAccessExpression {
                if (memberName.kind === SyntaxKind.Identifier) {
                    return createPropertyAccessExpression(expression, <Identifier>memberName);
                }
                else if (memberName.kind === SyntaxKind.StringLiteral || memberName.kind === SyntaxKind.NumericLiteral) {
                    return createElementAccessExpression(expression, <LiteralExpression>memberName);
                }
                else if (memberName.kind === SyntaxKind.ComputedPropertyName) {
                    return createElementAccessExpression(expression, (<ComputedPropertyName>memberName).expression);
                }
                else {
                    Debug.fail(`Kind '${memberName.kind}' not accounted for.`);
                }
            }

            function createPropertyAssignment(name: LiteralExpression | Identifier, initializer: Expression) {
                let result = <PropertyAssignment>createSynthesizedNode(SyntaxKind.PropertyAssignment);
                result.name = name;
                result.initializer = initializer;

                return result;
            }

            function createFunctionExpression(parameters: NodeArray<ParameterDeclaration>, body: Block): FunctionExpression {
                let result = <FunctionExpression>createSynthesizedNode(SyntaxKind.FunctionExpression);
                result.parameters = parameters;
                result.body = body;

                return result;
            }

            function createPropertyAccessExpression(expression: LeftHandSideExpression, name: Identifier): PropertyAccessExpression {
                let result = <PropertyAccessExpression>createSynthesizedNode(SyntaxKind.PropertyAccessExpression);
                result.expression = expression;
                result.dotToken = createSynthesizedNode(SyntaxKind.DotToken);
                result.name = name;

                return result;
            }

            function createElementAccessExpression(expression: LeftHandSideExpression, argumentExpression: Expression): ElementAccessExpression {
                let result = <ElementAccessExpression>createSynthesizedNode(SyntaxKind.ElementAccessExpression);
                result.expression = expression;
                result.argumentExpression = argumentExpression;

                return result;
            }

            function createIdentifier(name: string, startsOnNewLine?: boolean) {
                let result = <Identifier>createSynthesizedNode(SyntaxKind.Identifier, startsOnNewLine);
                result.text = name;

                return result;
            }

            function createCallExpression(invokedExpression: MemberExpression, arguments: NodeArray<Expression>) {
                let result = <CallExpression>createSynthesizedNode(SyntaxKind.CallExpression);
                result.expression = invokedExpression;
                result.arguments = arguments;

                return result;
            }

            function emitObjectLiteral(node: ObjectLiteralExpression): void {
                let properties = node.properties;

                if (languageVersion < ScriptTarget.ES6) {
                    let numProperties = properties.length;

                    // Find the first computed property.
                    // Everything until that point can be emitted as part of the initial object literal.
                    let numInitialNonComputedProperties = numProperties;
                    for (let i = 0, n = properties.length; i < n; i++) {
                        if (properties[i].name.kind === SyntaxKind.ComputedPropertyName) {
                            numInitialNonComputedProperties = i;
                            break;
                        }
                    }

                    let hasComputedProperty = numInitialNonComputedProperties !== properties.length;
                    if (hasComputedProperty) {
                        emitDownlevelObjectLiteralWithComputedProperties(node, numInitialNonComputedProperties);
                        return;
                    }
                }

                // Ordinary case: either the object has no computed properties
                // or we're compiling with an ES6+ target.
                write("{");

                if (properties.length) {
                    emitLinePreservingList(node, properties, /*allowTrailingComma:*/ languageVersion >= ScriptTarget.ES5, /*spacesBetweenBraces:*/ true)
                }

                write("}");
            }

            function emitComputedPropertyName(node: ComputedPropertyName) {
                write("[");
                emitExpressionForPropertyName(node);
                write("]");
            }

            function emitMethod(node: MethodDeclaration) {
                emit(node.name, /*allowGeneratedIdentifiers*/ false);
                if (languageVersion < ScriptTarget.ES6) {
                    write(": function ");
                }
                emitSignatureAndBody(node);
            }

            function emitPropertyAssignment(node: PropertyDeclaration) {
                emit(node.name, /*allowGeneratedIdentifiers*/ false);
                write(": ");
                emit(node.initializer);
            }

            function emitShorthandPropertyAssignment(node: ShorthandPropertyAssignment) {
                emit(node.name, /*allowGeneratedIdentifiers*/ false);
                // If short-hand property has a prefix, then regardless of the target version, we will emit it as normal property assignment. For example:
                //  module m {
                //      export let y;
                //  }
                //  module m {
                //      export let obj = { y };
                //  }
                //  The short-hand property in obj need to emit as such ... = { y : m.y } regardless of the TargetScript version
                if (languageVersion < ScriptTarget.ES6) {
                    // Emit identifier as an identifier
                    write(": ");
                    var generatedName = getGeneratedNameForIdentifier(node.name);
                    if (generatedName) {
                        write(generatedName);
                    }
                    else {
                        // Even though this is stored as identifier treat it as an expression
                        // Short-hand, { x }, is equivalent of normal form { x: x }
                        emitExpressionIdentifier(node.name);
                    }
                }
                else if (resolver.getExpressionNameSubstitution(node.name, getGeneratedNameForNode)) {
                    // Emit identifier as an identifier
                    write(": ");
                    // Even though this is stored as identifier treat it as an expression
                    // Short-hand, { x }, is equivalent of normal form { x: x }
                    emitExpressionIdentifier(node.name);
                }
            }

            function tryEmitConstantValue(node: PropertyAccessExpression | ElementAccessExpression): boolean {
                let constantValue = resolver.getConstantValue(node);
                if (constantValue !== undefined) {
                    write(constantValue.toString());
                    if (!compilerOptions.removeComments) {
                        let propertyName: string = node.kind === SyntaxKind.PropertyAccessExpression ? declarationNameToString((<PropertyAccessExpression>node).name) : getTextOfNode((<ElementAccessExpression>node).argumentExpression);
                        write(" /* " + propertyName + " */");
                    }
                    return true;
                }
                return false;
            }

            // Returns 'true' if the code was actually indented, false otherwise. 
            // If the code is not indented, an optional valueToWriteWhenNotIndenting will be 
            // emitted instead.
            function indentIfOnDifferentLines(parent: Node, node1: Node, node2: Node, valueToWriteWhenNotIndenting?: string): boolean {
                let realNodesAreOnDifferentLines = preserveNewLines && !nodeIsSynthesized(parent) && !nodeEndIsOnSameLineAsNodeStart(node1, node2);

                // Always use a newline for synthesized code if the synthesizer desires it.
                let synthesizedNodeIsOnDifferentLine = synthesizedNodeStartsOnNewLine(node2);

                if (realNodesAreOnDifferentLines || synthesizedNodeIsOnDifferentLine) {
                    increaseIndent();
                    writeLine();
                    return true;
                }
                else {
                    if (valueToWriteWhenNotIndenting) {
                        write(valueToWriteWhenNotIndenting);
                    }
                    return false;
                }
            }

            function emitPropertyAccess(node: PropertyAccessExpression) {
                if (tryEmitConstantValue(node)) {
                    return;
                }

                emit(node.expression);
                let indentedBeforeDot = indentIfOnDifferentLines(node, node.expression, node.dotToken);
                write(".");
                let indentedAfterDot = indentIfOnDifferentLines(node, node.dotToken, node.name);
                emit(node.name, /*allowGeneratedIdentifiers*/ false);
                decreaseIndentIf(indentedBeforeDot, indentedAfterDot);
            }

            function emitQualifiedName(node: QualifiedName) {
                emit(node.left);
                write(".");
                emit(node.right);
            }

            function emitIndexedAccess(node: ElementAccessExpression) {
                if (tryEmitConstantValue(node)) {
                    return;
                }
                emit(node.expression);
                write("[");
                emit(node.argumentExpression);
                write("]");
            }

            function hasSpreadElement(elements: Expression[]) {
                return forEach(elements, e => e.kind === SyntaxKind.SpreadElementExpression);
            }

            function skipParentheses(node: Expression): Expression {
                while (node.kind === SyntaxKind.ParenthesizedExpression || node.kind === SyntaxKind.TypeAssertionExpression) {
                    node = (<ParenthesizedExpression | TypeAssertion>node).expression;
                }
                return node;
            }

            function emitCallTarget(node: Expression): Expression {
                if (node.kind === SyntaxKind.Identifier || node.kind === SyntaxKind.ThisKeyword || node.kind === SyntaxKind.SuperKeyword) {
                    emit(node);
                    return node;
                }
                let temp = createAndRecordTempVariable(node);

                write("(");
                emit(temp);
                write(" = ");
                emit(node);
                write(")");
                return temp;
            }

            function emitCallWithSpread(node: CallExpression) {
                let target: Expression;
                let expr = skipParentheses(node.expression);
                if (expr.kind === SyntaxKind.PropertyAccessExpression) {
                    // Target will be emitted as "this" argument
                    target = emitCallTarget((<PropertyAccessExpression>expr).expression);
                    write(".");
                    emit((<PropertyAccessExpression>expr).name);
                }
                else if (expr.kind === SyntaxKind.ElementAccessExpression) {
                    // Target will be emitted as "this" argument
                    target = emitCallTarget((<PropertyAccessExpression>expr).expression);
                    write("[");
                    emit((<ElementAccessExpression>expr).argumentExpression);
                    write("]");
                }
                else if (expr.kind === SyntaxKind.SuperKeyword) {
                    target = expr;
                    write("_super");
                }
                else {
                    emit(node.expression);
                }
                write(".apply(");
                if (target) {
                    if (target.kind === SyntaxKind.SuperKeyword) {
                        // Calls of form super(...) and super.foo(...)
                        emitThis(target);
                    }
                    else {
                        // Calls of form obj.foo(...)
                        emit(target);
                    }
                }
                else {
                    // Calls of form foo(...)
                    write("void 0");
                }
                write(", ");
                emitListWithSpread(node.arguments, /*multiLine*/ false, /*trailingComma*/ false);
                write(")");
            }

            function emitCallExpression(node: CallExpression) {
                if (languageVersion < ScriptTarget.ES6 && hasSpreadElement(node.arguments)) {
                    emitCallWithSpread(node);
                    return;
                }
                let superCall = false;
                if (node.expression.kind === SyntaxKind.SuperKeyword) {
                    emitSuper(node.expression);
                    superCall = true;
                }
                else {
                    emit(node.expression);
                    superCall = node.expression.kind === SyntaxKind.PropertyAccessExpression && (<PropertyAccessExpression>node.expression).expression.kind === SyntaxKind.SuperKeyword;
                }
                if (superCall && languageVersion < ScriptTarget.ES6) {
                    write(".call(");
                    emitThis(node.expression);
                    if (node.arguments.length) {
                        write(", ");
                        emitCommaList(node.arguments);
                    }
                    write(")");
                }
                else {
                    write("(");
                    emitCommaList(node.arguments);
                    write(")");
                }
            }

            function emitNewExpression(node: NewExpression) {
                write("new ");
                emit(node.expression);
                if (node.arguments) {
                    write("(");
                    emitCommaList(node.arguments);
                    write(")");
                }
            }

            function emitTaggedTemplateExpression(node: TaggedTemplateExpression): void {
                if (languageVersion >= ScriptTarget.ES6) {
                    emit(node.tag);
                    write(" ");
                    emit(node.template);
                }
                else {
                    emitDownlevelTaggedTemplate(node);
                }
            }

            function emitParenExpression(node: ParenthesizedExpression) {
                if (!node.parent || node.parent.kind !== SyntaxKind.ArrowFunction) {
                    if (node.expression.kind === SyntaxKind.TypeAssertionExpression) {
                        let operand = (<TypeAssertion>node.expression).expression;

                        // Make sure we consider all nested cast expressions, e.g.:
                        // (<any><number><any>-A).x;
                        while (operand.kind == SyntaxKind.TypeAssertionExpression) {
                            operand = (<TypeAssertion>operand).expression;
                        }

                        // We have an expression of the form: (<Type>SubExpr)
                        // Emitting this as (SubExpr) is really not desirable. We would like to emit the subexpr as is.
                        // Omitting the parentheses, however, could cause change in the semantics of the generated
                        // code if the casted expression has a lower precedence than the rest of the expression, e.g.:
                        //      (<any>new A).foo should be emitted as (new A).foo and not new A.foo
                        //      (<any>typeof A).toString() should be emitted as (typeof A).toString() and not typeof A.toString()
                        //      new (<any>A()) should be emitted as new (A()) and not new A()
                        //      (<any>function foo() { })() should be emitted as an IIF (function foo(){})() and not declaration function foo(){} ()
                        if (operand.kind !== SyntaxKind.PrefixUnaryExpression &&
                            operand.kind !== SyntaxKind.VoidExpression &&
                            operand.kind !== SyntaxKind.TypeOfExpression &&
                            operand.kind !== SyntaxKind.DeleteExpression &&
                            operand.kind !== SyntaxKind.PostfixUnaryExpression &&
                            operand.kind !== SyntaxKind.NewExpression &&
                            !(operand.kind === SyntaxKind.CallExpression && node.parent.kind === SyntaxKind.NewExpression) &&
                            !(operand.kind === SyntaxKind.FunctionExpression && node.parent.kind === SyntaxKind.CallExpression)) {
                            emit(operand);
                            return;
                        }
                    }
                }

                write("(");
                emit(node.expression);
                write(")");
            }

            function emitDeleteExpression(node: DeleteExpression) {
                write(tokenToString(SyntaxKind.DeleteKeyword));
                write(" ");
                emit(node.expression);
            }

            function emitVoidExpression(node: VoidExpression) {
                write(tokenToString(SyntaxKind.VoidKeyword));
                write(" ");
                emit(node.expression);
            }

            function emitTypeOfExpression(node: TypeOfExpression) {
                write(tokenToString(SyntaxKind.TypeOfKeyword));
                write(" ");
                emit(node.expression);
            }

            function emitPrefixUnaryExpression(node: PrefixUnaryExpression) {
                write(tokenToString(node.operator));
                // In some cases, we need to emit a space between the operator and the operand. One obvious case
                // is when the operator is an identifier, like delete or typeof. We also need to do this for plus
                // and minus expressions in certain cases. Specifically, consider the following two cases (parens
                // are just for clarity of exposition, and not part of the source code):
                //
                //  (+(+1))
                //  (+(++1))
                //
                // We need to emit a space in both cases. In the first case, the absence of a space will make
                // the resulting expression a prefix increment operation. And in the second, it will make the resulting
                // expression a prefix increment whose operand is a plus expression - (++(+x))
                // The same is true of minus of course.
                if (node.operand.kind === SyntaxKind.PrefixUnaryExpression) {
                    let operand = <PrefixUnaryExpression>node.operand;
                    if (node.operator === SyntaxKind.PlusToken && (operand.operator === SyntaxKind.PlusToken || operand.operator === SyntaxKind.PlusPlusToken)) {
                        write(" ");
                    }
                    else if (node.operator === SyntaxKind.MinusToken && (operand.operator === SyntaxKind.MinusToken || operand.operator === SyntaxKind.MinusMinusToken)) {
                        write(" ");
                    }
                }
                emit(node.operand);
            }

            function emitPostfixUnaryExpression(node: PostfixUnaryExpression) {
                emit(node.operand);
                write(tokenToString(node.operator));
            }

            function emitBinaryExpression(node: BinaryExpression) {
                if (languageVersion < ScriptTarget.ES6 && node.operatorToken.kind === SyntaxKind.EqualsToken &&
                    (node.left.kind === SyntaxKind.ObjectLiteralExpression || node.left.kind === SyntaxKind.ArrayLiteralExpression)) {
                    emitDestructuring(node, node.parent.kind === SyntaxKind.ExpressionStatement);
                }
                else {
                    emit(node.left);
                    let indentedBeforeOperator = indentIfOnDifferentLines(node, node.left, node.operatorToken, node.operatorToken.kind !== SyntaxKind.CommaToken ? " " : undefined);
                    write(tokenToString(node.operatorToken.kind));
                    let indentedAfterOperator = indentIfOnDifferentLines(node, node.operatorToken, node.right, " ");
                    emit(node.right);
                    decreaseIndentIf(indentedBeforeOperator, indentedAfterOperator);
                }
            }

            function synthesizedNodeStartsOnNewLine(node: Node) {
                return nodeIsSynthesized(node) && (<SynthesizedNode>node).startsOnNewLine;
            }

            function emitConditionalExpression(node: ConditionalExpression) {
                emit(node.condition);
                let indentedBeforeQuestion = indentIfOnDifferentLines(node, node.condition, node.questionToken, " ");
                write("?");
                let indentedAfterQuestion = indentIfOnDifferentLines(node, node.questionToken, node.whenTrue, " ");
                emit(node.whenTrue);
                decreaseIndentIf(indentedBeforeQuestion, indentedAfterQuestion);
                let indentedBeforeColon = indentIfOnDifferentLines(node, node.whenTrue, node.colonToken, " ");
                write(":");
                let indentedAfterColon = indentIfOnDifferentLines(node, node.colonToken, node.whenFalse, " ");
                emit(node.whenFalse);
                decreaseIndentIf(indentedBeforeColon, indentedAfterColon);
            }

            // Helper function to decrease the indent if we previously indented.  Allows multiple 
            // previous indent values to be considered at a time.  This also allows caller to just
            // call this once, passing in all their appropriate indent values, instead of needing
            // to call this helper function multiple times.
            function decreaseIndentIf(value1: boolean, value2?: boolean) {
                if (value1) {
                    decreaseIndent();
                }
                if (value2) {
                    decreaseIndent();
                }
            }

            function isSingleLineEmptyBlock(node: Node) {
                if (node && node.kind === SyntaxKind.Block) {
                    let block = <Block>node;
                    return block.statements.length === 0 && nodeEndIsOnSameLineAsNodeStart(block, block);
                }
            }

            function emitBlock(node: Block) {
                if (preserveNewLines && isSingleLineEmptyBlock(node)) {
                    emitToken(SyntaxKind.OpenBraceToken, node.pos);
                    write(" ");
                    emitToken(SyntaxKind.CloseBraceToken, node.statements.end);
                    return;
                }

                emitToken(SyntaxKind.OpenBraceToken, node.pos);
                increaseIndent();
                scopeEmitStart(node.parent);
                if (node.kind === SyntaxKind.ModuleBlock) {
                    Debug.assert(node.parent.kind === SyntaxKind.ModuleDeclaration);
                    emitCaptureThisForNodeIfNecessary(node.parent);
                }
                emitLines(node.statements);
                if (node.kind === SyntaxKind.ModuleBlock) {
                    emitTempDeclarations(/*newLine*/ true);
                }
                decreaseIndent();
                writeLine();
                emitToken(SyntaxKind.CloseBraceToken, node.statements.end);
                scopeEmitEnd();
            }

            function emitEmbeddedStatement(node: Node) {
                if (node.kind === SyntaxKind.Block) {
                    write(" ");
                    emit(<Block>node);
                }
                else {
                    increaseIndent();
                    writeLine();
                    emit(node);
                    decreaseIndent();
                }
            }

            function emitExpressionStatement(node: ExpressionStatement) {
                emitParenthesizedIf(node.expression, /*parenthesized*/ node.expression.kind === SyntaxKind.ArrowFunction);
                write(";");
            }

            function emitIfStatement(node: IfStatement) {
                let endPos = emitToken(SyntaxKind.IfKeyword, node.pos);
                write(" ");
                endPos = emitToken(SyntaxKind.OpenParenToken, endPos);
                emit(node.expression);
                emitToken(SyntaxKind.CloseParenToken, node.expression.end);
                emitEmbeddedStatement(node.thenStatement);
                if (node.elseStatement) {
                    writeLine();
                    emitToken(SyntaxKind.ElseKeyword, node.thenStatement.end);
                    if (node.elseStatement.kind === SyntaxKind.IfStatement) {
                        write(" ");
                        emit(node.elseStatement);
                    }
                    else {
                        emitEmbeddedStatement(node.elseStatement);
                    }
                }
            }

            function emitDoStatement(node: DoStatement) {
                write("do");
                emitEmbeddedStatement(node.statement);
                if (node.statement.kind === SyntaxKind.Block) {
                    write(" ");
                }
                else {
                    writeLine();
                }
                write("while (");
                emit(node.expression);
                write(");");
            }

            function emitWhileStatement(node: WhileStatement) {
                write("while (");
                emit(node.expression);
                write(")");
                emitEmbeddedStatement(node.statement);
            }

            function emitStartOfVariableDeclarationList(decl: Node, startPos?: number): void {
                let tokenKind = SyntaxKind.VarKeyword;
                if (decl && languageVersion >= ScriptTarget.ES6) {
                    if (isLet(decl)) {
                        tokenKind = SyntaxKind.LetKeyword;
                    }
                    else if (isConst(decl)) {
                        tokenKind = SyntaxKind.ConstKeyword;
                    }
                }

                if (startPos !== undefined) {
                    emitToken(tokenKind, startPos);
                }
                else {
                    switch (tokenKind) {
                        case SyntaxKind.VarKeyword:
                            return write("var ");
                        case SyntaxKind.LetKeyword:
                            return write("let ");
                        case SyntaxKind.ConstKeyword:
                            return write("const ");
                    }
                }
            }

            function emitForStatement(node: ForStatement) {
                let endPos = emitToken(SyntaxKind.ForKeyword, node.pos);
                write(" ");
                endPos = emitToken(SyntaxKind.OpenParenToken, endPos);
                if (node.initializer && node.initializer.kind === SyntaxKind.VariableDeclarationList) {
                    let variableDeclarationList = <VariableDeclarationList>node.initializer;
                    let declarations = variableDeclarationList.declarations;
                    emitStartOfVariableDeclarationList(declarations[0], endPos);
                    write(" ");
                    emitCommaList(declarations);
                }
                else if (node.initializer) {
                    emit(node.initializer);
                }
                write(";");
                emitOptional(" ", node.condition);
                write(";");
                emitOptional(" ", node.iterator);
                write(")");
                emitEmbeddedStatement(node.statement);
            }

            function emitForInOrForOfStatement(node: ForInStatement | ForOfStatement) {
                if (languageVersion < ScriptTarget.ES6 && node.kind === SyntaxKind.ForOfStatement) {
                    return emitDownLevelForOfStatement(node);
                }

                let endPos = emitToken(SyntaxKind.ForKeyword, node.pos);
                write(" ");
                endPos = emitToken(SyntaxKind.OpenParenToken, endPos);
                if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
                    let variableDeclarationList = <VariableDeclarationList>node.initializer;
                    if (variableDeclarationList.declarations.length >= 1) {
                        let decl = variableDeclarationList.declarations[0];
                        emitStartOfVariableDeclarationList(decl, endPos);
                        write(" ");
                        emit(decl);
                    }
                }
                else {
                    emit(node.initializer);
                }

                if (node.kind === SyntaxKind.ForInStatement) {
                    write(" in ");
                }
                else {
                    write(" of ");
                }
                emit(node.expression);
                emitToken(SyntaxKind.CloseParenToken, node.expression.end);
                emitEmbeddedStatement(node.statement);
            }

            function emitDownLevelForOfStatement(node: ForOfStatement) {
                // The following ES6 code:
                //
                //    for (let v of expr) { }
                //
                // should be emitted as
                //
                //    for (let _i = 0, _a = expr; _i < _a.length; _i++) {
                //        let v = _a[_i];
                //    }
                //
                // where _a and _i are temps emitted to capture the RHS and the counter,
                // respectively.
                // When the left hand side is an expression instead of a let declaration,
                // the "let v" is not emitted.
                // When the left hand side is a let/const, the v is renamed if there is
                // another v in scope.
                // Note that all assignments to the LHS are emitted in the body, including
                // all destructuring.
                // Note also that because an extra statement is needed to assign to the LHS,
                // for-of bodies are always emitted as blocks.
                
                let endPos = emitToken(SyntaxKind.ForKeyword, node.pos);
                write(" ");
                endPos = emitToken(SyntaxKind.OpenParenToken, endPos);
                
                // Do not emit the LHS let declaration yet, because it might contain destructuring.
                
                // Do not call recordTempDeclaration because we are declaring the temps
                // right here. Recording means they will be declared later.
                // In the case where the user wrote an identifier as the RHS, like this:
                //
                //     for (let v of arr) { }
                //
                // we don't want to emit a temporary variable for the RHS, just use it directly.
                let rhsIsIdentifier = node.expression.kind === SyntaxKind.Identifier;
                let counter = createTempVariable(node, TempVariableKind._i);
                let rhsReference = rhsIsIdentifier ? <Identifier>node.expression : createTempVariable(node);

                var cachedLength = compilerOptions.cacheDownlevelForOfLength ? createTempVariable(node, TempVariableKind._n) : undefined;

                // This is the let keyword for the counter and rhsReference. The let keyword for
                // the LHS will be emitted inside the body.
                emitStart(node.expression);
                write("var ");
                
                // _i = 0
                emitNodeWithoutSourceMap(counter);
                write(" = 0");
                emitEnd(node.expression);

                if (!rhsIsIdentifier) {
                    // , _a = expr
                    write(", ");
                    emitStart(node.expression);
                    emitNodeWithoutSourceMap(rhsReference);
                    write(" = ");
                    emitNodeWithoutSourceMap(node.expression);
                    emitEnd(node.expression);
                }

                if (cachedLength) {
                    write(", ");
                    emitNodeWithoutSourceMap(cachedLength);
                    write(" = ");
                    emitNodeWithoutSourceMap(rhsReference);
                    write(".length");
                }

                write("; ");
                
                // _i < _a.length;
                emitStart(node.initializer);
                emitNodeWithoutSourceMap(counter);
                write(" < ");

                if (cachedLength) {
                    emitNodeWithoutSourceMap(cachedLength);
                }
                else {
                    emitNodeWithoutSourceMap(rhsReference);
                    write(".length");
                }

                emitEnd(node.initializer);
                write("; ");
                
                // _i++)
                emitStart(node.initializer);
                emitNodeWithoutSourceMap(counter);
                write("++");
                emitEnd(node.initializer);
                emitToken(SyntaxKind.CloseParenToken, node.expression.end);
                
                // Body
                write(" {");
                writeLine();
                increaseIndent();
                
                // Initialize LHS
                // let v = _a[_i];
                let rhsIterationValue = createElementAccessExpression(rhsReference, counter);
                emitStart(node.initializer);
                if (node.initializer.kind === SyntaxKind.VariableDeclarationList) {
                    write("var ");
                    let variableDeclarationList = <VariableDeclarationList>node.initializer;
                    if (variableDeclarationList.declarations.length > 0) {
                        let declaration = variableDeclarationList.declarations[0];
                        if (isBindingPattern(declaration.name)) {
                            // This works whether the declaration is a var, let, or const.
                            // It will use rhsIterationValue _a[_i] as the initializer.
                            emitDestructuring(declaration, /*isAssignmentExpressionStatement*/ false, rhsIterationValue);
                        }
                        else {
                            // The following call does not include the initializer, so we have
                            // to emit it separately.
                            emitNodeWithoutSourceMap(declaration);
                            write(" = ");
                            emitNodeWithoutSourceMap(rhsIterationValue);
                        }
                    }
                    else {
                        // It's an empty declaration list. This can only happen in an error case, if the user wrote
                        //     for (let of []) {}
                        emitNodeWithoutSourceMap(createTempVariable(node));
                        write(" = ");
                        emitNodeWithoutSourceMap(rhsIterationValue);
                    }
                }
                else {
                    // Initializer is an expression. Emit the expression in the body, so that it's
                    // evaluated on every iteration.
                    let assignmentExpression = createBinaryExpression(<Expression>node.initializer, SyntaxKind.EqualsToken, rhsIterationValue, /*startsOnNewLine*/ false);
                    if (node.initializer.kind === SyntaxKind.ArrayLiteralExpression || node.initializer.kind === SyntaxKind.ObjectLiteralExpression) {
                        // This is a destructuring pattern, so call emitDestructuring instead of emit. Calling emit will not work, because it will cause
                        // the BinaryExpression to be passed in instead of the expression statement, which will cause emitDestructuring to crash.
                        emitDestructuring(assignmentExpression, /*isAssignmentExpressionStatement*/ true, /*value*/ undefined, /*locationForCheckingExistingName*/ node);
                    }
                    else {
                        emitNodeWithoutSourceMap(assignmentExpression);
                    }
                }
                emitEnd(node.initializer);
                write(";");

                if (node.statement.kind === SyntaxKind.Block) {
                    emitLines((<Block>node.statement).statements);
                }
                else {
                    writeLine();
                    emit(node.statement);
                }

                writeLine();
                decreaseIndent();
                write("}");
            }

            function emitBreakOrContinueStatement(node: BreakOrContinueStatement) {
                emitToken(node.kind === SyntaxKind.BreakStatement ? SyntaxKind.BreakKeyword : SyntaxKind.ContinueKeyword, node.pos);
                emitOptional(" ", node.label);
                write(";");
            }

            function emitReturnStatement(node: ReturnStatement) {
                emitToken(SyntaxKind.ReturnKeyword, node.pos);
                emitOptional(" ", node.expression);
                write(";");
            }

            function emitWithStatement(node: WhileStatement) {
                write("with (");
                emit(node.expression);
                write(")");
                emitEmbeddedStatement(node.statement);
            }

            function emitSwitchStatement(node: SwitchStatement) {
                let endPos = emitToken(SyntaxKind.SwitchKeyword, node.pos);
                write(" ");
                emitToken(SyntaxKind.OpenParenToken, endPos);
                emit(node.expression);
                endPos = emitToken(SyntaxKind.CloseParenToken, node.expression.end);
                write(" ");
                emitCaseBlock(node.caseBlock, endPos)
            }

            function emitCaseBlock(node: CaseBlock, startPos: number): void {
                emitToken(SyntaxKind.OpenBraceToken, startPos);
                increaseIndent();
                emitLines(node.clauses);
                decreaseIndent();
                writeLine();
                emitToken(SyntaxKind.CloseBraceToken, node.clauses.end);
            }

            function nodeStartPositionsAreOnSameLine(node1: Node, node2: Node) {
                return getLineOfLocalPosition(currentSourceFile, skipTrivia(currentSourceFile.text, node1.pos)) ===
                    getLineOfLocalPosition(currentSourceFile, skipTrivia(currentSourceFile.text, node2.pos));
            }

            function nodeEndPositionsAreOnSameLine(node1: Node, node2: Node) {
                return getLineOfLocalPosition(currentSourceFile, node1.end) ===
                    getLineOfLocalPosition(currentSourceFile, node2.end);
            }

            function nodeEndIsOnSameLineAsNodeStart(node1: Node, node2: Node) {
                return getLineOfLocalPosition(currentSourceFile, node1.end) ===
                    getLineOfLocalPosition(currentSourceFile, skipTrivia(currentSourceFile.text, node2.pos));
            }

            function emitCaseOrDefaultClause(node: CaseOrDefaultClause) {
                if (node.kind === SyntaxKind.CaseClause) {
                    write("case ");
                    emit((<CaseClause>node).expression);
                    write(":");
                }
                else {
                    write("default:");
                }

                if (preserveNewLines && node.statements.length === 1 && nodeStartPositionsAreOnSameLine(node, node.statements[0])) {
                    write(" ");
                    emit(node.statements[0]);
                }
                else {
                    increaseIndent();
                    emitLines(node.statements);
                    decreaseIndent();
                }
            }

            function emitThrowStatement(node: ThrowStatement) {
                write("throw ");
                emit(node.expression);
                write(";");
            }

            function emitTryStatement(node: TryStatement) {
                write("try ");
                emit(node.tryBlock);
                emit(node.catchClause);
                if (node.finallyBlock) {
                    writeLine();
                    write("finally ");
                    emit(node.finallyBlock);
                }
            }

            function emitCatchClause(node: CatchClause) {
                writeLine();
                let endPos = emitToken(SyntaxKind.CatchKeyword, node.pos);
                write(" ");
                emitToken(SyntaxKind.OpenParenToken, endPos);
                emit(node.variableDeclaration);
                emitToken(SyntaxKind.CloseParenToken, node.variableDeclaration ? node.variableDeclaration.end : endPos);
                write(" ");
                emitBlock(node.block);
            }

            function emitDebuggerStatement(node: Node) {
                emitToken(SyntaxKind.DebuggerKeyword, node.pos);
                write(";");
            }

            function emitLabelledStatement(node: LabeledStatement) {
                emit(node.label);
                write(": ");
                emit(node.statement);
            }

            function getContainingModule(node: Node): ModuleDeclaration {
                do {
                    node = node.parent;
                } while (node && node.kind !== SyntaxKind.ModuleDeclaration);
                return <ModuleDeclaration>node;
            }

            function emitContainingModuleName(node: Node) {
                let container = getContainingModule(node);
                write(container ? getGeneratedNameForNode(container) : "exports");
            }

            function emitModuleMemberName(node: Declaration) {
                emitStart(node.name);
                if (getCombinedNodeFlags(node) & NodeFlags.Export) {
                    var container = getContainingModule(node);
                    if (container) {
                        write(getGeneratedNameForNode(container));
                        write(".");
                    }
                    else if (languageVersion < ScriptTarget.ES6) {
                        write("exports.");
                    }
                }
                emitNodeWithoutSourceMap(node.name);
                emitEnd(node.name);
            }

            function createVoidZero(): Expression {
                let zero = <LiteralExpression>createSynthesizedNode(SyntaxKind.NumericLiteral);
                zero.text = "0";
                let result = <VoidExpression>createSynthesizedNode(SyntaxKind.VoidExpression);
                result.expression = zero;
                return result;
            }

            function emitExportMemberAssignment(node: FunctionLikeDeclaration | ClassDeclaration) {
                if (node.flags & NodeFlags.Export) {
                    writeLine();
                    emitStart(node);
                    if (node.name) {
                        emitModuleMemberName(node);
                    }
                    else {
                        write("exports.default");
                    }
                    write(" = ");
                    emitDeclarationName(node);
                    emitEnd(node);
                    write(";");
                }
            }

            function emitExportMemberAssignments(name: Identifier) {
                if (!exportEquals && exportSpecifiers && hasProperty(exportSpecifiers, name.text)) {
                    for (let specifier of exportSpecifiers[name.text]) {
                        writeLine();
                        emitStart(specifier.name);
                        emitContainingModuleName(specifier);
                        write(".");
                        emitNodeWithoutSourceMap(specifier.name);
                        emitEnd(specifier.name);
                        write(" = ");
                        emitExpressionIdentifier(name);
                        write(";");
                    }
                }
            }

            /**
             * If the root has a chance of being a synthesized node, callers should also pass a value for
             * lowestNonSynthesizedAncestor. This should be an ancestor of root, it should not be synthesized,
             * and there should not be a lower ancestor that introduces a scope. This node will be used as the
             * location for ensuring that temporary names are unique.
             */
            function emitDestructuring(root: BinaryExpression | VariableDeclaration | ParameterDeclaration,
                isAssignmentExpressionStatement: boolean,
                value?: Expression,
                lowestNonSynthesizedAncestor?: Node) {
                let emitCount = 0;
                // An exported declaration is actually emitted as an assignment (to a property on the module object), so
                // temporary variables in an exported declaration need to have real declarations elsewhere
                let isDeclaration = (root.kind === SyntaxKind.VariableDeclaration && !(getCombinedNodeFlags(root) & NodeFlags.Export)) || root.kind === SyntaxKind.Parameter;
                if (root.kind === SyntaxKind.BinaryExpression) {
                    emitAssignmentExpression(<BinaryExpression>root);
                }
                else {
                    Debug.assert(!isAssignmentExpressionStatement);
                    emitBindingElement(<BindingElement>root, value);
                }

                function emitAssignment(name: Identifier, value: Expression) {
                    if (emitCount++) {
                        write(", ");
                    }

                    renameNonTopLevelLetAndConst(name);
                    if (name.parent && (name.parent.kind === SyntaxKind.VariableDeclaration || name.parent.kind === SyntaxKind.BindingElement)) {
                        emitModuleMemberName(<Declaration>name.parent);
                    }
                    else {
                        emit(name);
                    }
                    write(" = ");
                    emit(value);
                }

                function ensureIdentifier(expr: Expression): Expression {
                    if (expr.kind !== SyntaxKind.Identifier) {
                        // In case the root is a synthesized node, we need to pass lowestNonSynthesizedAncestor
                        // as the location for determining uniqueness of the variable we are about to
                        // generate.
                        let identifier = createTempVariable(lowestNonSynthesizedAncestor || root);
                        if (!isDeclaration) {
                            recordTempDeclaration(identifier);
                        }
                        emitAssignment(identifier, expr);
                        expr = identifier;
                    }
                    return expr;
                }

                function createDefaultValueCheck(value: Expression, defaultValue: Expression): Expression {
                    // The value expression will be evaluated twice, so for anything but a simple identifier
                    // we need to generate a temporary variable
                    value = ensureIdentifier(value);
                    // Return the expression 'value === void 0 ? defaultValue : value'
                    let equals = <BinaryExpression>createSynthesizedNode(SyntaxKind.BinaryExpression);
                    equals.left = value;
                    equals.operatorToken = createSynthesizedNode(SyntaxKind.EqualsEqualsEqualsToken);
                    equals.right = createVoidZero();
                    return createConditionalExpression(equals, defaultValue, value);
                }

                function createConditionalExpression(condition: Expression, whenTrue: Expression, whenFalse: Expression) {
                    let cond = <ConditionalExpression>createSynthesizedNode(SyntaxKind.ConditionalExpression);
                    cond.condition = condition;
                    cond.questionToken = createSynthesizedNode(SyntaxKind.QuestionToken);
                    cond.whenTrue = whenTrue;
                    cond.colonToken = createSynthesizedNode(SyntaxKind.ColonToken);
                    cond.whenFalse = whenFalse;
                    return cond;
                }

                function createNumericLiteral(value: number) {
                    let node = <LiteralExpression>createSynthesizedNode(SyntaxKind.NumericLiteral);
                    node.text = "" + value;
                    return node;
                }

                function parenthesizeForAccess(expr: Expression): LeftHandSideExpression {
                    if (expr.kind === SyntaxKind.Identifier || expr.kind === SyntaxKind.PropertyAccessExpression || expr.kind === SyntaxKind.ElementAccessExpression) {
                        return <LeftHandSideExpression>expr;
                    }
                    let node = <ParenthesizedExpression>createSynthesizedNode(SyntaxKind.ParenthesizedExpression);
                    node.expression = expr;
                    return node;
                }

                function createPropertyAccess(object: Expression, propName: Identifier): Expression {
                    if (propName.kind !== SyntaxKind.Identifier) {
                        return createElementAccess(object, propName);
                    }
                    return createPropertyAccessExpression(parenthesizeForAccess(object), propName);
                }

                function createElementAccess(object: Expression, index: Expression): Expression {
                    let node = <ElementAccessExpression>createSynthesizedNode(SyntaxKind.ElementAccessExpression);
                    node.expression = parenthesizeForAccess(object);
                    node.argumentExpression = index;
                    return node;
                }

                function emitObjectLiteralAssignment(target: ObjectLiteralExpression, value: Expression) {
                    let properties = target.properties;
                    if (properties.length !== 1) {
                        // For anything but a single element destructuring we need to generate a temporary
                        // to ensure value is evaluated exactly once.
                        value = ensureIdentifier(value);
                    }
                    for (let p of properties) {
                        if (p.kind === SyntaxKind.PropertyAssignment || p.kind === SyntaxKind.ShorthandPropertyAssignment) {
                            // TODO(andersh): Computed property support
                            let propName = <Identifier>((<PropertyAssignment>p).name);
                            emitDestructuringAssignment((<PropertyAssignment>p).initializer || propName, createPropertyAccess(value, propName));
                        }
                    }
                }

                function emitArrayLiteralAssignment(target: ArrayLiteralExpression, value: Expression) {
                    let elements = target.elements;
                    if (elements.length !== 1) {
                        // For anything but a single element destructuring we need to generate a temporary
                        // to ensure value is evaluated exactly once.
                        value = ensureIdentifier(value);
                    }
                    for (let i = 0; i < elements.length; i++) {
                        let e = elements[i];
                        if (e.kind !== SyntaxKind.OmittedExpression) {
                            if (e.kind !== SyntaxKind.SpreadElementExpression) {
                                emitDestructuringAssignment(e, createElementAccess(value, createNumericLiteral(i)));
                            }
                            else {
                                if (i === elements.length - 1) {
                                    value = ensureIdentifier(value);
                                    emitAssignment(<Identifier>(<SpreadElementExpression>e).expression, value);
                                    write(".slice(" + i + ")");
                                }
                            }
                        }
                    }
                }

                function emitDestructuringAssignment(target: Expression, value: Expression) {
                    if (target.kind === SyntaxKind.BinaryExpression && (<BinaryExpression>target).operatorToken.kind === SyntaxKind.EqualsToken) {
                        value = createDefaultValueCheck(value, (<BinaryExpression>target).right);
                        target = (<BinaryExpression>target).left;
                    }
                    if (target.kind === SyntaxKind.ObjectLiteralExpression) {
                        emitObjectLiteralAssignment(<ObjectLiteralExpression>target, value);
                    }
                    else if (target.kind === SyntaxKind.ArrayLiteralExpression) {
                        emitArrayLiteralAssignment(<ArrayLiteralExpression>target, value);
                    }
                    else {
                        emitAssignment(<Identifier>target, value);
                    }
                }

                function emitAssignmentExpression(root: BinaryExpression) {
                    let target = root.left;
                    let value = root.right;
                    if (isAssignmentExpressionStatement) {
                        emitDestructuringAssignment(target, value);
                    }
                    else {
                        if (root.parent.kind !== SyntaxKind.ParenthesizedExpression) {
                            write("(");
                        }
                        value = ensureIdentifier(value);
                        emitDestructuringAssignment(target, value);
                        write(", ");
                        emit(value);
                        if (root.parent.kind !== SyntaxKind.ParenthesizedExpression) {
                            write(")");
                        }
                    }
                }

                function emitBindingElement(target: BindingElement, value: Expression) {
                    if (target.initializer) {
                        // Combine value and initializer
                        value = value ? createDefaultValueCheck(value, target.initializer) : target.initializer;
                    }
                    else if (!value) {
                        // Use 'void 0' in absence of value and initializer
                        value = createVoidZero();
                    }
                    if (isBindingPattern(target.name)) {
                        let pattern = <BindingPattern>target.name;
                        let elements = pattern.elements;
                        if (elements.length !== 1) {
                            // For anything but a single element destructuring we need to generate a temporary
                            // to ensure value is evaluated exactly once.
                            value = ensureIdentifier(value);
                        }
                        for (let i = 0; i < elements.length; i++) {
                            let element = elements[i];
                            if (pattern.kind === SyntaxKind.ObjectBindingPattern) {
                                // Rewrite element to a declaration with an initializer that fetches property
                                let propName = element.propertyName || <Identifier>element.name;
                                emitBindingElement(element, createPropertyAccess(value, propName));
                            }
                            else if (element.kind !== SyntaxKind.OmittedExpression) {
                                if (!element.dotDotDotToken) {
                                    // Rewrite element to a declaration that accesses array element at index i
                                    emitBindingElement(element, createElementAccess(value, createNumericLiteral(i)));
                                }
                                else {
                                    if (i === elements.length - 1) {
                                        value = ensureIdentifier(value);
                                        emitAssignment(<Identifier>element.name, value);
                                        write(".slice(" + i + ")");
                                    }
                                }
                            }
                        }
                    }
                    else {
                        emitAssignment(<Identifier>target.name, value);
                    }
                }
            }

            function emitVariableDeclaration(node: VariableDeclaration) {
                if (isBindingPattern(node.name)) {
                    if (languageVersion < ScriptTarget.ES6) {
                        emitDestructuring(node, /*isAssignmentExpressionStatement*/ false);
                    }
                    else {
                        emit(node.name);
                        emitOptional(" = ", node.initializer);
                    }
                }
                else {
                    renameNonTopLevelLetAndConst(<Identifier>node.name);
                    emitModuleMemberName(node);

                    let initializer = node.initializer;
                    if (!initializer && languageVersion < ScriptTarget.ES6) {

                        // downlevel emit for non-initialized let bindings defined in loops
                        // for (...) {  let x; }
                        // should be
                        // for (...) { var <some-uniqie-name> = void 0; }
                        // this is necessary to preserve ES6 semantic in scenarios like
                        // for (...) { let x; console.log(x); x = 1 } // assignment on one iteration should not affect other iterations
                        let isUninitializedLet =
                            (resolver.getNodeCheckFlags(node) & NodeCheckFlags.BlockScopedBindingInLoop) &&
                            (getCombinedFlagsForIdentifier(<Identifier>node.name) & NodeFlags.Let);

                        // NOTE: default initialization should not be added to let bindings in for-in\for-of statements
                        if (isUninitializedLet &&
                            node.parent.parent.kind !== SyntaxKind.ForInStatement &&
                            node.parent.parent.kind !== SyntaxKind.ForOfStatement) {
                            initializer = createVoidZero();
                        }
                    }

                    emitOptional(" = ", initializer);
                }
            }

            function emitExportVariableAssignments(node: VariableDeclaration | BindingElement) {
                if (node.kind === SyntaxKind.OmittedExpression) {
                    return;
                }
                let name = node.name;
                if (name.kind === SyntaxKind.Identifier) {
                    emitExportMemberAssignments(<Identifier>name);
                }
                else if (isBindingPattern(name)) {
                    forEach((<BindingPattern>name).elements, emitExportVariableAssignments);
                }
            }

            function getCombinedFlagsForIdentifier(node: Identifier): NodeFlags {
                if (!node.parent || (node.parent.kind !== SyntaxKind.VariableDeclaration && node.parent.kind !== SyntaxKind.BindingElement)) {
                    return 0;
                }

                return getCombinedNodeFlags(node.parent);
            }

            function renameNonTopLevelLetAndConst(node: Node): void {
                // do not rename if
                // - language version is ES6+
                // - node is synthesized
                // - node is not identifier (can happen when tree is malformed)
                // - node is definitely not name of variable declaration. 
                // it still can be part of parameter declaration, this check will be done next
                if (languageVersion >= ScriptTarget.ES6 ||
                    nodeIsSynthesized(node) ||
                    node.kind !== SyntaxKind.Identifier ||
                    (node.parent.kind !== SyntaxKind.VariableDeclaration && node.parent.kind !== SyntaxKind.BindingElement)) {
                    return;
                }

                let combinedFlags = getCombinedFlagsForIdentifier(<Identifier>node);
                if (((combinedFlags & NodeFlags.BlockScoped) === 0) || combinedFlags & NodeFlags.Export) {
                    // do not rename exported or non-block scoped variables
                    return;
                }

                // here it is known that node is a block scoped variable
                let list = getAncestor(node, SyntaxKind.VariableDeclarationList);
                if (list.parent.kind === SyntaxKind.VariableStatement) {
                    let isSourceFileLevelBinding = list.parent.parent.kind === SyntaxKind.SourceFile;
                    let isModuleLevelBinding = list.parent.parent.kind === SyntaxKind.ModuleBlock;
                    let isFunctionLevelBinding =
                        list.parent.parent.kind === SyntaxKind.Block && isFunctionLike(list.parent.parent.parent);
                    if (isSourceFileLevelBinding || isModuleLevelBinding || isFunctionLevelBinding) {
                        return;
                    }
                }

                let blockScopeContainer = getEnclosingBlockScopeContainer(node);
                let parent = blockScopeContainer.kind === SyntaxKind.SourceFile
                    ? blockScopeContainer
                    : blockScopeContainer.parent;

                var hasConflictsInEnclosingScope =
                    resolver.resolvesToSomeValue(parent, (<Identifier>node).text) ||
                    nameConflictsWithSomeTempVariable((<Identifier>node).text);

                if (hasConflictsInEnclosingScope) {
                    let variableId = resolver.getBlockScopedVariableId(<Identifier>node);
                    if (!blockScopedVariableToGeneratedName) {
                        blockScopedVariableToGeneratedName = [];
                    }

                    let generatedName = makeUniqueName((<Identifier>node).text);
                    blockScopedVariableToGeneratedName[variableId] = generatedName;
                }
            }

            function isES6ExportedDeclaration(node: Node) {
                return !!(node.flags & NodeFlags.Export) &&
                    languageVersion >= ScriptTarget.ES6 &&
                    node.parent.kind === SyntaxKind.SourceFile;
            }

            function emitVariableStatement(node: VariableStatement) {
                if (!(node.flags & NodeFlags.Export)) {
                    emitStartOfVariableDeclarationList(node.declarationList);
                }
                else if (isES6ExportedDeclaration(node)) {
                    // Exported ES6 module member
                    write("export ");
                    emitStartOfVariableDeclarationList(node.declarationList);
                }
                emitCommaList(node.declarationList.declarations);
                write(";");
                if (languageVersion < ScriptTarget.ES6 && node.parent === currentSourceFile) {
                    forEach(node.declarationList.declarations, emitExportVariableAssignments);
                }
            }

            function emitParameter(node: ParameterDeclaration) {
                if (languageVersion < ScriptTarget.ES6) {
                    if (isBindingPattern(node.name)) {
                        let name = createTempVariable(node);
                        if (!tempParameters) {
                            tempParameters = [];
                        }
                        tempParameters.push(name);
                        emit(name);
                    }
                    else {
                        emit(node.name);
                    }
                }
                else {
                    if (node.dotDotDotToken) {
                        write("...");
                    }
                    emit(node.name);
                    emitOptional(" = ", node.initializer);
                }
            }

            function emitDefaultValueAssignments(node: FunctionLikeDeclaration) {
                if (languageVersion < ScriptTarget.ES6) {
                    let tempIndex = 0;
                    forEach(node.parameters, p => {
                        if (isBindingPattern(p.name)) {
                            writeLine();
                            write("var ");
                            emitDestructuring(p, /*isAssignmentExpressionStatement*/ false, tempParameters[tempIndex]);
                            write(";");
                            tempIndex++;
                        }
                        else if (p.initializer) {
                            writeLine();
                            emitStart(p);
                            write("if (");
                            emitNodeWithoutSourceMap(p.name);
                            write(" === void 0)");
                            emitEnd(p);
                            write(" { ");
                            emitStart(p);
                            emitNodeWithoutSourceMap(p.name);
                            write(" = ");
                            emitNodeWithoutSourceMap(p.initializer);
                            emitEnd(p);
                            write("; }");
                        }
                    });
                }
            }

            function emitRestParameter(node: FunctionLikeDeclaration) {
                if (languageVersion < ScriptTarget.ES6 && hasRestParameters(node)) {
                    let restIndex = node.parameters.length - 1;
                    let restParam = node.parameters[restIndex];
                    let tempName = createTempVariable(node, TempVariableKind._i).text;
                    writeLine();
                    emitLeadingComments(restParam);
                    emitStart(restParam);
                    write("var ");
                    emitNodeWithoutSourceMap(restParam.name);
                    write(" = [];");
                    emitEnd(restParam);
                    emitTrailingComments(restParam);
                    writeLine();
                    write("for (");
                    emitStart(restParam);
                    write("var " + tempName + " = " + restIndex + ";");
                    emitEnd(restParam);
                    write(" ");
                    emitStart(restParam);
                    write(tempName + " < arguments.length;");
                    emitEnd(restParam);
                    write(" ");
                    emitStart(restParam);
                    write(tempName + "++");
                    emitEnd(restParam);
                    write(") {");
                    increaseIndent();
                    writeLine();
                    emitStart(restParam);
                    emitNodeWithoutSourceMap(restParam.name);
                    write("[" + tempName + " - " + restIndex + "] = arguments[" + tempName + "];");
                    emitEnd(restParam);
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }

            function emitAccessor(node: AccessorDeclaration) {
                write(node.kind === SyntaxKind.GetAccessor ? "get " : "set ");
                emit(node.name, /*allowGeneratedIdentifiers*/ false);
                emitSignatureAndBody(node);
            }

            function shouldEmitAsArrowFunction(node: FunctionLikeDeclaration): boolean {
                return node.kind === SyntaxKind.ArrowFunction && languageVersion >= ScriptTarget.ES6;
            }

            function emitDeclarationName(node: Declaration) {
                if (node.name) {
                    emitNodeWithoutSourceMap(node.name);
                }
                else {
                    write(getGeneratedNameForNode(node));
                }
            }

            function shouldEmitFunctionName(node: Declaration): boolean {
                // Emit a declaration name for the function iff:
                //    it is a function expression with a name provided
                //    it is a function declaration with a name provided
                //    it is a function declaration is not the default export, and is missing a name (emit a generated name for it)
                if (node.kind === SyntaxKind.FunctionExpression) {
                    return !!node.name;
                }
                else if (node.kind === SyntaxKind.FunctionDeclaration) {
                    return !!node.name || (languageVersion >= ScriptTarget.ES6 && !(node.flags & NodeFlags.Default));
                }
            }

            function emitFunctionDeclaration(node: FunctionLikeDeclaration) {
                if (nodeIsMissing(node.body)) {
                    return emitOnlyPinnedOrTripleSlashComments(node);
                }

                if (node.kind !== SyntaxKind.MethodDeclaration && node.kind !== SyntaxKind.MethodSignature) {
                    // Methods will emit the comments as part of emitting method declaration
                    emitLeadingComments(node);
                }

                // For targeting below es6, emit functions-like declaration including arrow function using function keyword.
                // When targeting ES6, emit arrow function natively in ES6 by omitting function keyword and using fat arrow instead
                if (!shouldEmitAsArrowFunction(node)) {
                    if (isES6ExportedDeclaration(node)) {
                        write("export ");
                        if (node.flags & NodeFlags.Default) {
                            write("default ");
                        }
                    }
                    write("function ");
                }

                if (shouldEmitFunctionName(node)) {
                    emitDeclarationName(node);
                }

                emitSignatureAndBody(node);
                if (languageVersion < ScriptTarget.ES6 && node.kind === SyntaxKind.FunctionDeclaration && node.parent === currentSourceFile && node.name) {
                    emitExportMemberAssignments((<FunctionDeclaration>node).name);
                }
                if (node.kind !== SyntaxKind.MethodDeclaration && node.kind !== SyntaxKind.MethodSignature) {
                    emitTrailingComments(node);
                }
            }

            function emitCaptureThisForNodeIfNecessary(node: Node): void {
                if (resolver.getNodeCheckFlags(node) & NodeCheckFlags.CaptureThis) {
                    writeLine();
                    emitStart(node);
                    write("var _this = this;");
                    emitEnd(node);
                }
            }

            function emitSignatureParameters(node: FunctionLikeDeclaration) {
                increaseIndent();
                write("(");
                if (node) {
                    let parameters = node.parameters;
                    let omitCount = languageVersion < ScriptTarget.ES6 && hasRestParameters(node) ? 1 : 0;
                    emitList(parameters, 0, parameters.length - omitCount, /*multiLine*/ false, /*trailingComma*/ false);
                }
                write(")");
                decreaseIndent();
            }

            function emitSignatureParametersForArrow(node: FunctionLikeDeclaration) {
                // Check whether the parameter list needs parentheses and preserve no-parenthesis
                if (node.parameters.length === 1 && node.pos === node.parameters[0].pos) {
                    emit(node.parameters[0]);
                    return;
                }
                emitSignatureParameters(node);
            }

            function emitSignatureAndBody(node: FunctionLikeDeclaration) {
                let saveTempCount = tempCount;
                let saveTempVariables = tempVariables;
                let saveTempParameters = tempParameters;
                let savePredefinedTempsInUse = predefinedTempsInUse;

                tempCount = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                predefinedTempsInUse = TempVariableKind.auto;

                // When targeting ES6, emit arrow function natively in ES6
                if (shouldEmitAsArrowFunction(node)) {
                    emitSignatureParametersForArrow(node);
                    write(" =>");
                }
                else {
                    emitSignatureParameters(node);
                }

                if (!node.body) {
                    // There can be no body when there are parse errors.  Just emit an empty block 
                    // in that case.
                    write(" { }");
                }
                else if (node.body.kind === SyntaxKind.Block) {
                    emitBlockFunctionBody(node, <Block>node.body);
                }
                else {
                    emitExpressionFunctionBody(node, <Expression>node.body);
                }

                if (!isES6ExportedDeclaration(node)) {
                    emitExportMemberAssignment(node);
                }

                predefinedTempsInUse = savePredefinedTempsInUse;
                tempCount = saveTempCount;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
            }

            // Returns true if any preamble code was emitted.
            function emitFunctionBodyPreamble(node: FunctionLikeDeclaration): void {
                emitCaptureThisForNodeIfNecessary(node);
                emitDefaultValueAssignments(node);
                emitRestParameter(node);
            }

            function emitExpressionFunctionBody(node: FunctionLikeDeclaration, body: Expression) {
                if (languageVersion < ScriptTarget.ES6) {
                    emitDownLevelExpressionFunctionBody(node, body);
                    return;
                }

                // For es6 and higher we can emit the expression as is.  However, in the case 
                // where the expression might end up looking like a block when emitted, we'll
                // also wrap it in parentheses first.  For example if you have: a => <foo>{}
                // then we need to generate: a => ({})
                write(" ");

                // Unwrap all type assertions.
                let current = body;
                while (current.kind === SyntaxKind.TypeAssertionExpression) {
                    current = (<TypeAssertion>current).expression;
                }

                emitParenthesizedIf(body, current.kind === SyntaxKind.ObjectLiteralExpression);
            }

            function emitDownLevelExpressionFunctionBody(node: FunctionLikeDeclaration, body: Expression) {
                write(" {");
                scopeEmitStart(node);

                increaseIndent();
                let outPos = writer.getTextPos();
                emitDetachedComments(node.body);
                emitFunctionBodyPreamble(node);
                let preambleEmitted = writer.getTextPos() !== outPos;
                decreaseIndent();

                // If we didn't have to emit any preamble code, then attempt to keep the arrow
                // function on one line.
                if (preserveNewLines && !preambleEmitted && nodeStartPositionsAreOnSameLine(node, body)) {
                    write(" ");
                    emitStart(body);
                    write("return ");
                    emit(body);
                    emitEnd(body);
                    write(";");
                    emitTempDeclarations(/*newLine*/ false);
                    write(" ");
                }
                else {
                    increaseIndent();
                    writeLine();
                    emitLeadingComments(node.body);
                    write("return ");
                    emit(body);
                    write(";");
                    emitTrailingComments(node.body);

                    emitTempDeclarations(/*newLine*/ true);
                    decreaseIndent();
                    writeLine();
                }

                emitStart(node.body);
                write("}");
                emitEnd(node.body);

                scopeEmitEnd();
            }

            function emitBlockFunctionBody(node: FunctionLikeDeclaration, body: Block) {
                write(" {");
                scopeEmitStart(node);

                let initialTextPos = writer.getTextPos();

                increaseIndent();
                emitDetachedComments(body.statements);

                // Emit all the directive prologues (like "use strict").  These have to come before
                // any other preamble code we write (like parameter initializers).
                let startIndex = emitDirectivePrologues(body.statements, /*startWithNewLine*/ true);
                emitFunctionBodyPreamble(node);
                decreaseIndent();

                let preambleEmitted = writer.getTextPos() !== initialTextPos;

                if (preserveNewLines && !preambleEmitted && nodeEndIsOnSameLineAsNodeStart(body, body)) {
                    for (let statement of body.statements) {
                        write(" ");
                        emit(statement);
                    }
                    emitTempDeclarations(/*newLine*/ false);
                    write(" ");
                    emitLeadingCommentsOfPosition(body.statements.end);
                }
                else {
                    increaseIndent();
                    emitLinesStartingAt(body.statements, startIndex);
                    emitTempDeclarations(/*newLine*/ true);

                    writeLine();
                    emitLeadingCommentsOfPosition(body.statements.end);
                    decreaseIndent();
                }

                emitToken(SyntaxKind.CloseBraceToken, body.statements.end);
                scopeEmitEnd();
            }

            function findInitialSuperCall(ctor: ConstructorDeclaration): ExpressionStatement {
                if (ctor.body) {
                    let statement = (<Block>ctor.body).statements[0];
                    if (statement && statement.kind === SyntaxKind.ExpressionStatement) {
                        let expr = (<ExpressionStatement>statement).expression;
                        if (expr && expr.kind === SyntaxKind.CallExpression) {
                            let func = (<CallExpression>expr).expression;
                            if (func && func.kind === SyntaxKind.SuperKeyword) {
                                return <ExpressionStatement>statement;
                            }
                        }
                    }
                }
            }

            function emitParameterPropertyAssignments(node: ConstructorDeclaration) {
                forEach(node.parameters, param => {
                    if (param.flags & NodeFlags.AccessibilityModifier) {
                        writeLine();
                        emitStart(param);
                        emitStart(param.name);
                        write("this.");
                        emitNodeWithoutSourceMap(param.name);
                        emitEnd(param.name);
                        write(" = ");
                        emit(param.name);
                        write(";");
                        emitEnd(param);
                    }
                });
            }

            function emitMemberAccessForPropertyName(memberName: DeclarationName) {
                // TODO: (jfreeman,drosen): comment on why this is emitNodeWithoutSourceMap instead of emit here.
                if (memberName.kind === SyntaxKind.StringLiteral || memberName.kind === SyntaxKind.NumericLiteral) {
                    write("[");
                    emitNodeWithoutSourceMap(memberName);
                    write("]");
                }
                else if (memberName.kind === SyntaxKind.ComputedPropertyName) {
                    emitComputedPropertyName(<ComputedPropertyName>memberName);
                }
                else {
                    write(".");
                    emitNodeWithoutSourceMap(memberName);
                }
            }

            function emitMemberAssignments(node: ClassDeclaration, staticFlag: NodeFlags) {
                forEach(node.members, member => {
                    if (member.kind === SyntaxKind.PropertyDeclaration && (member.flags & NodeFlags.Static) === staticFlag && (<PropertyDeclaration>member).initializer) {
                        writeLine();
                        emitLeadingComments(member);
                        emitStart(member);
                        emitStart((<PropertyDeclaration>member).name);
                        if (staticFlag) {
                            emitDeclarationName(node);
                        }
                        else {
                            write("this");
                        }
                        emitMemberAccessForPropertyName((<PropertyDeclaration>member).name);
                        emitEnd((<PropertyDeclaration>member).name);
                        write(" = ");
                        emit((<PropertyDeclaration>member).initializer);
                        write(";");
                        emitEnd(member);
                        emitTrailingComments(member);
                    }
                });
            }

            function emitMemberFunctionsForES5AndLower(node: ClassDeclaration) {
                forEach(node.members, member => {
                    if (member.kind === SyntaxKind.MethodDeclaration || node.kind === SyntaxKind.MethodSignature) {
                        if (!(<MethodDeclaration>member).body) {
                            return emitOnlyPinnedOrTripleSlashComments(member);
                        }

                        writeLine();
                        emitLeadingComments(member);
                        emitStart(member);
                        emitStart((<MethodDeclaration>member).name);
                        emitClassMemberPrefix(node, member);
                        emitMemberAccessForPropertyName((<MethodDeclaration>member).name);
                        emitEnd((<MethodDeclaration>member).name);
                        write(" = ");
                        emitStart(member);
                        emitFunctionDeclaration(<MethodDeclaration>member);
                        emitEnd(member);
                        emitEnd(member);
                        write(";");
                        emitTrailingComments(member);
                    }
                    else if (member.kind === SyntaxKind.GetAccessor || member.kind === SyntaxKind.SetAccessor) {
                        let accessors = getAllAccessorDeclarations(node.members, <AccessorDeclaration>member);
                        if (member === accessors.firstAccessor) {
                            writeLine();
                            emitStart(member);
                            write("Object.defineProperty(");
                            emitStart((<AccessorDeclaration>member).name);
                            emitClassMemberPrefix(node, member);
                            write(", ");
                            emitExpressionForPropertyName((<AccessorDeclaration>member).name);
                            emitEnd((<AccessorDeclaration>member).name);
                            write(", {");
                            increaseIndent();
                            if (accessors.getAccessor) {
                                writeLine();
                                emitLeadingComments(accessors.getAccessor);
                                write("get: ");
                                emitStart(accessors.getAccessor);
                                write("function ");
                                emitSignatureAndBody(accessors.getAccessor);
                                emitEnd(accessors.getAccessor);
                                emitTrailingComments(accessors.getAccessor);
                                write(",");
                            }
                            if (accessors.setAccessor) {
                                writeLine();
                                emitLeadingComments(accessors.setAccessor);
                                write("set: ");
                                emitStart(accessors.setAccessor);
                                write("function ");
                                emitSignatureAndBody(accessors.setAccessor);
                                emitEnd(accessors.setAccessor);
                                emitTrailingComments(accessors.setAccessor);
                                write(",");
                            }
                            writeLine();
                            write("enumerable: true,");
                            writeLine();
                            write("configurable: true");
                            decreaseIndent();
                            writeLine();
                            write("});");
                            emitEnd(member);
                        }
                    }
                });
            }

            function emitMemberFunctionsForES6AndHigher(node: ClassDeclaration) {
                for (let member of node.members) {
                    if ((member.kind === SyntaxKind.MethodDeclaration || node.kind === SyntaxKind.MethodSignature) && !(<MethodDeclaration>member).body) {
                        emitOnlyPinnedOrTripleSlashComments(member);
                    }
                    else if (member.kind === SyntaxKind.MethodDeclaration || node.kind === SyntaxKind.MethodSignature || member.kind === SyntaxKind.GetAccessor || member.kind === SyntaxKind.SetAccessor) {
                        writeLine();
                        emitLeadingComments(member);
                        emitStart(member);
                        if (member.flags & NodeFlags.Static) {
                            write("static ");
                        }

                        if (member.kind === SyntaxKind.GetAccessor) {
                            write("get ");
                        }
                        else if (member.kind === SyntaxKind.SetAccessor) {
                            write("set ");
                        }
                        emit((<MethodDeclaration>member).name);
                        emitSignatureAndBody(<MethodDeclaration>member);
                        emitEnd(member);
                        emitTrailingComments(member);
                    }
                }
            }

            function emitConstructor(node: ClassDeclaration, baseTypeNode: TypeReferenceNode) {
                let saveTempCount = tempCount;
                let saveTempVariables = tempVariables;
                let saveTempParameters = tempParameters;
                let savePredefinedTempsInUse = predefinedTempsInUse;
                tempCount = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                predefinedTempsInUse = TempVariableKind.auto;

                // Check if we have property assignment inside class declaration.
                // If there is property assignment, we need to emit constructor whether users define it or not
                // If there is no property assignment, we can omit constructor if users do not define it
                let hasInstancePropertyWithInitializer = false;

                // Emit the constructor overload pinned comments
                forEach(node.members, member => {
                    if (member.kind === SyntaxKind.Constructor && !(<ConstructorDeclaration>member).body) {
                        emitOnlyPinnedOrTripleSlashComments(member);
                    }
                    // Check if there is any non-static property assignment
                    if (member.kind === SyntaxKind.PropertyDeclaration && (<PropertyDeclaration>member).initializer && (member.flags & NodeFlags.Static) === 0) {
                        hasInstancePropertyWithInitializer = true;
                    }
                });

                let ctor = getFirstConstructorWithBody(node);

                // For target ES6 and above, if there is no user-defined constructor and there is no property assignment
                // do not emit constructor in class declaration.
                if (languageVersion >= ScriptTarget.ES6 && !ctor && !hasInstancePropertyWithInitializer) {
                    return;
                }

                if (ctor) {
                    emitLeadingComments(ctor);
                }
                emitStart(ctor || node);

                if (languageVersion < ScriptTarget.ES6) {
                    write("function ");
                    emitDeclarationName(node);
                    emitSignatureParameters(ctor);
                }
                else {
                    write("constructor");
                    if (ctor) {
                        emitSignatureParameters(ctor);
                    }
                    else {
                        // Based on EcmaScript6 section 14.5.14: Runtime Semantics: ClassDefinitionEvaluation.
                        // If constructor is empty, then,
                        //      If ClassHeritageopt is present, then
                        //          Let constructor be the result of parsing the String "constructor(... args){ super (...args);}" using the syntactic grammar with the goal symbol MethodDefinition.
                        //      Else,
                        //          Let constructor be the result of parsing the String "constructor( ){ }" using the syntactic grammar with the goal symbol MethodDefinition
                        if (baseTypeNode) {
                            write("(...args)");
                        }
                        else {
                            write("()");
                        }
                    }
                }

                write(" {");
                scopeEmitStart(node, "constructor");
                increaseIndent();
                if (ctor) {
                    emitDetachedComments(ctor.body.statements);
                }
                emitCaptureThisForNodeIfNecessary(node);
                if (ctor) {
                    emitDefaultValueAssignments(ctor);
                    emitRestParameter(ctor);
                    if (baseTypeNode) {
                        var superCall = findInitialSuperCall(ctor);
                        if (superCall) {
                            writeLine();
                            emit(superCall);
                        }
                    }
                    emitParameterPropertyAssignments(ctor);
                }
                else {
                    if (baseTypeNode) {
                        writeLine();
                        emitStart(baseTypeNode);
                        if (languageVersion < ScriptTarget.ES6) {
                            write("_super.apply(this, arguments);");
                        }
                        else {
                            write("super(...args);");
                        }
                        emitEnd(baseTypeNode);
                    }
                }
                emitMemberAssignments(node, /*staticFlag*/0);
                if (ctor) {
                    var statements: Node[] = (<Block>ctor.body).statements;
                    if (superCall) {
                        statements = statements.slice(1);
                    }
                    emitLines(statements);
                }
                emitTempDeclarations(/*newLine*/ true);
                writeLine();
                if (ctor) {
                    emitLeadingCommentsOfPosition((<Block>ctor.body).statements.end);
                }
                decreaseIndent();
                emitToken(SyntaxKind.CloseBraceToken, ctor ? (<Block>ctor.body).statements.end : node.members.end);
                scopeEmitEnd();
                emitEnd(<Node>ctor || node);
                if (ctor) {
                    emitTrailingComments(ctor);
                }

                predefinedTempsInUse = savePredefinedTempsInUse;
                tempCount = saveTempCount;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
            }

            function emitClassDeclaration(node: ClassDeclaration) {
                if (languageVersion < ScriptTarget.ES6) {
                    emitClassDeclarationBelowES6(<ClassDeclaration>node);
                }
                else {
                    emitClassDeclarationForES6AndHigher(<ClassDeclaration>node);
                }
            }
            
            function emitClassDeclarationForES6AndHigher(node: ClassDeclaration) {
<<<<<<< HEAD
                if (isES6ExportedDeclaration(node)) {
                    write("export ");
=======
                let thisNodeIsDecorated = nodeIsDecorated(node);
                if (thisNodeIsDecorated) {
                    // To preserve the correct runtime semantics when decorators are applied to the class,
                    // the emit needs to follow one of the following rules:
                    //
                    // * For a local class declaration:
                    //
                    //     @dec class C {
                    //     }
                    //
                    //   The emit should be:
                    //
                    //     let C = class {
                    //     };
                    //     Object.defineProperty(C, "name", { value: "C", configurable: true });
                    //     C = __decorate([dec], C);
                    //
                    // * For an exported class declaration:
                    //
                    //     @dec export class C {
                    //     }
                    //
                    //   The emit should be:
                    //
                    //     export let C = class {
                    //     };
                    //     Object.defineProperty(C, "name", { value: "C", configurable: true });
                    //     C = __decorate([dec], C);
                    //
                    // * For a default export of a class declaration with a name:
                    //
                    //     @dec default export class C {
                    //     }
                    //
                    //   The emit should be:
                    //
                    //     let C = class {
                    //     }
                    //     Object.defineProperty(C, "name", { value: "C", configurable: true });
                    //     C = __decorate([dec], C);
                    //     export default C;
                    //
                    // * For a default export of a class declaration without a name:
                    //
                    //     @dec default export class {
                    //     }
                    //
                    //   The emit should be:
                    //
                    //     let _default = class {
                    //     }
                    //     _default = __decorate([dec], _default);
                    //     export default _default;
                    //
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df

                    if (isES6ModuleMemberDeclaration(node) && !(node.flags & NodeFlags.Default)) {
                        write("export ");
                    }

                    write("let ");
                    emitDeclarationName(node);
                    write(" = ");
                }
                else if (isES6ModuleMemberDeclaration(node)) {                    
                    write("export ");
                    if (node.flags & NodeFlags.Default) {
                        write("default ");
                    }
                }
                
                write("class");
                
                // check if this is an "export default class" as it may not have a name. Do not emit the name if the class is decorated.
                if ((node.name || !(node.flags & NodeFlags.Default)) && !thisNodeIsDecorated) {
                    write(" ");
                    emitDeclarationName(node);
                }

                var baseTypeNode = getClassBaseTypeNode(node);
                if (baseTypeNode) {
                    write(" extends ");
                    emit(baseTypeNode.typeName);
                }

                write(" {");
                increaseIndent();
                scopeEmitStart(node);
                writeLine();
                emitConstructor(node, baseTypeNode);
                emitMemberFunctionsForES6AndHigher(node);
                decreaseIndent();
                writeLine();
                emitToken(SyntaxKind.CloseBraceToken, node.members.end);
                scopeEmitEnd();

                // For a decorated class, we need to assign its name (if it has one). This is because we emit
                // the class as a class expression to avoid the double-binding of the identifier:
                //
                //   let C = class {
                //   }
                //   Object.defineProperty(C, "name", { value: "C", configurable: true });
                //
                if (thisNodeIsDecorated) {
                    write(";");
                    if (node.name) {
                        writeLine();
                        write("Object.defineProperty(");
                        emitDeclarationName(node);
                        write(", \"name\", { value: \"");
                        emitDeclarationName(node);
                        write("\", configurable: true });");
                        writeLine();
                    }
                }

                // Emit static property assignment. Because classDeclaration is lexically evaluated,
                // it is safe to emit static property assignment after classDeclaration
                // From ES6 specification:
                //      HasLexicalDeclaration (N) : Determines if the argument identifier has a binding in this environment record that was created using
                //                                  a lexical declaration such as a LexicalDeclaration or a ClassDeclaration.
                writeLine();
                emitMemberAssignments(node, NodeFlags.Static);
                emitDecoratorsOfClass(node);

<<<<<<< HEAD
                // If this is an exported class, but not on the top level (i.e. on an internal
                // module), export it
                if (!isES6ExportedDeclaration(node) && (node.flags & NodeFlags.Export)) {
=======
                if (!isES6ModuleMemberDeclaration(node) && (node.flags & NodeFlags.Export)) {
                    // If this is an exported class, but not on the top level (i.e. on an internal
                    // module), export it
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
                    writeLine();
                    emitStart(node);
                    emitModuleMemberName(node);
                    write(" = ");
                    emitDeclarationName(node);
                    emitEnd(node);
                    write(";");
                }
                else if (isES6ModuleMemberDeclaration(node) && (node.flags & NodeFlags.Default) && thisNodeIsDecorated) {
                    // if this is a top level default export of decorated class, write the export after the declaration.
                    writeLine();
                    write("export default ");
                    emitDeclarationName(node);
                    write(";");
                }
            }

            function emitClassDeclarationBelowES6(node: ClassDeclaration) {
                write("var ");
                emitDeclarationName(node);
                write(" = (function (");
                let baseTypeNode = getClassBaseTypeNode(node);
                if (baseTypeNode) {
                    write("_super");
                }
                write(") {");
                let saveTempCount = tempCount;
                let saveTempVariables = tempVariables;
                let saveTempParameters = tempParameters;
                let saveComputedPropertyNamesToGeneratedNames = computedPropertyNamesToGeneratedNames;
                tempCount = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                computedPropertyNamesToGeneratedNames = undefined;
                increaseIndent();
                scopeEmitStart(node);
                if (baseTypeNode) {
                    writeLine();
                    emitStart(baseTypeNode);
                    write("__extends(");
                    emitDeclarationName(node);
                    write(", _super);");
                    emitEnd(baseTypeNode);
                }
                writeLine();
                emitConstructor(node, baseTypeNode);
                emitMemberFunctionsForES5AndLower(node);
                emitMemberAssignments(node, NodeFlags.Static);
                writeLine();
                emitDecoratorsOfClass(node);
                writeLine();
                emitToken(SyntaxKind.CloseBraceToken, node.members.end, () => {
                    write("return ");
                    emitDeclarationName(node);
                });
                write(";");
                emitTempDeclarations(/*newLine*/ true);
                tempCount = saveTempCount;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
                computedPropertyNamesToGeneratedNames = saveComputedPropertyNamesToGeneratedNames;
                decreaseIndent();
                writeLine();
                emitToken(SyntaxKind.CloseBraceToken, node.members.end);
                scopeEmitEnd();
                emitStart(node);
                write(")(");
                if (baseTypeNode) {
                    emit(baseTypeNode.typeName);
                }
                write(");");
                emitEnd(node);

                emitExportMemberAssignment(node);

                if (languageVersion < ScriptTarget.ES6 && node.parent === currentSourceFile && node.name) {
                    emitExportMemberAssignments(node.name);
                }
            }

            function emitClassMemberPrefix(node: ClassDeclaration, member: Node) {
                emitDeclarationName(node);
                if (!(member.flags & NodeFlags.Static)) {
                    write(".prototype");
                }
            }
            
            function emitDecoratorsOfClass(node: ClassDeclaration) {
                if (languageVersion < ScriptTarget.ES5) {
                    return;
                }

                emitDecoratorsOfMembers(node, /*staticFlag*/ 0);
                emitDecoratorsOfMembers(node, NodeFlags.Static);
                emitDecoratorsOfConstructor(node);
            }

            function emitDecoratorsOfConstructor(node: ClassDeclaration) {
                let constructor = getFirstConstructorWithBody(node);
                if (constructor) {
                    emitDecoratorsOfParameters(node, constructor);
                }

                if (!nodeIsDecorated(node)) {
                    return;
                }

                // Emit the call to __decorate. Given the class:
                //
                //   @dec
                //   class C {
                //   }
                //
                // The emit for the class is:
                //
                //   C = __decorate([dec], C);
                //

                writeLine();
                emitStart(node);
                emitDeclarationName(node);
                write(" = ");
                emitDecorateStart(node.decorators);
                emitDeclarationName(node);
                write(");");
                emitEnd(node);
                writeLine();
            }

            function emitDecoratorsOfMembers(node: ClassDeclaration, staticFlag: NodeFlags) {
                forEach(node.members, member => {
                    if ((member.flags & NodeFlags.Static) !== staticFlag) {
                        return;
                    }

                    let decorators: NodeArray<Decorator>;
                    switch (member.kind) {
                        case SyntaxKind.MethodDeclaration:
                            // emit decorators of the method's parameters
                            emitDecoratorsOfParameters(node, <MethodDeclaration>member);
                            decorators = member.decorators;
                            break;

                        case SyntaxKind.GetAccessor:
                        case SyntaxKind.SetAccessor:
                            let accessors = getAllAccessorDeclarations(node.members, <AccessorDeclaration>member);
                            if (member !== accessors.firstAccessor) {
                                // skip the second accessor as we processed it with the first.
                                return;
                            }

                            if (accessors.setAccessor) {
                                // emit decorators of the set accessor parameter
                                emitDecoratorsOfParameters(node, <AccessorDeclaration>accessors.setAccessor);
                            }

                            // get the decorators from the first decorated accessor.
                            decorators = accessors.firstAccessor.decorators;
                            if (!decorators && accessors.secondAccessor) {
                                decorators = accessors.secondAccessor.decorators;
                            }
                            break;

                        case SyntaxKind.PropertyDeclaration:
                            decorators = member.decorators;
                            break;

                        default:
                            // Constructor cannot be decorated, and its parameters are handled in emitDecoratorsOfConstructor
                            // Other members (i.e. IndexSignature) cannot be decorated.
                            return;
                    }

                    if (!decorators) {
                        return;
                    }

                    // Emit the call to __decorate. Given the following:
                    //
                    //   class C {
                    //     @dec method() {}
                    //     @dec get accessor() {}
                    //     @dec prop;
                    //   }
                    //
                    // The emit for a method is:
                    //
                    //   Object.defineProperty(C.prototype, "method", __decorate([dec], C.prototype, "method", Object.getOwnPropertyDescriptor(C.prototype, "method")));
                    // 
                    // The emit for an accessor is:
                    //
                    //   Object.defineProperty(C.prototype, "accessor", __decorate([dec], C.prototype, "accessor", Object.getOwnPropertyDescriptor(C.prototype, "accessor")));
                    //
                    // The emit for a property is:
                    //
                    //   __decorate([dec], C.prototype, "prop");
                    //

                    writeLine();
                    emitStart(member);
                    if (member.kind !== SyntaxKind.PropertyDeclaration) {
                        write("Object.defineProperty(");
                        emitStart(member.name);
                        emitClassMemberPrefix(node, member);
                        write(", ");
                        emitExpressionForPropertyName(member.name);
                        emitEnd(member.name);
                        write(", ");
                    }

                    emitDecorateStart(decorators);
                    emitStart(member.name);
                    emitClassMemberPrefix(node, member);
                    write(", ");
                    emitExpressionForPropertyName(member.name);
                    emitEnd(member.name);

                    if (member.kind !== SyntaxKind.PropertyDeclaration) {
                        write(", Object.getOwnPropertyDescriptor(");
                        emitStart(member.name);
                        emitClassMemberPrefix(node, member);
                        write(", ");
                        emitExpressionForPropertyName(member.name);
                        emitEnd(member.name);
                        write("))");
                    }

                    write(");");
                    emitEnd(member);
                    writeLine();
                });
            }
            
            function emitDecoratorsOfParameters(node: ClassDeclaration, member: FunctionLikeDeclaration) {
                forEach(member.parameters, (parameter, parameterIndex) => {
                    if (!nodeIsDecorated(parameter)) {
                        return;
                    }

                    // Emit the decorators for a parameter. Given the following:
                    //
                    //   class C {
                    //     constructor(@dec p) { }
                    //     method(@dec p) { }
                    //     set accessor(@dec value) { }
                    //   }
                    //
                    // The emit for a constructor is:
                    //
                    //   __decorate([dec], C, void 0, 0);
                    //
                    // The emit for a parameter is:
                    //
                    //   __decorate([dec], C.prototype, "method", 0);
                    //
                    // The emit for an accessor is:
                    //
                    //   __decorate([dec], C.prototype, "accessor", 0);
                    //

                    writeLine();
                    emitStart(parameter);
                    emitDecorateStart(parameter.decorators);
                    emitStart(parameter.name);

                    if (member.kind === SyntaxKind.Constructor) {
                        emitDeclarationName(node);
                        write(", void 0");
                    }
                    else {
                        emitClassMemberPrefix(node, member);
                        write(", ");
                        emitExpressionForPropertyName(member.name);
                    }

                    write(", ");
                    write(String(parameterIndex));
                    emitEnd(parameter.name);
                    write(");");
                    emitEnd(parameter);
                    writeLine();
                });
            }

            function emitDecorateStart(decorators: Decorator[]): void {
                write("__decorate([");
                let decoratorCount = decorators.length;
                for (let i = 0; i < decoratorCount; i++) {
                    if (i > 0) {
                        write(", ");
                    }
                    let decorator = decorators[i];
                    emitStart(decorator);
                    emit(decorator.expression);
                    emitEnd(decorator);
                }
                write("], ");
            }

            function emitInterfaceDeclaration(node: InterfaceDeclaration) {
                emitOnlyPinnedOrTripleSlashComments(node);
            }

            function shouldEmitEnumDeclaration(node: EnumDeclaration) {
                let isConstEnum = isConst(node);
                return !isConstEnum || compilerOptions.preserveConstEnums;
            }

            function emitEnumDeclaration(node: EnumDeclaration) {
                // const enums are completely erased during compilation.
                if (!shouldEmitEnumDeclaration(node)) {
                    return;
                }

                if (!(node.flags & NodeFlags.Export) || isES6ExportedDeclaration(node)) {
                    emitStart(node);
                    if (isES6ExportedDeclaration(node)) {
                        write("export ");
                    }
                    write("var ");
                    emit(node.name);
                    emitEnd(node);
                    write(";");
                }
                writeLine();
                emitStart(node);
                write("(function (");
                emitStart(node.name);
                write(getGeneratedNameForNode(node));
                emitEnd(node.name);
                write(") {");
                increaseIndent();
                scopeEmitStart(node);
                emitLines(node.members);
                decreaseIndent();
                writeLine();
                emitToken(SyntaxKind.CloseBraceToken, node.members.end);
                scopeEmitEnd();
                write(")(");
                emitModuleMemberName(node);
                write(" || (");
                emitModuleMemberName(node);
                write(" = {}));");
                emitEnd(node);
                if (!isES6ExportedDeclaration(node) && node.flags & NodeFlags.Export) {
                    writeLine();
                    emitStart(node);
                    write("var ");
                    emit(node.name);
                    write(" = ");
                    emitModuleMemberName(node);
                    emitEnd(node);
                    write(";");
                }
                if (languageVersion < ScriptTarget.ES6 && node.parent === currentSourceFile) {
                    emitExportMemberAssignments(node.name);
                }
            }

            function emitEnumMember(node: EnumMember) {
                let enumParent = <EnumDeclaration>node.parent;
                emitStart(node);
                write(getGeneratedNameForNode(enumParent));
                write("[");
                write(getGeneratedNameForNode(enumParent));
                write("[");
                emitExpressionForPropertyName(node.name);
                write("] = ");
                writeEnumMemberDeclarationValue(node);
                write("] = ");
                emitExpressionForPropertyName(node.name);
                emitEnd(node);
                write(";");
            }

            function writeEnumMemberDeclarationValue(member: EnumMember) {
                let value = resolver.getConstantValue(member);
                if (value !== undefined) {
                    write(value.toString());
                    return;
                }
                else if (member.initializer) {
                    emit(member.initializer);
                }
                else {
                    write("undefined");
                }
            }

            function getInnerMostModuleDeclarationFromDottedModule(moduleDeclaration: ModuleDeclaration): ModuleDeclaration {
                if (moduleDeclaration.body.kind === SyntaxKind.ModuleDeclaration) {
                    let recursiveInnerModule = getInnerMostModuleDeclarationFromDottedModule(<ModuleDeclaration>moduleDeclaration.body);
                    return recursiveInnerModule || <ModuleDeclaration>moduleDeclaration.body;
                }
            }

            function shouldEmitModuleDeclaration(node: ModuleDeclaration) {
                return isInstantiatedModule(node, compilerOptions.preserveConstEnums);
            }

            function emitModuleDeclaration(node: ModuleDeclaration) {
                // Emit only if this module is non-ambient.
                let shouldEmit = shouldEmitModuleDeclaration(node);

                if (!shouldEmit) {
                    return emitOnlyPinnedOrTripleSlashComments(node);
                }

                emitStart(node);
                if (isES6ExportedDeclaration(node)) {
                    write("export ");
                }
                write("var ");
                emit(node.name);
                write(";");
                emitEnd(node);
                writeLine();
                emitStart(node);
                write("(function (");
                emitStart(node.name);
                write(getGeneratedNameForNode(node));
                emitEnd(node.name);
                write(") ");
                if (node.body.kind === SyntaxKind.ModuleBlock) {
                    let saveTempCount = tempCount;
                    let saveTempVariables = tempVariables;
                    let savePredefinedTempsInUse = predefinedTempsInUse;
                    tempCount = 0;
                    tempVariables = undefined;
                    predefinedTempsInUse = TempVariableKind.auto;

                    emit(node.body);

                    predefinedTempsInUse = savePredefinedTempsInUse;
                    tempCount = saveTempCount;
                    tempVariables = saveTempVariables;
                }
                else {
                    write("{");
                    increaseIndent();
                    scopeEmitStart(node);
                    emitCaptureThisForNodeIfNecessary(node);
                    writeLine();
                    emit(node.body);
                    decreaseIndent();
                    writeLine();
                    let moduleBlock = <ModuleBlock>getInnerMostModuleDeclarationFromDottedModule(node).body;
                    emitToken(SyntaxKind.CloseBraceToken, moduleBlock.statements.end);
                    scopeEmitEnd();
                }
                write(")(");
                // write moduleDecl = containingModule.m only if it is not exported es6 module member
                if ((node.flags & NodeFlags.Export) && !isES6ExportedDeclaration(node)) {
                    emit(node.name);
                    write(" = ");
                }
                emitModuleMemberName(node);
                write(" || (");
                emitModuleMemberName(node);
                write(" = {}));");
                emitEnd(node);
                if (!isES6ExportedDeclaration(node) && node.name.kind === SyntaxKind.Identifier && node.parent === currentSourceFile) {
                    emitExportMemberAssignments(<Identifier>node.name);
                }
            }

            function emitRequire(moduleName: Expression) {
                if (moduleName.kind === SyntaxKind.StringLiteral) {
                    write("require(");
                    emitStart(moduleName);
                    emitLiteral(<LiteralExpression>moduleName);
                    emitEnd(moduleName);
                    emitToken(SyntaxKind.CloseParenToken, moduleName.end);
                }
                else {
                    write("require()");
                }
            }

            function getNamespaceDeclarationNode(node: ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration) {
                if (node.kind === SyntaxKind.ImportEqualsDeclaration) {
                    return <ImportEqualsDeclaration>node;
                }
                let importClause = (<ImportDeclaration>node).importClause;
                if (importClause && importClause.namedBindings && importClause.namedBindings.kind === SyntaxKind.NamespaceImport) {
                    return <NamespaceImport>importClause.namedBindings;
                }
            }

            function isDefaultImport(node: ImportDeclaration | ImportEqualsDeclaration | ExportDeclaration) {
                return node.kind === SyntaxKind.ImportDeclaration && (<ImportDeclaration>node).importClause && !!(<ImportDeclaration>node).importClause.name;
            }

            function emitExportImportAssignments(node: Node) {
                if (isAliasSymbolDeclaration(node) && resolver.isValueAliasDeclaration(node)) {
                    emitExportMemberAssignments(<Identifier>(<Declaration>node).name);
                }
                forEachChild(node, emitExportImportAssignments);
            }

            function emitImportDeclaration(node: ImportDeclaration) {
                if (languageVersion < ScriptTarget.ES6) {
                    return emitExternalImportDeclaration(node);
                }

                // ES6 import
                if (node.importClause) {
                    let shouldEmitDefaultBindings = resolver.isReferencedAliasDeclaration(node.importClause);
                    let shouldEmitNamedBindings = node.importClause.namedBindings && resolver.isReferencedAliasDeclaration(node.importClause.namedBindings, /* checkChildren */ true);
                    if (shouldEmitDefaultBindings || shouldEmitNamedBindings) {
                        write("import ");
                        emitStart(node.importClause);
                        if (shouldEmitDefaultBindings) {
                            emit(node.importClause.name);
                            if (shouldEmitNamedBindings) {
                                write(", ");
                            }
                        }
                        if (shouldEmitNamedBindings) {
                            emitLeadingComments(node.importClause.namedBindings);
                            emitStart(node.importClause.namedBindings);
                            if (node.importClause.namedBindings.kind === SyntaxKind.NamespaceImport) {
                                write("* as ");
                                emit((<NamespaceImport>node.importClause.namedBindings).name);
                            }
                            else {
                                write("{ ");
                                emitExportOrImportSpecifierList((<NamedImports>node.importClause.namedBindings).elements, resolver.isReferencedAliasDeclaration);
                                write(" }");
                            }
                            emitEnd(node.importClause.namedBindings);
                            emitTrailingComments(node.importClause.namedBindings);
                        }

                        emitEnd(node.importClause);
                        write(" from ");
                        emit(node.moduleSpecifier);
                        write(";");
                    }
                }
                else {
                    write("import ");
                    emit(node.moduleSpecifier);
                    write(";");
                }
            }

            function emitExternalImportDeclaration(node: ImportDeclaration | ImportEqualsDeclaration) {
                if (contains(externalImports, node)) {
                    let isExportedImport = node.kind === SyntaxKind.ImportEqualsDeclaration && (node.flags & NodeFlags.Export) !== 0;
                    let namespaceDeclaration = getNamespaceDeclarationNode(node);

                    if (compilerOptions.module !== ModuleKind.AMD) {
                        emitLeadingComments(node);
                        emitStart(node);
<<<<<<< HEAD
                        if (namespaceDeclaration && !isDefaultImport(node)) {
                            // import x = require("foo")
                            // import * as x from "foo"
                            if (!isExportedImport) write("var ");
                            emitModuleMemberName(namespaceDeclaration);
=======
                        let moduleName = getExternalModuleName(node);
                        if (declarationNode) {
                            if (!(declarationNode.flags & NodeFlags.Export)) write("var ");
                            emitModuleMemberName(declarationNode);
                            write(" = ");
                            emitRequire(moduleName);
                        }
                        else if (namedImports) {
                            write("var ");
                            write(getGeneratedNameForNode(<ImportDeclaration>node));
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
                            write(" = ");
                        }
                        else {
                            // import "foo"
                            // import x from "foo"
                            // import { x, y } from "foo"
                            // import d, * as x from "foo"
                            // import d, { x, y } from "foo"
                            let isNakedImport = SyntaxKind.ImportDeclaration && !(<ImportDeclaration>node).importClause;
                            if (!isNakedImport) {
                                write("var ");
                                write(resolver.getGeneratedNameForNode(<ImportDeclaration>node));
                                write(" = ");
                            }
                        }
                        emitRequire(getExternalModuleName(node));
                        if (namespaceDeclaration && isDefaultImport(node)) {
                            // import d, * as x from "foo"
                            write(", ");
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            write(resolver.getGeneratedNameForNode(<ImportDeclaration>node));
                        }
                        write(";");
                        emitEnd(node);
                        emitExportImportAssignments(node);
                        emitTrailingComments(node);
                    }
                    else {
                        if (isExportedImport) {
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            emit(namespaceDeclaration.name);
                            write(";");
                        }
                        else if (namespaceDeclaration && isDefaultImport(node)) {
                            // import d, * as x from "foo"
                            write("var ");
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            write(resolver.getGeneratedNameForNode(<ImportDeclaration>node));
                            write(";");
                        }
                        emitExportImportAssignments(node);
                    }
                }
            }

            function emitImportEqualsDeclaration(node: ImportEqualsDeclaration) {
                if (isExternalModuleImportEqualsDeclaration(node)) {
                    emitExternalImportDeclaration(node);
                    return;
                }
                // preserve old compiler's behavior: emit 'var' for import declaration (even if we do not consider them referenced) when
                // - current file is not external module
                // - import declaration is top level and target is value imported by entity name
                if (resolver.isReferencedAliasDeclaration(node) ||
                    (!isExternalModule(currentSourceFile) && resolver.isTopLevelValueImportEqualsWithEntityName(node))) {
                    emitLeadingComments(node);
                    emitStart(node);
                    if (isES6ExportedDeclaration(node)) {
                        write("export ");
                        write("var ");
                    }
                    else if (!(node.flags & NodeFlags.Export)) {
                        write("var ");
                    }
                    emitModuleMemberName(node);
                    write(" = ");
                    emit(node.moduleReference);
                    write(";");
                    emitEnd(node);
                    emitExportImportAssignments(node);
                    emitTrailingComments(node);
                }
            }

            function emitExportDeclaration(node: ExportDeclaration) {
                if (languageVersion < ScriptTarget.ES6) {
                    if (node.moduleSpecifier && (!node.exportClause || resolver.isValueAliasDeclaration(node))) {
                        emitStart(node);
<<<<<<< HEAD
                        let generatedName = resolver.getGeneratedNameForNode(node);
=======
                        let generatedName = getGeneratedNameForNode(node);
                        if (compilerOptions.module !== ModuleKind.AMD) {
                            write("var ");
                            write(generatedName);
                            write(" = ");
                            emitRequire(getExternalModuleName(node));
                        }
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
                        if (node.exportClause) {
                            // export { x, y, ... } from "foo"
                            if (compilerOptions.module !== ModuleKind.AMD) {
                                write("var ");
                                write(generatedName);
                                write(" = ");
                                emitRequire(getExternalModuleName(node));
                                write(";");
                            }
                            for (let specifier of node.exportClause.elements) {
                                if (resolver.isValueAliasDeclaration(specifier)) {
                                    writeLine();
                                    emitStart(specifier);
                                    emitContainingModuleName(specifier);
                                    write(".");
                                    emitNodeWithoutSourceMap(specifier.name);
                                    write(" = ");
                                    write(generatedName);
                                    write(".");
                                    emitNodeWithoutSourceMap(specifier.propertyName || specifier.name);
                                    write(";");
                                    emitEnd(specifier);
                                }
                            }
                        }
                        else {
                            // export * from "foo"
                            writeLine();
                            write("__export(");
                            if (compilerOptions.module !== ModuleKind.AMD) {
                                emitRequire(getExternalModuleName(node));
                            }
                            else {
                                write(generatedName);
                            }
                            write(");");
                        }
                        emitEnd(node);
                    }
                }
                else {
                    if (!node.exportClause || resolver.isValueAliasDeclaration(node)) {
                        emitStart(node);
                        write("export ");
                        if (node.exportClause) {
                            // export { x, y, ... }
                            write("{ ");
                            emitExportOrImportSpecifierList(node.exportClause.elements, resolver.isValueAliasDeclaration);
                            write(" }");
                        }
                        else {
                            write("*");
                        }
                        if (node.moduleSpecifier) {
                            write(" from ");
                            emitNodeWithoutSourceMap(node.moduleSpecifier);
                        }
                        write(";");
                        emitEnd(node);
                    }
                }
            }

            function emitExportOrImportSpecifierList(specifiers: ImportOrExportSpecifier[], shouldEmit: (node: Node) => boolean) {
                Debug.assert(languageVersion >= ScriptTarget.ES6);

                let needsComma = false;
                for (let specifier of specifiers) {
                    if (shouldEmit(specifier)) {
                        if (needsComma) {
                            write(", ");
                        }
                        emitStart(specifier);
                        if (specifier.propertyName) {
                            emitNodeWithoutSourceMap(specifier.propertyName);
                            write(" as ");
                        }
                        emitNodeWithoutSourceMap(specifier.name);
                        emitEnd(specifier);
                        needsComma = true;
                    }
                }
<<<<<<< HEAD
            }

            function emitExportAssignment(node: ExportAssignment) {
                if (!node.isExportEquals && resolver.isValueAliasDeclaration(node)) {
                    if (languageVersion >= ScriptTarget.ES6) {
                        writeLine();
                        emitStart(node);
                        write("export default ");
                        var expression = node.expression;
                        emit(expression);
                        if (expression.kind !== SyntaxKind.FunctionDeclaration &&
                            expression.kind !== SyntaxKind.ClassDeclaration) {
                            write(";");
=======
                else if (node.kind === SyntaxKind.ImportDeclaration) {
                    let importClause = (<ImportDeclaration>node).importClause;
                    if (importClause) {
                        if (importClause.name && resolver.isReferencedAliasDeclaration(importClause)) {
                            return {
                                rootNode: <ImportDeclaration>node,
                                declarationNode: importClause
                            };
                        }
                        if (hasReferencedNamedBindings(importClause)) {
                            if (importClause.namedBindings.kind === SyntaxKind.NamespaceImport) {
                                return {
                                    rootNode: <ImportDeclaration>node,
                                    declarationNode: <NamespaceImport>importClause.namedBindings
                                };
                            }
                            else {
                                return {
                                    rootNode: <ImportDeclaration>node,
                                    namedImports: <NamedImports>importClause.namedBindings,
                                    localName: getGeneratedNameForNode(<ImportDeclaration>node)
                                };
                            }
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
                        }
                        emitEnd(node);
                    }
                    else {
                        writeLine();
                        emitStart(node);
                        emitContainingModuleName(node);
                        write(".default = ");
                        emit(node.expression);
                        write(";");
                        emitEnd(node);
                    }
                }
            }

            function collectExternalModuleInfo(sourceFile: SourceFile) {
                externalImports = [];
                exportSpecifiers = {};
                exportEquals = undefined;
                hasExportStars = false;
                for (let node of sourceFile.statements) {
                    switch (node.kind) {
                        case SyntaxKind.ImportDeclaration:
                            if (!(<ImportDeclaration>node).importClause ||
                                resolver.isReferencedAliasDeclaration((<ImportDeclaration>node).importClause, /*checkChildren*/ true)) {
                                // import "mod"
                                // import x from "mod" where x is referenced
                                // import * as x from "mod" where x is referenced
                                // import { x, y } from "mod" where at least one import is referenced
                                externalImports.push(<ImportDeclaration>node);
                            }
                            break;
                        case SyntaxKind.ImportEqualsDeclaration:
                            if ((<ImportEqualsDeclaration>node).moduleReference.kind === SyntaxKind.ExternalModuleReference && resolver.isReferencedAliasDeclaration(node)) {
                                // import x = require("mod") where x is referenced
                                externalImports.push(<ImportEqualsDeclaration>node);
                            }
                            break;
                        case SyntaxKind.ExportDeclaration:
                            if ((<ExportDeclaration>node).moduleSpecifier) {
                                if (!(<ExportDeclaration>node).exportClause) {
                                    // export * from "mod"
                                    externalImports.push(<ExportDeclaration>node);
                                    hasExportStars = true;
                                }
                                else if (resolver.isValueAliasDeclaration(node)) {
                                    // export { x, y } from "mod" where at least one export is a value symbol
                                    externalImports.push(<ExportDeclaration>node);
                                }
                            }
                            else {
                                // export { x, y }
                                for (let specifier of (<ExportDeclaration>node).exportClause.elements) {
                                    let name = (specifier.propertyName || specifier.name).text;
                                    (exportSpecifiers[name] || (exportSpecifiers[name] = [])).push(specifier);
                                }
                            }
                            break;
                        case SyntaxKind.ExportAssignment:
                            if ((<ExportAssignment>node).isExportEquals && !exportEquals) {
                                // export = x
                                exportEquals = <ExportAssignment>node;
                            }
                            break;
                    }
                }
            }

            function sortAMDModules(amdModules: {name: string; path: string}[]) {
                // AMD modules with declared variable names go first
                return amdModules.sort((moduleA, moduleB) => {
                    if (moduleA.name === moduleB.name) {
                        return 0;
                    } else if (!moduleA.name) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
            }

            function emitExportStarHelper() {
                if (hasExportStars) {
                    writeLine();
                    write("function __export(m) {");
                    increaseIndent();
                    writeLine();
                    write("for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];");
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }

            function emitAMDModule(node: SourceFile, startIndex: number) {
                collectExternalModuleInfo(node);
                writeLine();
                write("define(");
                sortAMDModules(node.amdDependencies);
                if (node.amdModuleName) {
                    write("\"" + node.amdModuleName + "\", ");
                }
                write("[\"require\", \"exports\"");
                for (let importNode of externalImports) {
                    write(", ");
                    let moduleName = getExternalModuleName(importNode);
                    if (moduleName.kind === SyntaxKind.StringLiteral) {
                        emitLiteral(<LiteralExpression>moduleName);
                    }
                    else {
                        write("\"\"");
                    }
                }
                for (let amdDependency of node.amdDependencies) {
                    let text = "\"" + amdDependency.path + "\"";
                    write(", ");
                    write(text);
                }
                write("], function (require, exports");
                for (let importNode of externalImports) {
                    write(", ");
                    let namespaceDeclaration = getNamespaceDeclarationNode(importNode);
                    if (namespaceDeclaration && !isDefaultImport(importNode)) {
                        emit(namespaceDeclaration.name);
                    }
                    else {
<<<<<<< HEAD
                        write(resolver.getGeneratedNameForNode(<ImportDeclaration | ExportDeclaration>importNode));
=======
                        write(getGeneratedNameForNode(<ImportDeclaration | ExportDeclaration>info.rootNode));
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df
                    }
                }
                for (let amdDependency of node.amdDependencies) {
                    if (amdDependency.name) {
                        write(", ");
                        write(amdDependency.name);
                    }
                }
                write(") {");
                increaseIndent();
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(/*newLine*/ true);
                emitExportEquals(/*emitAsReturn*/ true);
                decreaseIndent();
                writeLine();
                write("});");
            }

            function emitCommonJSModule(node: SourceFile, startIndex: number) {
                collectExternalModuleInfo(node);
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(/*newLine*/ true);
                emitExportEquals(/*emitAsReturn*/ false);
            }

            function emitES6Module(node: SourceFile, startIndex: number) {
                externalImports = undefined;
                exportSpecifiers = undefined;
                exportEquals = undefined;
                hasExportStars = false;
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(/*newLine*/ true);
                // Emit exportDefault if it exists will happen as part 
                // or normal statement emit.
            }

            function emitExportEquals(emitAsReturn: boolean) {
                if (exportEquals && resolver.isValueAliasDeclaration(exportEquals)) {
                    writeLine();
                    emitStart(exportEquals);
                    write(emitAsReturn ? "return " : "module.exports = ");
                    emit((<ExportAssignment>exportEquals).expression);
                    write(";");
                    emitEnd(exportEquals);
                }
            }

            function emitDirectivePrologues(statements: Node[], startWithNewLine: boolean): number {
                for (let i = 0; i < statements.length; ++i) {
                    if (isPrologueDirective(statements[i])) {
                        if (startWithNewLine || i > 0) {
                            writeLine();
                        }
                        emit(statements[i]);
                    }
                    else {
                        // return index of the first non prologue directive
                        return i;
                    }
                }
                return statements.length;
            }

            function writeHelper(text: string): void {
                let lines = text.split(/\r\n|\r|\n/g);
                for (let i = 0; i < lines.length; ++i) {
                    let line = lines[i];
                    if (line.length) {
                        writeLine();
                        write(line);
                    }
                }
            }

            function emitSourceFileNode(node: SourceFile) {
                // Start new file on new line
                writeLine();
                emitDetachedComments(node);

                // emit prologue directives prior to __extends
                var startIndex = emitDirectivePrologues(node.statements, /*startWithNewLine*/ false);
                // Only Emit __extends function when target ES5.
                // For target ES6 and above, we can emit classDeclaration as if.
                if ((languageVersion < ScriptTarget.ES6) && (!extendsEmitted && resolver.getNodeCheckFlags(node) & NodeCheckFlags.EmitExtends)) {
                    writeLine();
                    write("var __extends = this.__extends || function (d, b) {");
                    increaseIndent();
                    writeLine();
                    write("for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];");
                    writeLine();
                    write("function __() { this.constructor = d; }");
                    writeLine();
                    write("__.prototype = b.prototype;");
                    writeLine();
                    write("d.prototype = new __();");
                    decreaseIndent();
                    writeLine();
                    write("};");
                    extendsEmitted = true;
                }
                if (!decorateEmitted && resolver.getNodeCheckFlags(node) & NodeCheckFlags.EmitDecorate) {
                    writeHelper(`
var __decorate = this.__decorate || function (decorators, target, key, value) {
    var kind = typeof (arguments.length == 2 ? value = target : value);
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        switch (kind) {
            case "function": value = decorator(value) || value; break;
            case "number": decorator(target, key, value); break;
            case "undefined": decorator(target, key); break;
            case "object": value = decorator(target, key, value) || value; break;
        }
    }
    return value;
};`);
                    decorateEmitted = true;
                }
                if (isExternalModule(node)) {
                    if (languageVersion >= ScriptTarget.ES6) {
                        emitES6Module(node, startIndex);
                    }
                    else if (compilerOptions.module === ModuleKind.AMD) {
                        emitAMDModule(node, startIndex);
                    }
                    else {
                        emitCommonJSModule(node, startIndex);
                    }
                }
                else {
                    externalImports = undefined;
                    exportSpecifiers = undefined;
                    exportEquals = undefined;
                    hasExportStars = false;
                    emitCaptureThisForNodeIfNecessary(node);
                    emitLinesStartingAt(node.statements, startIndex);
                    emitTempDeclarations(/*newLine*/ true);
                }

                emitLeadingComments(node.endOfFileToken);
            }

            function emitNodeWithoutSourceMap(node: Node, allowGeneratedIdentifiers?: boolean): void {
                if (!node) {
                    return;
                }

                if (node.flags & NodeFlags.Ambient) {
                    return emitOnlyPinnedOrTripleSlashComments(node);
                }

                let emitComments = shouldEmitLeadingAndTrailingComments(node);
                if (emitComments) {
                    emitLeadingComments(node);
                }

                emitJavaScriptWorker(node, allowGeneratedIdentifiers);

                if (emitComments) {
                    emitTrailingComments(node);
                }
            }

            function shouldEmitLeadingAndTrailingComments(node: Node) {
                switch (node.kind) {
                    // All of these entities are emitted in a specialized fashion.  As such, we allow
                    // the specialized methods for each to handle the comments on the nodes.
                    case SyntaxKind.InterfaceDeclaration:
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.ImportDeclaration:
                    case SyntaxKind.ImportEqualsDeclaration:
                    case SyntaxKind.TypeAliasDeclaration:
                    case SyntaxKind.ExportAssignment:
                        return false;

                    case SyntaxKind.ModuleDeclaration:
                        // Only emit the leading/trailing comments for a module if we're actually
                        // emitting the module as well.
                        return shouldEmitModuleDeclaration(<ModuleDeclaration>node);

                    case SyntaxKind.EnumDeclaration:
                        // Only emit the leading/trailing comments for an enum if we're actually
                        // emitting the module as well.
                        return shouldEmitEnumDeclaration(<EnumDeclaration>node);
                }

                // If this is the expression body of an arrow function that we're down-leveling, 
                // then we don't want to emit comments when we emit the body.  It will have already
                // been taken care of when we emitted the 'return' statement for the function
                // expression body.
                if (node.kind !== SyntaxKind.Block &&
                    node.parent &&
                    node.parent.kind === SyntaxKind.ArrowFunction &&
                    (<ArrowFunction>node.parent).body === node && 
                    compilerOptions.target <= ScriptTarget.ES5) {

                    return false;
                }

                // Emit comments for everything else.
                return true;
            }

            function emitJavaScriptWorker(node: Node, allowGeneratedIdentifiers: boolean = true) {
                // Check if the node can be emitted regardless of the ScriptTarget
                switch (node.kind) {
                    case SyntaxKind.Identifier:
                        return emitIdentifier(<Identifier>node, allowGeneratedIdentifiers);
                    case SyntaxKind.Parameter:
                        return emitParameter(<ParameterDeclaration>node);
                    case SyntaxKind.MethodDeclaration:
                    case SyntaxKind.MethodSignature:
                        return emitMethod(<MethodDeclaration>node);
                    case SyntaxKind.GetAccessor:
                    case SyntaxKind.SetAccessor:
                        return emitAccessor(<AccessorDeclaration>node);
                    case SyntaxKind.ThisKeyword:
                        return emitThis(node);
                    case SyntaxKind.SuperKeyword:
                        return emitSuper(node);
                    case SyntaxKind.NullKeyword:
                        return write("null");
                    case SyntaxKind.TrueKeyword:
                        return write("true");
                    case SyntaxKind.FalseKeyword:
                        return write("false");
                    case SyntaxKind.NumericLiteral:
                    case SyntaxKind.StringLiteral:
                    case SyntaxKind.RegularExpressionLiteral:
                    case SyntaxKind.NoSubstitutionTemplateLiteral:
                    case SyntaxKind.TemplateHead:
                    case SyntaxKind.TemplateMiddle:
                    case SyntaxKind.TemplateTail:
                        return emitLiteral(<LiteralExpression>node);
                    case SyntaxKind.TemplateExpression:
                        return emitTemplateExpression(<TemplateExpression>node);
                    case SyntaxKind.TemplateSpan:
                        return emitTemplateSpan(<TemplateSpan>node);
                    case SyntaxKind.QualifiedName:
                        return emitQualifiedName(<QualifiedName>node);
                    case SyntaxKind.ObjectBindingPattern:
                        return emitObjectBindingPattern(<BindingPattern>node);
                    case SyntaxKind.ArrayBindingPattern:
                        return emitArrayBindingPattern(<BindingPattern>node);
                    case SyntaxKind.BindingElement:
                        return emitBindingElement(<BindingElement>node);
                    case SyntaxKind.ArrayLiteralExpression:
                        return emitArrayLiteral(<ArrayLiteralExpression>node);
                    case SyntaxKind.ObjectLiteralExpression:
                        return emitObjectLiteral(<ObjectLiteralExpression>node);
                    case SyntaxKind.PropertyAssignment:
                        return emitPropertyAssignment(<PropertyDeclaration>node);
                    case SyntaxKind.ShorthandPropertyAssignment:
                        return emitShorthandPropertyAssignment(<ShorthandPropertyAssignment>node);
                    case SyntaxKind.ComputedPropertyName:
                        return emitComputedPropertyName(<ComputedPropertyName>node);
                    case SyntaxKind.PropertyAccessExpression:
                        return emitPropertyAccess(<PropertyAccessExpression>node);
                    case SyntaxKind.ElementAccessExpression:
                        return emitIndexedAccess(<ElementAccessExpression>node);
                    case SyntaxKind.CallExpression:
                        return emitCallExpression(<CallExpression>node);
                    case SyntaxKind.NewExpression:
                        return emitNewExpression(<NewExpression>node);
                    case SyntaxKind.TaggedTemplateExpression:
                        return emitTaggedTemplateExpression(<TaggedTemplateExpression>node);
                    case SyntaxKind.TypeAssertionExpression:
                        return emit((<TypeAssertion>node).expression);
                    case SyntaxKind.ParenthesizedExpression:
                        return emitParenExpression(<ParenthesizedExpression>node);
                    case SyntaxKind.FunctionDeclaration:
                    case SyntaxKind.FunctionExpression:
                    case SyntaxKind.ArrowFunction:
                        return emitFunctionDeclaration(<FunctionLikeDeclaration>node);
                    case SyntaxKind.DeleteExpression:
                        return emitDeleteExpression(<DeleteExpression>node);
                    case SyntaxKind.TypeOfExpression:
                        return emitTypeOfExpression(<TypeOfExpression>node);
                    case SyntaxKind.VoidExpression:
                        return emitVoidExpression(<VoidExpression>node);
                    case SyntaxKind.PrefixUnaryExpression:
                        return emitPrefixUnaryExpression(<PrefixUnaryExpression>node);
                    case SyntaxKind.PostfixUnaryExpression:
                        return emitPostfixUnaryExpression(<PostfixUnaryExpression>node);
                    case SyntaxKind.BinaryExpression:
                        return emitBinaryExpression(<BinaryExpression>node);
                    case SyntaxKind.ConditionalExpression:
                        return emitConditionalExpression(<ConditionalExpression>node);
                    case SyntaxKind.SpreadElementExpression:
                        return emitSpreadElementExpression(<SpreadElementExpression>node);
                    case SyntaxKind.OmittedExpression:
                        return;
                    case SyntaxKind.Block:
                    case SyntaxKind.ModuleBlock:
                        return emitBlock(<Block>node);
                    case SyntaxKind.VariableStatement:
                        return emitVariableStatement(<VariableStatement>node);
                    case SyntaxKind.EmptyStatement:
                        return write(";");
                    case SyntaxKind.ExpressionStatement:
                        return emitExpressionStatement(<ExpressionStatement>node);
                    case SyntaxKind.IfStatement:
                        return emitIfStatement(<IfStatement>node);
                    case SyntaxKind.DoStatement:
                        return emitDoStatement(<DoStatement>node);
                    case SyntaxKind.WhileStatement:
                        return emitWhileStatement(<WhileStatement>node);
                    case SyntaxKind.ForStatement:
                        return emitForStatement(<ForStatement>node);
                    case SyntaxKind.ForOfStatement:
                    case SyntaxKind.ForInStatement:
                        return emitForInOrForOfStatement(<ForInStatement>node);
                    case SyntaxKind.ContinueStatement:
                    case SyntaxKind.BreakStatement:
                        return emitBreakOrContinueStatement(<BreakOrContinueStatement>node);
                    case SyntaxKind.ReturnStatement:
                        return emitReturnStatement(<ReturnStatement>node);
                    case SyntaxKind.WithStatement:
                        return emitWithStatement(<WithStatement>node);
                    case SyntaxKind.SwitchStatement:
                        return emitSwitchStatement(<SwitchStatement>node);
                    case SyntaxKind.CaseClause:
                    case SyntaxKind.DefaultClause:
                        return emitCaseOrDefaultClause(<CaseOrDefaultClause>node);
                    case SyntaxKind.LabeledStatement:
                        return emitLabelledStatement(<LabeledStatement>node);
                    case SyntaxKind.ThrowStatement:
                        return emitThrowStatement(<ThrowStatement>node);
                    case SyntaxKind.TryStatement:
                        return emitTryStatement(<TryStatement>node);
                    case SyntaxKind.CatchClause:
                        return emitCatchClause(<CatchClause>node);
                    case SyntaxKind.DebuggerStatement:
                        return emitDebuggerStatement(node);
                    case SyntaxKind.VariableDeclaration:
                        return emitVariableDeclaration(<VariableDeclaration>node);
                    case SyntaxKind.ClassDeclaration:
                        return emitClassDeclaration(<ClassDeclaration>node);
                    case SyntaxKind.InterfaceDeclaration:
                        return emitInterfaceDeclaration(<InterfaceDeclaration>node);
                    case SyntaxKind.EnumDeclaration:
                        return emitEnumDeclaration(<EnumDeclaration>node);
                    case SyntaxKind.EnumMember:
                        return emitEnumMember(<EnumMember>node);
                    case SyntaxKind.ModuleDeclaration:
                        return emitModuleDeclaration(<ModuleDeclaration>node);
                    case SyntaxKind.ImportDeclaration:
                        return emitImportDeclaration(<ImportDeclaration>node);
                    case SyntaxKind.ImportEqualsDeclaration:
                        return emitImportEqualsDeclaration(<ImportEqualsDeclaration>node);
                    case SyntaxKind.ExportDeclaration:
                        return emitExportDeclaration(<ExportDeclaration>node);
                    case SyntaxKind.ExportAssignment:
                        return emitExportAssignment(<ExportAssignment>node);
                    case SyntaxKind.SourceFile:
                        return emitSourceFileNode(<SourceFile>node);
                }
            }

            function hasDetachedComments(pos: number) {
                return detachedCommentsInfo !== undefined && detachedCommentsInfo[detachedCommentsInfo.length - 1].nodePos === pos;
            }

            function getLeadingCommentsWithoutDetachedComments() {
                // get the leading comments from detachedPos
                let leadingComments = getLeadingCommentRanges(currentSourceFile.text,
                    detachedCommentsInfo[detachedCommentsInfo.length - 1].detachedCommentEndPos);
                if (detachedCommentsInfo.length - 1) {
                    detachedCommentsInfo.pop();
                }
                else {
                    detachedCommentsInfo = undefined;
                }

                return leadingComments;
            }

            function filterComments(ranges: CommentRange[], onlyPinnedOrTripleSlashComments: boolean): CommentRange[] {
                // If we're removing comments, then we want to strip out all but the pinned or
                // triple slash comments.
                if (ranges && onlyPinnedOrTripleSlashComments) {
                    ranges = filter(ranges, isPinnedOrTripleSlashComment);
                    if (ranges.length === 0) {
                        return undefined;
                    }
                }

                return ranges;
            }

            function getLeadingCommentsToEmit(node: Node) {
                // Emit the leading comments only if the parent's pos doesn't match because parent should take care of emitting these comments
                if (node.parent) {
                    if (node.parent.kind === SyntaxKind.SourceFile || node.pos !== node.parent.pos) {
                        if (hasDetachedComments(node.pos)) {
                            // get comments without detached comments
                            return getLeadingCommentsWithoutDetachedComments();
                        }
                        else {
                            // get the leading comments from the node
                            return getLeadingCommentRangesOfNode(node, currentSourceFile);
                        }
                    }
                }
            }

            function getTrailingCommentsToEmit(node: Node) {
                // Emit the trailing comments only if the parent's pos doesn't match because parent should take care of emitting these comments
                if (node.parent) {
                    if (node.parent.kind === SyntaxKind.SourceFile || node.end !== node.parent.end) {
                        return getTrailingCommentRanges(currentSourceFile.text, node.end);
                    }
                }
            }

            function emitOnlyPinnedOrTripleSlashComments(node: Node) {
                emitLeadingCommentsWorker(node, /*onlyPinnedOrTripleSlashComments:*/ true);
            }

            function emitLeadingComments(node: Node) {
                return emitLeadingCommentsWorker(node, /*onlyPinnedOrTripleSlashComments:*/ compilerOptions.removeComments);
            }

            function emitLeadingCommentsWorker(node: Node, onlyPinnedOrTripleSlashComments: boolean) {
                // If the caller only wants pinned or triple slash comments, then always filter
                // down to that set.  Otherwise, filter based on the current compiler options.
                let leadingComments = filterComments(getLeadingCommentsToEmit(node), onlyPinnedOrTripleSlashComments);

                emitNewLineBeforeLeadingComments(currentSourceFile, writer, node, leadingComments);

                // Leading comments are emitted at /*leading comment1 */space/*leading comment*/space
                emitComments(currentSourceFile, writer, leadingComments, /*trailingSeparator*/ true, newLine, writeComment);
            }

            function emitTrailingComments(node: Node) {
                // Emit the trailing comments only if the parent's end doesn't match
                var trailingComments = filterComments(getTrailingCommentsToEmit(node), /*onlyPinnedOrTripleSlashComments:*/ compilerOptions.removeComments);

                // trailing comments are emitted at space/*trailing comment1 */space/*trailing comment*/
                emitComments(currentSourceFile, writer, trailingComments, /*trailingSeparator*/ false, newLine, writeComment);
            }

            function emitLeadingCommentsOfPosition(pos: number) {
                let leadingComments: CommentRange[];
                if (hasDetachedComments(pos)) {
                    // get comments without detached comments
                    leadingComments = getLeadingCommentsWithoutDetachedComments();
                }
                else {
                    // get the leading comments from the node
                    leadingComments = getLeadingCommentRanges(currentSourceFile.text, pos);
                }

                leadingComments = filterComments(leadingComments, compilerOptions.removeComments);
                emitNewLineBeforeLeadingComments(currentSourceFile, writer, { pos: pos, end: pos }, leadingComments);

                // Leading comments are emitted at /*leading comment1 */space/*leading comment*/space
                emitComments(currentSourceFile, writer, leadingComments, /*trailingSeparator*/ true, newLine, writeComment);
            }

            function emitDetachedComments(node: TextRange) {
                let leadingComments = getLeadingCommentRanges(currentSourceFile.text, node.pos);
                if (leadingComments) {
                    let detachedComments: CommentRange[] = [];
                    let lastComment: CommentRange;

                    forEach(leadingComments, comment => {
                        if (lastComment) {
                            let lastCommentLine = getLineOfLocalPosition(currentSourceFile, lastComment.end);
                            let commentLine = getLineOfLocalPosition(currentSourceFile, comment.pos);

                            if (commentLine >= lastCommentLine + 2) {
                                // There was a blank line between the last comment and this comment.  This
                                // comment is not part of the copyright comments.  Return what we have so
                                // far.
                                return detachedComments;
                            }
                        }

                        detachedComments.push(comment);
                        lastComment = comment;
                    });

                    if (detachedComments.length) {
                        // All comments look like they could have been part of the copyright header.  Make
                        // sure there is at least one blank line between it and the node.  If not, it's not
                        // a copyright header.
                        let lastCommentLine = getLineOfLocalPosition(currentSourceFile, detachedComments[detachedComments.length - 1].end);
                        let nodeLine = getLineOfLocalPosition(currentSourceFile, skipTrivia(currentSourceFile.text, node.pos));
                        if (nodeLine >= lastCommentLine + 2) {
                            // Valid detachedComments
                            emitNewLineBeforeLeadingComments(currentSourceFile, writer, node, leadingComments);
                            emitComments(currentSourceFile, writer, detachedComments, /*trailingSeparator*/ true, newLine, writeComment);
                            let currentDetachedCommentInfo = { nodePos: node.pos, detachedCommentEndPos: detachedComments[detachedComments.length - 1].end };
                            if (detachedCommentsInfo) {
                                detachedCommentsInfo.push(currentDetachedCommentInfo);
                            }
                            else {
                                detachedCommentsInfo = [currentDetachedCommentInfo];
                            }
                        }
                    }
                }
            }

            function isPinnedOrTripleSlashComment(comment: CommentRange) {
                if (currentSourceFile.text.charCodeAt(comment.pos + 1) === CharacterCodes.asterisk) {
                    return currentSourceFile.text.charCodeAt(comment.pos + 2) === CharacterCodes.exclamation;
                }
                // Verify this is /// comment, but do the regexp match only when we first can find /// in the comment text
                // so that we don't end up computing comment string and doing match for all // comments
                else if (currentSourceFile.text.charCodeAt(comment.pos + 1) === CharacterCodes.slash &&
                    comment.pos + 2 < comment.end &&
                    currentSourceFile.text.charCodeAt(comment.pos + 2) === CharacterCodes.slash &&
                    currentSourceFile.text.substring(comment.pos, comment.end).match(fullTripleSlashReferencePathRegEx)) {
                    return true;
                }
            }
        }

        function emitFile(jsFilePath: string, sourceFile?: SourceFile) {
            emitJavaScript(jsFilePath, sourceFile);

            if (compilerOptions.declaration) {
                writeDeclarationFile(jsFilePath, sourceFile, host, resolver, diagnostics);
            }
        }
    }
}
