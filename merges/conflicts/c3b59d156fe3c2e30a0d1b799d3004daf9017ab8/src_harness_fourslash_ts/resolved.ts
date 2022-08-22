//
// Copyright (c) Microsoft Corporation.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

/// <reference path="..\services\services.ts" />
/// <reference path="..\services\shims.ts" />
/// <reference path="harnessLanguageService.ts" />
/// <reference path="harness.ts" />
/// <reference path="fourslashRunner.ts" />
/* tslint:disable:no-null */

namespace FourSlash {
    ts.disableIncrementalParsing = false;

    // Represents a parsed source file with metadata
    export interface FourSlashFile {
        // The contents of the file (with markers, etc stripped out)
        content: string;
        fileName: string;
        version: number;
        // File-specific options (name/value pairs)
        fileOptions: Harness.TestCaseParser.CompilerSettings;
    }

    // Represents a set of parsed source files and options
    export interface FourSlashData {
        // Global options (name/value pairs)
        globalOptions: Harness.TestCaseParser.CompilerSettings;

        files: FourSlashFile[];

        // A mapping from marker names to name/position pairs
        markerPositions: { [index: string]: Marker; };

        markers: Marker[];

        ranges: Range[];
    }

    interface MemberListData {
        result: {
            maybeInaccurate: boolean;
            isMemberCompletion: boolean;
            entries: {
                name: string;
                type: string;
                kind: string;
                kindModifiers: string;
            }[];
        };
    }

    export interface Marker {
        fileName: string;
        position: number;
        data?: any;
    }

    interface MarkerMap {
        [index: string]: Marker;
    }

    export interface Range {
        fileName: string;
        start: number;
        end: number;
        marker?: Marker;
    }

    interface LocationInformation {
        position: number;
        sourcePosition: number;
        sourceLine: number;
        sourceColumn: number;
    }

    interface RangeLocationInformation extends LocationInformation {
        marker?: Marker;
    }

    export interface TextSpan {
        start: number;
        end: number;
    }

    export import IndentStyle = ts.IndentStyle;

    const entityMap: ts.Map<string> = {
        "&": "&amp;",
        "\"": "&quot;",
        "'": "&#39;",
        "/": "&#47;",
        "<": "&lt;",
        ">": "&gt;"
    };

    export function escapeXmlAttributeValue(s: string) {
        return s.replace(/[&<>"'\/]/g, ch => entityMap[ch]);
    }

    // Name of testcase metadata including ts.CompilerOptions properties that will be used by globalOptions
    // To add additional option, add property into the testOptMetadataNames, refer the property in either globalMetadataNames or fileMetadataNames
    // Add cases into convertGlobalOptionsToCompilationsSettings function for the compiler to acknowledge such option from meta data
    const metadataOptionNames = {
        baselineFile: "BaselineFile",
        emitThisFile: "emitThisFile",  // This flag is used for testing getEmitOutput feature. It allows test-cases to indicate what file to be output in multiple files project
        fileName: "Filename",
        resolveReference: "ResolveReference",  // This flag is used to specify entry file for resolve file references. The flag is only allow once per test file
    };

    // List of allowed metadata names
    const fileMetadataNames = [metadataOptionNames.fileName, metadataOptionNames.emitThisFile, metadataOptionNames.resolveReference];

    function convertGlobalOptionsToCompilerOptions(globalOptions: Harness.TestCaseParser.CompilerSettings): ts.CompilerOptions {
        const settings: ts.CompilerOptions = { target: ts.ScriptTarget.ES5 };
        Harness.Compiler.setCompilerOptionsFromHarnessSetting(globalOptions, settings);
        return settings;
    }

    export class TestCancellationToken implements ts.HostCancellationToken {
        // 0 - cancelled
        // >0 - not cancelled
        // <0 - not cancelled and value denotes number of isCancellationRequested after which token become cancelled
        private static NotCanceled: number = -1;
        private numberOfCallsBeforeCancellation: number = TestCancellationToken.NotCanceled;

        public isCancellationRequested(): boolean {
            if (this.numberOfCallsBeforeCancellation < 0) {
                return false;
            }

            if (this.numberOfCallsBeforeCancellation > 0) {
                this.numberOfCallsBeforeCancellation--;
                return false;
            }

            return true;
        }

        public setCancelled(numberOfCalls = 0): void {
            ts.Debug.assert(numberOfCalls >= 0);
            this.numberOfCallsBeforeCancellation = numberOfCalls;
        }

        public resetCancelled(): void {
            this.numberOfCallsBeforeCancellation = TestCancellationToken.NotCanceled;
        }
    }

    export function verifyOperationIsCancelled(f: () => void) {
        try {
            f();
        }
        catch (e) {
            if (e instanceof ts.OperationCanceledException) {
                return;
            }
        }

        throw new Error("Operation should be cancelled");
    }

    // This function creates IScriptSnapshot object for testing getPreProcessedFileInfo
    // Return object may lack some functionalities for other purposes.
    function createScriptSnapShot(sourceText: string): ts.IScriptSnapshot {
        return {
            getText: (start: number, end: number) => {
                return sourceText.substr(start, end - start);
            },
            getLength: () => {
                return sourceText.length;
            },
            getChangeRange: (oldSnapshot: ts.IScriptSnapshot) => {
                return <ts.TextChangeRange>undefined;
            }
        };
    }

    export class TestState {
        // Language service instance
        private languageServiceAdapterHost: Harness.LanguageService.LanguageServiceAdapterHost;
        private languageService: ts.LanguageService;
        private cancellationToken: TestCancellationToken;

        // The current caret position in the active file
        public currentCaretPosition = 0;
        public lastKnownMarker: string = "";

        // The file that's currently 'opened'
        public activeFile: FourSlashFile = null;

        // Whether or not we should format on keystrokes
        public enableFormatting = true;

        public formatCodeOptions: ts.FormatCodeOptions;

        private inputFiles: ts.Map<string> = {};  // Map between inputFile's fileName and its content for easily looking up when resolving references

        // Add input file which has matched file name with the given reference-file path.
        // This is necessary when resolveReference flag is specified
        private addMatchedInputFile(referenceFilePath: string, extensions: string[]) {
            const inputFiles = this.inputFiles;
            const languageServiceAdapterHost = this.languageServiceAdapterHost;
            if (!extensions) {
                tryAdd(referenceFilePath);
            }
            else {
                tryAdd(referenceFilePath) || ts.forEach(extensions, ext => tryAdd(referenceFilePath + ext));
            }

            function tryAdd(path: string) {
                const inputFile = inputFiles[path];
                if (inputFile && !Harness.isLibraryFile(path)) {
                    languageServiceAdapterHost.addScript(path, inputFile);
                    return true;
                }
            }
        }

        private getLanguageServiceAdapter(testType: FourSlashTestType, cancellationToken: TestCancellationToken, compilationOptions: ts.CompilerOptions): Harness.LanguageService.LanguageServiceAdapter {
            switch (testType) {
                case FourSlashTestType.Native:
                    return new Harness.LanguageService.NativeLanugageServiceAdapter(cancellationToken, compilationOptions);
                case FourSlashTestType.Shims:
                    return new Harness.LanguageService.ShimLanugageServiceAdapter(/*preprocessToResolve*/ false, cancellationToken, compilationOptions);
                case FourSlashTestType.ShimsWithPreprocess:
                    return new Harness.LanguageService.ShimLanugageServiceAdapter(/*preprocessToResolve*/ true, cancellationToken, compilationOptions);
                case FourSlashTestType.Server:
                    return new Harness.LanguageService.ServerLanugageServiceAdapter(cancellationToken, compilationOptions);
                default:
                    throw new Error("Unknown FourSlash test type: ");
            }
        }

        constructor(private basePath: string, private testType: FourSlashTestType, public testData: FourSlashData) {
            // Create a new Services Adapter
            this.cancellationToken = new TestCancellationToken();
            const compilationOptions = convertGlobalOptionsToCompilerOptions(this.testData.globalOptions);
            const languageServiceAdapter = this.getLanguageServiceAdapter(testType, this.cancellationToken, compilationOptions);
            this.languageServiceAdapterHost = languageServiceAdapter.getHost();
            this.languageService = languageServiceAdapter.getLanguageService();

            // Initialize the language service with all the scripts
            let startResolveFileRef: FourSlashFile;

            ts.forEach(testData.files, file => {
                // Create map between fileName and its content for easily looking up when resolveReference flag is specified
                this.inputFiles[file.fileName] = file.content;
                if (!startResolveFileRef && file.fileOptions[metadataOptionNames.resolveReference] === "true") {
                    startResolveFileRef = file;
                }
                else if (startResolveFileRef) {
                    // If entry point for resolving file references is already specified, report duplication error
                    throw new Error("There exists a Fourslash file which has resolveReference flag specified; remove duplicated resolveReference flag");
                }
            });

            if (startResolveFileRef) {
                // Add the entry-point file itself into the languageServiceShimHost
                this.languageServiceAdapterHost.addScript(startResolveFileRef.fileName, startResolveFileRef.content);

                const resolvedResult = languageServiceAdapter.getPreProcessedFileInfo(startResolveFileRef.fileName, startResolveFileRef.content);
                const referencedFiles: ts.FileReference[] = resolvedResult.referencedFiles;
                const importedFiles: ts.FileReference[] = resolvedResult.importedFiles;

                // Add triple reference files into language-service host
                ts.forEach(referencedFiles, referenceFile => {
                    // Fourslash insert tests/cases/fourslash into inputFile.unitName so we will properly append the same base directory to refFile path
                    const referenceFilePath = this.basePath + "/" + referenceFile.fileName;
                    this.addMatchedInputFile(referenceFilePath, /* extensions */ undefined);
                });

                // Add import files into language-service host
                ts.forEach(importedFiles, importedFile => {
                    // Fourslash insert tests/cases/fourslash into inputFile.unitName and import statement doesn't require ".ts"
                    // so convert them before making appropriate comparison
                    const importedFilePath = this.basePath + "/" + importedFile.fileName;
                    this.addMatchedInputFile(importedFilePath, ts.getSupportedExtensions(compilationOptions));
                });

                // Check if no-default-lib flag is false and if so add default library
                if (!resolvedResult.isLibFile) {
                    this.languageServiceAdapterHost.addScript(Harness.Compiler.defaultLibFileName, Harness.Compiler.defaultLibSourceFile.text);
                }
            }
            else {
                // resolveReference file-option is not specified then do not resolve any files and include all inputFiles
                ts.forEachKey(this.inputFiles, fileName => {
                    if (!Harness.isLibraryFile(fileName)) {
                        this.languageServiceAdapterHost.addScript(fileName, this.inputFiles[fileName]);
                    }
                });
                this.languageServiceAdapterHost.addScript(Harness.Compiler.defaultLibFileName, Harness.Compiler.defaultLibSourceFile.text);
            }

            this.formatCodeOptions = {
                IndentSize: 4,
                TabSize: 4,
                NewLineCharacter: Harness.IO.newLine(),
                ConvertTabsToSpaces: true,
                IndentStyle: ts.IndentStyle.Smart,
                InsertSpaceAfterCommaDelimiter: true,
                InsertSpaceAfterSemicolonInForStatements: true,
                InsertSpaceBeforeAndAfterBinaryOperators: true,
                InsertSpaceAfterKeywordsInControlFlowStatements: true,
                InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
                InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
                InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
                PlaceOpenBraceOnNewLineForFunctions: false,
                PlaceOpenBraceOnNewLineForControlBlocks: false,
            };

            this.testData.files.forEach(file => {
                const fileName = file.fileName.replace(Harness.IO.directoryName(file.fileName), "").substr(1);
                const fileNameWithoutExtension = fileName.substr(0, fileName.lastIndexOf("."));
            });

            // Open the first file by default
            this.openFile(0);
        }

        private getFileContent(fileName: string): string {
            const script = this.languageServiceAdapterHost.getScriptInfo(fileName);
            return script.content;
        }

        // Entry points from fourslash.ts
        public goToMarker(name = "") {
            const marker = this.getMarkerByName(name);
            if (this.activeFile.fileName !== marker.fileName) {
                this.openFile(marker.fileName);
            }

            const content = this.getFileContent(marker.fileName);
            if (marker.position === -1 || marker.position > content.length) {
                throw new Error(`Marker "${name}" has been invalidated by unrecoverable edits to the file.`);
            }
            this.lastKnownMarker = name;
            this.goToPosition(marker.position);
        }

        public goToPosition(pos: number) {
            this.currentCaretPosition = pos;
        }

        public moveCaretRight(count = 1) {
            this.currentCaretPosition += count;
            this.currentCaretPosition = Math.min(this.currentCaretPosition, this.getFileContent(this.activeFile.fileName).length);
        }

        // Opens a file given its 0-based index or fileName
        public openFile(index: number, content?: string): void;
        public openFile(name: string, content?: string): void;
        public openFile(indexOrName: any, content?: string) {
            const fileToOpen: FourSlashFile = this.findFile(indexOrName);
            fileToOpen.fileName = ts.normalizeSlashes(fileToOpen.fileName);
            this.activeFile = fileToOpen;
            // Let the host know that this file is now open
            this.languageServiceAdapterHost.openFile(fileToOpen.fileName, content);
        }

        public verifyErrorExistsBetweenMarkers(startMarkerName: string, endMarkerName: string, negative: boolean) {
            const startMarker = this.getMarkerByName(startMarkerName);
            const endMarker = this.getMarkerByName(endMarkerName);
            const predicate = function (errorMinChar: number, errorLimChar: number, startPos: number, endPos: number) {
                return ((errorMinChar === startPos) && (errorLimChar === endPos)) ? true : false;
            };

            const exists = this.anyErrorInRange(predicate, startMarker, endMarker);

            if (exists !== negative) {
                this.printErrorLog(negative, this.getAllDiagnostics());
                throw new Error("Failure between markers: " + startMarkerName + ", " + endMarkerName);
            }
        }

        private raiseError(message: string) {
            message = this.messageAtLastKnownMarker(message);
            throw new Error(message);
        }

        private messageAtLastKnownMarker(message: string) {
            return "Marker: " + this.lastKnownMarker + "\n" + message;
        }

        private assertionMessageAtLastKnownMarker(msg: string) {
            return "\nMarker: " + this.lastKnownMarker + "\nChecking: " + msg + "\n\n";
        }

        private getDiagnostics(fileName: string): ts.Diagnostic[] {
            const syntacticErrors = this.languageService.getSyntacticDiagnostics(fileName);
            const semanticErrors = this.languageService.getSemanticDiagnostics(fileName);

            const diagnostics: ts.Diagnostic[] = [];
            diagnostics.push.apply(diagnostics, syntacticErrors);
            diagnostics.push.apply(diagnostics, semanticErrors);

            return diagnostics;
        }

        private getAllDiagnostics(): ts.Diagnostic[] {
            const diagnostics: ts.Diagnostic[] = [];

            const fileNames = this.languageServiceAdapterHost.getFilenames();
            for (let i = 0, n = fileNames.length; i < n; i++) {
                diagnostics.push.apply(this.getDiagnostics(fileNames[i]));
            }

            return diagnostics;
        }

        public verifyErrorExistsAfterMarker(markerName: string, negative: boolean, after: boolean) {
            const marker: Marker = this.getMarkerByName(markerName);
            let predicate: (errorMinChar: number, errorLimChar: number, startPos: number, endPos: number) => boolean;

            if (after) {
                predicate = function (errorMinChar: number, errorLimChar: number, startPos: number, endPos: number) {
                    return ((errorMinChar >= startPos) && (errorLimChar >= startPos)) ? true : false;
                };
            }
            else {
                predicate = function (errorMinChar: number, errorLimChar: number, startPos: number, endPos: number) {
                    return ((errorMinChar <= startPos) && (errorLimChar <= startPos)) ? true : false;
                };
            }

            const exists = this.anyErrorInRange(predicate, marker);
            const diagnostics = this.getAllDiagnostics();

            if (exists !== negative) {
                this.printErrorLog(negative, diagnostics);
                throw new Error("Failure at marker: " + markerName);
            }
        }

        private anyErrorInRange(predicate: (errorMinChar: number, errorLimChar: number, startPos: number, endPos: number) => boolean, startMarker: Marker, endMarker?: Marker) {

            const errors = this.getDiagnostics(startMarker.fileName);
            let exists = false;

            const startPos = startMarker.position;
            let endPos: number = undefined;
            if (endMarker !== undefined) {
                endPos = endMarker.position;
            }

            errors.forEach(function (error: ts.Diagnostic) {
                if (predicate(error.start, error.start + error.length, startPos, endPos)) {
                    exists = true;
                }
            });

            return exists;
        }

        private printErrorLog(expectErrors: boolean, errors: ts.Diagnostic[]) {
            if (expectErrors) {
                Harness.IO.log("Expected error not found.  Error list is:");
            }
            else {
                Harness.IO.log("Unexpected error(s) found.  Error list is:");
            }

            errors.forEach(function (error: ts.Diagnostic) {
                Harness.IO.log("  minChar: " + error.start +
                    ", limChar: " + (error.start + error.length) +
                    ", message: " + ts.flattenDiagnosticMessageText(error.messageText, Harness.IO.newLine()) + "\n");
            });
        }

        public verifyNumberOfErrorsInCurrentFile(expected: number) {
            const errors = this.getDiagnostics(this.activeFile.fileName);
            const actual = errors.length;

            if (actual !== expected) {
                this.printErrorLog(/*expectErrors*/ false, errors);
                const errorMsg = "Actual number of errors (" + actual + ") does not match expected number (" + expected + ")";
                Harness.IO.log(errorMsg);
                this.raiseError(errorMsg);
            }
        }

        public verifyEval(expr: string, value: any) {
            const emit = this.languageService.getEmitOutput(this.activeFile.fileName);
            if (emit.outputFiles.length !== 1) {
                throw new Error("Expected exactly one output from emit of " + this.activeFile.fileName);
            }

            const evaluation = new Function(`${emit.outputFiles[0].text};\r\nreturn (${expr});`)();
            if (evaluation !== value) {
                this.raiseError(`Expected evaluation of expression "${expr}" to equal "${value}", but got "${evaluation}"`);
            }
        }

        public verifyGetEmitOutputForCurrentFile(expected: string): void {
            const emit = this.languageService.getEmitOutput(this.activeFile.fileName);
            if (emit.outputFiles.length !== 1) {
                throw new Error("Expected exactly one output from emit of " + this.activeFile.fileName);
            }
            const actual = emit.outputFiles[0].text;
            if (actual !== expected) {
                this.raiseError(`Expected emit output to be "${expected}", but got "${actual}"`);
            }
        }

        public verifyGetEmitOutputContentsForCurrentFile(expected: ts.OutputFile[]): void {
            const emit = this.languageService.getEmitOutput(this.activeFile.fileName);
            assert.equal(emit.outputFiles.length, expected.length, "Number of emit output files");
            for (let i = 0; i < emit.outputFiles.length; i++) {
                assert.equal(emit.outputFiles[i].name, expected[i].name, "FileName");
                assert.equal(emit.outputFiles[i].text, expected[i].text, "Content");
            }
        }

        public verifyMemberListContains(symbol: string, text?: string, documentation?: string, kind?: string) {
            const members = this.getMemberListAtCaret();
            if (members) {
                this.assertItemInCompletionList(members.entries, symbol, text, documentation, kind);
            }
            else {
                this.raiseError("Expected a member list, but none was provided");
            }
        }

        public verifyMemberListCount(expectedCount: number, negative: boolean) {
            if (expectedCount === 0 && negative) {
                this.verifyMemberListIsEmpty(/*negative*/ false);
                return;
            }

            const members = this.getMemberListAtCaret();

            if (members) {
                const match = members.entries.length === expectedCount;

                if ((!match && !negative) || (match && negative)) {
                    this.raiseError("Member list count was " + members.entries.length + ". Expected " + expectedCount);
                }
            }
            else if (expectedCount) {
                this.raiseError("Member list count was 0. Expected " + expectedCount);
            }
        }

        public verifyMemberListDoesNotContain(symbol: string) {
            const members = this.getMemberListAtCaret();
            if (members && members.entries.filter(e => e.name === symbol).length !== 0) {
                this.raiseError(`Member list did contain ${symbol}`);
            }
        }

        public verifyCompletionListItemsCountIsGreaterThan(count: number, negative: boolean) {
            const completions = this.getCompletionListAtCaret();
            const itemsCount = completions.entries.length;

            if (negative) {
                if (itemsCount > count) {
                    this.raiseError(`Expected completion list items count to not be greater than ${count}, but is actually ${itemsCount}`);
                }
            }
            else {
                if (itemsCount <= count) {
                    this.raiseError(`Expected completion list items count to be greater than ${count}, but is actually ${itemsCount}`);
                }
            }
        }

        public verifyMemberListIsEmpty(negative: boolean) {
            const members = this.getMemberListAtCaret();
            if ((!members || members.entries.length === 0) && negative) {
                this.raiseError("Member list is empty at Caret");
            }
            else if ((members && members.entries.length !== 0) && !negative) {

                let errorMsg = "\n" + "Member List contains: [" + members.entries[0].name;
                for (let i = 1; i < members.entries.length; i++) {
                    errorMsg += ", " + members.entries[i].name;
                }
                errorMsg += "]\n";

                this.raiseError("Member list is not empty at Caret: " + errorMsg);

            }
        }

        public verifyCompletionListIsEmpty(negative: boolean) {
            const completions = this.getCompletionListAtCaret();
            if ((!completions || completions.entries.length === 0) && negative) {
                this.raiseError("Completion list is empty at caret at position " + this.activeFile.fileName + " " + this.currentCaretPosition);
            }
            else if (completions && completions.entries.length !== 0 && !negative) {
                let errorMsg = "\n" + "Completion List contains: [" + completions.entries[0].name;
                for (let i = 1; i < completions.entries.length; i++) {
                    errorMsg += ", " + completions.entries[i].name;
                }
                errorMsg += "]\n";

                this.raiseError("Completion list is not empty at caret at position " + this.activeFile.fileName + " " + this.currentCaretPosition + errorMsg);
            }
        }


        public verifyCompletionListAllowsNewIdentifier(negative: boolean) {
            const completions = this.getCompletionListAtCaret();

            if ((completions && !completions.isNewIdentifierLocation) && !negative) {
                this.raiseError("Expected builder completion entry");
            }
            else if ((completions && completions.isNewIdentifierLocation) && negative) {
                this.raiseError("Un-expected builder completion entry");
            }
        }

        public verifyCompletionListContains(symbol: string, text?: string, documentation?: string, kind?: string) {
            const completions = this.getCompletionListAtCaret();
            if (completions) {
                this.assertItemInCompletionList(completions.entries, symbol, text, documentation, kind);
            }
            else {
                this.raiseError(`No completions at position '${ this.currentCaretPosition }' when looking for '${ symbol }'.`);
            }
        }

        /**
         * Verify that the completion list does NOT contain the given symbol.
         * The symbol is considered matched with the symbol in the list if and only if all given parameters must matched.
         * When any parameter is omitted, the parameter is ignored during comparison and assumed that the parameter with
         * that property of the symbol in the list.
         * @param symbol the name of symbol
         * @param expectedText the text associated with the symbol
         * @param expectedDocumentation the documentation text associated with the symbol
         * @param expectedKind the kind of symbol (see ScriptElementKind)
         */
        public verifyCompletionListDoesNotContain(symbol: string, expectedText?: string, expectedDocumentation?: string, expectedKind?: string) {
            const that = this;
            function filterByTextOrDocumentation(entry: ts.CompletionEntry) {
                const details = that.getCompletionEntryDetails(entry.name);
                const documentation = ts.displayPartsToString(details.documentation);
                const text = ts.displayPartsToString(details.displayParts);
                if (expectedText && expectedDocumentation) {
                    return (documentation === expectedDocumentation && text === expectedText) ? true : false;
                }
                else if (expectedText && !expectedDocumentation) {
                    return text === expectedText ? true : false;
                }
                else if (expectedDocumentation && !expectedText) {
                    return documentation === expectedDocumentation ? true : false;
                }
                // Because expectedText and expectedDocumentation are undefined, we assume that
                // users don"t care to compare them so we will treat that entry as if the entry has matching text and documentation
                // and keep it in the list of filtered entry.
                return true;
            }

            const completions = this.getCompletionListAtCaret();
            if (completions) {
                let filterCompletions = completions.entries.filter(e => e.name === symbol);
                filterCompletions = expectedKind ? filterCompletions.filter(e => e.kind === expectedKind) : filterCompletions;
                filterCompletions = filterCompletions.filter(filterByTextOrDocumentation);
                if (filterCompletions.length !== 0) {
                    // After filtered using all present criterion, if there are still symbol left in the list
                    // then these symbols must meet the criterion for Not supposed to be in the list. So we
                    // raise an error
                    let error = "Completion list did contain \'" + symbol + "\'.";
                    const details = this.getCompletionEntryDetails(filterCompletions[0].name);
                    if (expectedText) {
                        error += "Expected text: " + expectedText + " to equal: " + ts.displayPartsToString(details.displayParts) + ".";
                    }
                    if (expectedDocumentation) {
                        error += "Expected documentation: " + expectedDocumentation + " to equal: " + ts.displayPartsToString(details.documentation) + ".";
                    }
                    if (expectedKind) {
                        error += "Expected kind: " + expectedKind + " to equal: " + filterCompletions[0].kind + ".";
                    }
                    this.raiseError(error);
                }
            }
        }

        public verifyCompletionEntryDetails(entryName: string, expectedText: string, expectedDocumentation?: string, kind?: string) {
            const details = this.getCompletionEntryDetails(entryName);

            assert.equal(ts.displayPartsToString(details.displayParts), expectedText, this.assertionMessageAtLastKnownMarker("completion entry details text"));

            if (expectedDocumentation !== undefined) {
                assert.equal(ts.displayPartsToString(details.documentation), expectedDocumentation, this.assertionMessageAtLastKnownMarker("completion entry documentation"));
            }

            if (kind !== undefined) {
                assert.equal(details.kind, kind, this.assertionMessageAtLastKnownMarker("completion entry kind"));
            }
        }

        public verifyReferencesAtPositionListContains(fileName: string, start: number, end: number, isWriteAccess?: boolean) {
            const references = this.getReferencesAtCaret();

            if (!references || references.length === 0) {
                this.raiseError("verifyReferencesAtPositionListContains failed - found 0 references, expected at least one.");
            }

            for (let i = 0; i < references.length; i++) {
                const reference = references[i];
                if (reference && reference.fileName === fileName && reference.textSpan.start === start && ts.textSpanEnd(reference.textSpan) === end) {
                    if (typeof isWriteAccess !== "undefined" && reference.isWriteAccess !== isWriteAccess) {
                        this.raiseError(`verifyReferencesAtPositionListContains failed - item isWriteAccess value does not match, actual: ${reference.isWriteAccess}, expected: ${isWriteAccess}.`);
                    }
                    return;
                }
            }

            const missingItem = { fileName: fileName, start: start, end: end, isWriteAccess: isWriteAccess };
            this.raiseError(`verifyReferencesAtPositionListContains failed - could not find the item: ${JSON.stringify(missingItem)} in the returned list: (${JSON.stringify(references)})`);
        }

        public verifyReferencesCountIs(count: number, localFilesOnly = true) {
            const references = this.getReferencesAtCaret();
            let referencesCount = 0;

            if (localFilesOnly) {
                const localFiles = this.testData.files.map<string>(file => file.fileName);
                // Count only the references in local files. Filter the ones in lib and other files.
                ts.forEach(references, entry => {
                    if (localFiles.some((fileName) => fileName === entry.fileName)) {
                        ++referencesCount;
                    }
                });
            }
            else {
                referencesCount = references && references.length || 0;
            }

            if (referencesCount !== count) {
                const condition = localFilesOnly ? "excluding libs" : "including libs";
                this.raiseError("Expected references count (" + condition + ") to be " + count + ", but is actually " + referencesCount);
            }
        }

        private getMemberListAtCaret() {
            return this.languageService.getCompletionsAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        }

        private getCompletionListAtCaret() {
            return this.languageService.getCompletionsAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        }

        private getCompletionEntryDetails(entryName: string) {
            return this.languageService.getCompletionEntryDetails(this.activeFile.fileName, this.currentCaretPosition, entryName);
        }

        private getReferencesAtCaret() {
            return this.languageService.getReferencesAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        }

        private assertionMessage(name: string, actualValue: any, expectedValue: any) {
            return "\nActual " + name + ":\n\t" + actualValue + "\nExpected value:\n\t" + expectedValue;
        }

        public getSyntacticDiagnostics(expected: string) {
            const diagnostics = this.languageService.getSyntacticDiagnostics(this.activeFile.fileName);
            this.testDiagnostics(expected, diagnostics);
        }

        public getSemanticDiagnostics(expected: string) {
            const diagnostics = this.languageService.getSemanticDiagnostics(this.activeFile.fileName);
            this.testDiagnostics(expected, diagnostics);
        }

        private testDiagnostics(expected: string, diagnostics: ts.Diagnostic[]) {
            const realized = ts.realizeDiagnostics(diagnostics, "\r\n");
            const actual = JSON.stringify(realized, null, "  ");
            assert.equal(actual, expected);
        }

        public verifyQuickInfoString(negative: boolean, expectedText?: string, expectedDocumentation?: string) {
            const actualQuickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            const actualQuickInfoText = actualQuickInfo ? ts.displayPartsToString(actualQuickInfo.displayParts) : "";
            const actualQuickInfoDocumentation = actualQuickInfo ? ts.displayPartsToString(actualQuickInfo.documentation) : "";

            if (negative) {
                if (expectedText !== undefined) {
                    assert.notEqual(actualQuickInfoText, expectedText, this.messageAtLastKnownMarker("quick info text"));
                }
                // TODO: should be '==='?
                if (expectedDocumentation != undefined) {
                    assert.notEqual(actualQuickInfoDocumentation, expectedDocumentation, this.messageAtLastKnownMarker("quick info doc comment"));
                }
            }
            else {
                if (expectedText !== undefined) {
                    assert.equal(actualQuickInfoText, expectedText, this.messageAtLastKnownMarker("quick info text"));
                }
                // TODO: should be '==='?
                if (expectedDocumentation != undefined) {
                    assert.equal(actualQuickInfoDocumentation, expectedDocumentation, this.assertionMessageAtLastKnownMarker("quick info doc"));
                }
            }
        }

        public verifyQuickInfoDisplayParts(kind: string, kindModifiers: string, textSpan: { start: number; length: number; },
            displayParts: ts.SymbolDisplayPart[],
            documentation: ts.SymbolDisplayPart[]) {

            function getDisplayPartsJson(displayParts: ts.SymbolDisplayPart[]) {
                let result = "";
                ts.forEach(displayParts, part => {
                    if (result) {
                        result += ",\n    ";
                    }
                    else {
                        result = "[\n    ";
                    }
                    result += JSON.stringify(part);
                });
                if (result) {
                    result += "\n]";
                }

                return result;
            }

            const actualQuickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            assert.equal(actualQuickInfo.kind, kind, this.messageAtLastKnownMarker("QuickInfo kind"));
            assert.equal(actualQuickInfo.kindModifiers, kindModifiers, this.messageAtLastKnownMarker("QuickInfo kindModifiers"));
            assert.equal(JSON.stringify(actualQuickInfo.textSpan), JSON.stringify(textSpan), this.messageAtLastKnownMarker("QuickInfo textSpan"));
            assert.equal(getDisplayPartsJson(actualQuickInfo.displayParts), getDisplayPartsJson(displayParts), this.messageAtLastKnownMarker("QuickInfo displayParts"));
            assert.equal(getDisplayPartsJson(actualQuickInfo.documentation), getDisplayPartsJson(documentation), this.messageAtLastKnownMarker("QuickInfo documentation"));
        }

        public verifyRenameLocations(findInStrings: boolean, findInComments: boolean) {
            const renameInfo = this.languageService.getRenameInfo(this.activeFile.fileName, this.currentCaretPosition);
            if (renameInfo.canRename) {
                let references = this.languageService.findRenameLocations(
                    this.activeFile.fileName, this.currentCaretPosition, findInStrings, findInComments);

                let ranges = this.getRanges();

                if (!references) {
                    if (ranges.length !== 0) {
                        this.raiseError(`Expected ${ranges.length} rename locations; got none.`);
                    }
                    return;
                }

                if (ranges.length !== references.length) {
                    this.raiseError("Rename location count does not match result.\n\nExpected: " + JSON.stringify(ranges) + "\n\nActual:" + JSON.stringify(references));
                }

                ranges = ranges.sort((r1, r2) => r1.start - r2.start);
                references = references.sort((r1, r2) => r1.textSpan.start - r2.textSpan.start);

                for (let i = 0, n = ranges.length; i < n; i++) {
                    const reference = references[i];
                    const range = ranges[i];

                    if (reference.textSpan.start !== range.start ||
                        ts.textSpanEnd(reference.textSpan) !== range.end) {

                        this.raiseError("Rename location results do not match.\n\nExpected: " + JSON.stringify(ranges) + "\n\nActual:" + JSON.stringify(references));
                    }
                }
            }
            else {
                this.raiseError("Expected rename to succeed, but it actually failed.");
            }
        }

        public verifyQuickInfoExists(negative: boolean) {
            const actualQuickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (negative) {
                if (actualQuickInfo) {
                    this.raiseError("verifyQuickInfoExists failed. Expected quick info NOT to exist");
                }
            }
            else {
                if (!actualQuickInfo) {
                    this.raiseError("verifyQuickInfoExists failed. Expected quick info to exist");
                }
            }
        }

        public verifyCurrentSignatureHelpIs(expected: string) {
            const help = this.getActiveSignatureHelpItem();
            assert.equal(
                ts.displayPartsToString(help.prefixDisplayParts) +
                help.parameters.map(p => ts.displayPartsToString(p.displayParts)).join(ts.displayPartsToString(help.separatorDisplayParts)) +
                ts.displayPartsToString(help.suffixDisplayParts), expected);
        }

        public verifyCurrentParameterIsletiable(isVariable: boolean) {
            const signature = this.getActiveSignatureHelpItem();
            assert.isNotNull(signature);
            assert.equal(isVariable, signature.isVariadic);
        }

        public verifyCurrentParameterHelpName(name: string) {
            const activeParameter = this.getActiveParameter();
            const activeParameterName = activeParameter.name;
            assert.equal(activeParameterName, name);
        }

        public verifyCurrentParameterSpanIs(parameter: string) {
            const activeSignature = this.getActiveSignatureHelpItem();
            const activeParameter = this.getActiveParameter();
            assert.equal(ts.displayPartsToString(activeParameter.displayParts), parameter);
        }

        public verifyCurrentParameterHelpDocComment(docComment: string) {
            const activeParameter = this.getActiveParameter();
            const activeParameterDocComment = activeParameter.documentation;
            assert.equal(ts.displayPartsToString(activeParameterDocComment), docComment, this.assertionMessageAtLastKnownMarker("current parameter Help DocComment"));
        }

        public verifyCurrentSignatureHelpParameterCount(expectedCount: number) {
            assert.equal(this.getActiveSignatureHelpItem().parameters.length, expectedCount);
        }

        public verifyCurrentSignatureHelpDocComment(docComment: string) {
            const actualDocComment = this.getActiveSignatureHelpItem().documentation;
            assert.equal(ts.displayPartsToString(actualDocComment), docComment, this.assertionMessageAtLastKnownMarker("current signature help doc comment"));
        }

        public verifySignatureHelpCount(expected: number) {
            const help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            const actual = help && help.items ? help.items.length : 0;
            assert.equal(actual, expected);
        }

        public verifySignatureHelpArgumentCount(expected: number) {
            const signatureHelpItems = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            const actual = signatureHelpItems.argumentCount;
            assert.equal(actual, expected);
        }

        public verifySignatureHelpPresent(shouldBePresent = true) {
            const actual = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            if (shouldBePresent) {
                if (!actual) {
                    this.raiseError("Expected signature help to be present, but it wasn't");
                }
            }
            else {
                if (actual) {
                    this.raiseError(`Expected no signature help, but got "${JSON.stringify(actual)}"`);
                }
            }
        }

        private validate(name: string, expected: string, actual: string) {
            if (expected && expected !== actual) {
                this.raiseError("Expected " + name + " '" + expected + "'.  Got '" + actual + "' instead.");
            }
        }

        public verifyRenameInfoSucceeded(displayName?: string, fullDisplayName?: string, kind?: string, kindModifiers?: string) {
            const renameInfo = this.languageService.getRenameInfo(this.activeFile.fileName, this.currentCaretPosition);
            if (!renameInfo.canRename) {
                this.raiseError("Rename did not succeed");
            }

            this.validate("displayName", displayName, renameInfo.displayName);
            this.validate("fullDisplayName", fullDisplayName, renameInfo.fullDisplayName);
            this.validate("kind", kind, renameInfo.kind);
            this.validate("kindModifiers", kindModifiers, renameInfo.kindModifiers);

            if (this.getRanges().length !== 1) {
                this.raiseError("Expected a single range to be selected in the test file.");
            }

            const expectedRange = this.getRanges()[0];
            if (renameInfo.triggerSpan.start !== expectedRange.start ||
                ts.textSpanEnd(renameInfo.triggerSpan) !== expectedRange.end) {
                this.raiseError("Expected triggerSpan [" + expectedRange.start + "," + expectedRange.end + ").  Got [" +
                    renameInfo.triggerSpan.start + "," + ts.textSpanEnd(renameInfo.triggerSpan) + ") instead.");
            }
        }

        public verifyRenameInfoFailed(message?: string) {
            const renameInfo = this.languageService.getRenameInfo(this.activeFile.fileName, this.currentCaretPosition);
            if (renameInfo.canRename) {
                this.raiseError("Rename was expected to fail");
            }

            this.validate("error", message, renameInfo.localizedErrorMessage);
        }

        private getActiveSignatureHelpItem() {
            const help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            const index = help.selectedItemIndex;
            return help.items[index];
        }

        private getActiveParameter(): ts.SignatureHelpParameter {
            const help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            const item = help.items[help.selectedItemIndex];
            const currentParam = help.argumentIndex;
            return item.parameters[currentParam];
        }

        private alignmentForExtraInfo = 50;

        private spanInfoToString(pos: number, spanInfo: ts.TextSpan, prefixString: string) {
            let resultString = "SpanInfo: " + JSON.stringify(spanInfo);
            if (spanInfo) {
                const spanString = this.activeFile.content.substr(spanInfo.start, spanInfo.length);
                const spanLineMap = ts.computeLineStarts(spanString);
                for (let i = 0; i < spanLineMap.length; i++) {
                    if (!i) {
                        resultString += "\n";
                    }
                    resultString += prefixString + spanString.substring(spanLineMap[i], spanLineMap[i + 1]);
                }
                resultString += "\n" + prefixString + ":=> (" + this.getLineColStringAtPosition(spanInfo.start) + ") to (" + this.getLineColStringAtPosition(ts.textSpanEnd(spanInfo)) + ")";
            }

            return resultString;
        }

        private baselineCurrentFileLocations(getSpanAtPos: (pos: number) => ts.TextSpan): string {
            const fileLineMap = ts.computeLineStarts(this.activeFile.content);
            let nextLine = 0;
            let resultString = "";
            let currentLine: string;
            let previousSpanInfo: string;
            let startColumn: number;
            let length: number;
            const prefixString = "    >";

            let pos = 0;
            const addSpanInfoString = () => {
                if (previousSpanInfo) {
                    resultString += currentLine;
                    let thisLineMarker = repeatString(startColumn, " ") + repeatString(length, "~");
                    thisLineMarker += repeatString(this.alignmentForExtraInfo - thisLineMarker.length - prefixString.length + 1, " ");
                    resultString += thisLineMarker;
                    resultString += "=> Pos: (" + (pos - length) + " to " + (pos - 1) + ") ";
                    resultString += " " + previousSpanInfo;
                    previousSpanInfo = undefined;
                }
            };

            for (; pos < this.activeFile.content.length; pos++) {
                if (pos === 0 || pos === fileLineMap[nextLine]) {
                    nextLine++;
                    addSpanInfoString();
                    if (resultString.length) {
                        resultString += "\n--------------------------------";
                    }
                    currentLine = "\n" + nextLine.toString() + repeatString(3 - nextLine.toString().length, " ") + ">" + this.activeFile.content.substring(pos, fileLineMap[nextLine]) + "\n    ";
                    startColumn = 0;
                    length = 0;
                }
                const spanInfo = this.spanInfoToString(pos, getSpanAtPos(pos), prefixString);
                if (previousSpanInfo && previousSpanInfo !== spanInfo) {
                    addSpanInfoString();
                    previousSpanInfo = spanInfo;
                    startColumn = startColumn + length;
                    length = 1;
                }
                else {
                    previousSpanInfo = spanInfo;
                    length++;
                }
            }
            addSpanInfoString();
            return resultString;

            function repeatString(count: number, char: string) {
                let result = "";
                for (let i = 0; i < count; i++) {
                    result += char;
                }
                return result;
            }
        }

        public getBreakpointStatementLocation(pos: number) {
            return this.languageService.getBreakpointStatementAtPosition(this.activeFile.fileName, pos);
        }

        public baselineCurrentFileBreakpointLocations() {
            Harness.Baseline.runBaseline(
                "Breakpoint Locations for " + this.activeFile.fileName,
                this.testData.globalOptions[metadataOptionNames.baselineFile],
                () => {
                    return this.baselineCurrentFileLocations(pos => this.getBreakpointStatementLocation(pos));
                },
                true /* run immediately */);
        }

        public baselineGetEmitOutput() {
            // Find file to be emitted
            const emitFiles: FourSlashFile[] = [];  // List of FourSlashFile that has emitThisFile flag on

            const allFourSlashFiles = this.testData.files;
            for (let idx = 0; idx < allFourSlashFiles.length; ++idx) {
                const file = allFourSlashFiles[idx];
                if (file.fileOptions[metadataOptionNames.emitThisFile] === "true") {
                    // Find a file with the flag emitThisFile turned on
                    emitFiles.push(file);
                }
            }

            // If there is not emiThisFile flag specified in the test file, throw an error
            if (emitFiles.length === 0) {
                this.raiseError("No emitThisFile is specified in the test file");
            }

            Harness.Baseline.runBaseline(
                "Generate getEmitOutput baseline : " + emitFiles.join(" "),
                this.testData.globalOptions[metadataOptionNames.baselineFile],
                () => {
                    let resultString = "";
                    // Loop through all the emittedFiles and emit them one by one
                    emitFiles.forEach(emitFile => {
                        const emitOutput = this.languageService.getEmitOutput(emitFile.fileName);
                        // Print emitOutputStatus in readable format
                        resultString += "EmitSkipped: " + emitOutput.emitSkipped + Harness.IO.newLine();

                        if (emitOutput.emitSkipped) {
                            resultString += "Diagnostics:" + Harness.IO.newLine();
                            const diagnostics = ts.getPreEmitDiagnostics(this.languageService.getProgram());
                            for (let i = 0, n = diagnostics.length; i < n; i++) {
                                resultString += "  " + diagnostics[0].messageText + Harness.IO.newLine();
                            }
                        }

                        emitOutput.outputFiles.forEach((outputFile, idx, array) => {
                            const fileName = "FileName : " + outputFile.name + Harness.IO.newLine();
                            resultString = resultString + fileName + outputFile.text;
                        });
                        resultString += Harness.IO.newLine();
                    });

                    return resultString;
                },
                true /* run immediately */);
        }

        public printBreakpointLocation(pos: number) {
            Harness.IO.log("\n**Pos: " + pos + " " + this.spanInfoToString(pos, this.getBreakpointStatementLocation(pos), "  "));
        }

        public printBreakpointAtCurrentLocation() {
            this.printBreakpointLocation(this.currentCaretPosition);
        }

        public printCurrentParameterHelp() {
            const help = this.languageService.getSignatureHelpItems(this.activeFile.fileName, this.currentCaretPosition);
            Harness.IO.log(JSON.stringify(help));
        }

        public printCurrentQuickInfo() {
            const quickInfo = this.languageService.getQuickInfoAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            Harness.IO.log("Quick Info: " + quickInfo.displayParts.map(part => part.text).join(""));
        }

        public printErrorList() {
            const syntacticErrors = this.languageService.getSyntacticDiagnostics(this.activeFile.fileName);
            const semanticErrors = this.languageService.getSemanticDiagnostics(this.activeFile.fileName);
            const errorList = syntacticErrors.concat(semanticErrors);
            Harness.IO.log(`Error list (${errorList.length} errors)`);

            if (errorList.length) {
                errorList.forEach(err => {
                    Harness.IO.log(
                        "start: " + err.start +
                        ", length: " + err.length +
                        ", message: " + ts.flattenDiagnosticMessageText(err.messageText, Harness.IO.newLine()));
                });
            }
        }

        public printCurrentFileState(makeWhitespaceVisible = false, makeCaretVisible = true) {
            for (let i = 0; i < this.testData.files.length; i++) {
                const file = this.testData.files[i];
                const active = (this.activeFile === file);
                Harness.IO.log(`=== Script (${file.fileName}) ${(active ? "(active, cursor at |)" : "")} ===`);
                let content = this.getFileContent(file.fileName);
                if (active) {
                    content = content.substr(0, this.currentCaretPosition) + (makeCaretVisible ? "|" : "") + content.substr(this.currentCaretPosition);
                }
                if (makeWhitespaceVisible) {
                    content = TestState.makeWhitespaceVisible(content);
                }
                Harness.IO.log(content);
            }
        }

        public printCurrentSignatureHelp() {
            const sigHelp = this.getActiveSignatureHelpItem();
            Harness.IO.log(JSON.stringify(sigHelp));
        }

        public printMemberListMembers() {
            const members = this.getMemberListAtCaret();
            this.printMembersOrCompletions(members);
        }

        public printCompletionListMembers() {
            const completions = this.getCompletionListAtCaret();
            this.printMembersOrCompletions(completions);
        }

        private printMembersOrCompletions(info: ts.CompletionInfo) {
            function pad(s: string, length: number) {
                return s + new Array(length - s.length + 1).join(" ");
            }
            function max<T>(arr: T[], selector: (x: T) => number): number {
                return arr.reduce((prev, x) => Math.max(prev, selector(x)), 0);
            }
            const longestNameLength = max(info.entries, m => m.name.length);
            const longestKindLength = max(info.entries, m => m.kind.length);
            info.entries.sort((m, n) => m.sortText > n.sortText ? 1 : m.sortText < n.sortText ? -1 : m.name > n.name ? 1 : m.name < n.name ? -1 : 0);
            const membersString = info.entries.map(m => `${pad(m.name, longestNameLength)} ${pad(m.kind, longestKindLength)} ${m.kindModifiers}`).join("\n");
            Harness.IO.log(membersString);
        }

        public printReferences() {
            const references = this.getReferencesAtCaret();
            ts.forEach(references, entry => {
                Harness.IO.log(JSON.stringify(entry));
            });
        }

        public printContext() {
            ts.forEach(this.languageServiceAdapterHost.getFilenames(), Harness.IO.log);
        }

        public deleteChar(count = 1) {
            let offset = this.currentCaretPosition;
            const ch = "";

            const checkCadence = (count >> 2) + 1;

            for (let i = 0; i < count; i++) {
                // Make the edit
                this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset + 1, ch);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset + 1, ch);

                if (i % checkCadence === 0) {
                    this.checkPostEditInvariants();
                }

                // Handle post-keystroke formatting
                if (this.enableFormatting) {
                    const edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    if (edits.length) {
                        offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                        // this.checkPostEditInletiants();
                    }
                }
            }

            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;

            this.fixCaretPosition();
            this.checkPostEditInvariants();
        }

        public replace(start: number, length: number, text: string) {
            this.languageServiceAdapterHost.editScript(this.activeFile.fileName, start, start + length, text);
            this.updateMarkersForEdit(this.activeFile.fileName, start, start + length, text);
            this.checkPostEditInvariants();
        }

        public deleteCharBehindMarker(count = 1) {
            let offset = this.currentCaretPosition;
            const ch = "";
            const checkCadence = (count >> 2) + 1;

            for (let i = 0; i < count; i++) {
                offset--;
                // Make the edit
                this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset + 1, ch);
                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset + 1, ch);

                if (i % checkCadence === 0) {
                    this.checkPostEditInvariants();
                }

                // Handle post-keystroke formatting
                if (this.enableFormatting) {
                    const edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    if (edits.length) {
                        offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                    }
                }
            }

            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;

            this.fixCaretPosition();
            this.checkPostEditInvariants();
        }

        // Enters lines of text at the current caret position
        public type(text: string) {
            return this.typeHighFidelity(text);
        }

        // Enters lines of text at the current caret position, invoking
        // language service APIs to mimic Visual Studio's behavior
        // as much as possible
        private typeHighFidelity(text: string) {
            let offset = this.currentCaretPosition;
            const prevChar = " ";
            const checkCadence = (text.length >> 2) + 1;

            for (let i = 0; i < text.length; i++) {
                // Make the edit
                const ch = text.charAt(i);
                this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset, ch);
                this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, offset);

                this.updateMarkersForEdit(this.activeFile.fileName, offset, offset, ch);
                offset++;

                if (ch === "(" || ch === ",") {
                    /* Signature help*/
                    this.languageService.getSignatureHelpItems(this.activeFile.fileName, offset);
                }
                else if (prevChar === " " && /A-Za-z_/.test(ch)) {
                    /* Completions */
                    this.languageService.getCompletionsAtPosition(this.activeFile.fileName, offset);
                }

                if (i % checkCadence === 0) {
                    this.checkPostEditInvariants();
                    // this.languageService.getSyntacticDiagnostics(this.activeFile.fileName);
                    // this.languageService.getSemanticDiagnostics(this.activeFile.fileName);
                }

                // Handle post-keystroke formatting
                if (this.enableFormatting) {
                    const edits = this.languageService.getFormattingEditsAfterKeystroke(this.activeFile.fileName, offset, ch, this.formatCodeOptions);
                    if (edits.length) {
                        offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                        // this.checkPostEditInletiants();
                    }
                }
            }

            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;

            this.fixCaretPosition();
            this.checkPostEditInvariants();
        }

        // Enters text as if the user had pasted it
        public paste(text: string) {
            const start = this.currentCaretPosition;
            let offset = this.currentCaretPosition;
            this.languageServiceAdapterHost.editScript(this.activeFile.fileName, offset, offset, text);
            this.updateMarkersForEdit(this.activeFile.fileName, offset, offset, text);
            this.checkPostEditInvariants();
            offset += text.length;

            // Handle formatting
            if (this.enableFormatting) {
                const edits = this.languageService.getFormattingEditsForRange(this.activeFile.fileName, start, offset, this.formatCodeOptions);
                if (edits.length) {
                    offset += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
                    this.checkPostEditInvariants();
                }
            }

            // Move the caret to wherever we ended up
            this.currentCaretPosition = offset;
            this.fixCaretPosition();

            this.checkPostEditInvariants();
        }

        private checkPostEditInvariants() {
            if (this.testType !== FourSlashTestType.Native) {
                // getSourcefile() results can not be serialized. Only perform these verifications
                // if running against a native LS object.
                return;
            }

            const incrementalSourceFile = this.languageService.getSourceFile(this.activeFile.fileName);
            Utils.assertInvariants(incrementalSourceFile, /*parent:*/ undefined);

            const incrementalSyntaxDiagnostics = incrementalSourceFile.parseDiagnostics;

            // Check syntactic structure
            const content = this.getFileContent(this.activeFile.fileName);

            const referenceSourceFile = ts.createLanguageServiceSourceFile(
                this.activeFile.fileName, createScriptSnapShot(content), ts.ScriptTarget.Latest, /*version:*/ "0", /*setNodeParents:*/ false);
            const referenceSyntaxDiagnostics = referenceSourceFile.parseDiagnostics;

            Utils.assertDiagnosticsEquals(incrementalSyntaxDiagnostics, referenceSyntaxDiagnostics);
            Utils.assertStructuralEquals(incrementalSourceFile, referenceSourceFile);
        }

        private fixCaretPosition() {
            // The caret can potentially end up between the \r and \n, which is confusing. If
            // that happens, move it back one character
            if (this.currentCaretPosition > 0) {
                const ch = this.getFileContent(this.activeFile.fileName).substring(this.currentCaretPosition - 1, this.currentCaretPosition);
                if (ch === "\r") {
                    this.currentCaretPosition--;
                }
            };
        }

        private applyEdits(fileName: string, edits: ts.TextChange[], isFormattingEdit = false): number {
            // We get back a set of edits, but langSvc.editScript only accepts one at a time. Use this to keep track
            // of the incremental offset from each edit to the next. Assumption is that these edit ranges don't overlap
            let runningOffset = 0;
            edits = edits.sort((a, b) => a.span.start - b.span.start);
            // Get a snapshot of the content of the file so we can make sure any formatting edits didn't destroy non-whitespace characters
            const oldContent = this.getFileContent(this.activeFile.fileName);
            for (let j = 0; j < edits.length; j++) {
                this.languageServiceAdapterHost.editScript(fileName, edits[j].span.start + runningOffset, ts.textSpanEnd(edits[j].span) + runningOffset, edits[j].newText);
                this.updateMarkersForEdit(fileName, edits[j].span.start + runningOffset, ts.textSpanEnd(edits[j].span) + runningOffset, edits[j].newText);
                const change = (edits[j].span.start - ts.textSpanEnd(edits[j].span)) + edits[j].newText.length;
                runningOffset += change;
                // TODO: Consider doing this at least some of the time for higher fidelity. Currently causes a failure (bug 707150)
                // this.languageService.getScriptLexicalStructure(fileName);
            }

            if (isFormattingEdit) {
                const newContent = this.getFileContent(fileName);

                if (newContent.replace(/\s/g, "") !== oldContent.replace(/\s/g, "")) {
                    this.raiseError("Formatting operation destroyed non-whitespace content");
                }
            }
            return runningOffset;
        }

        public copyFormatOptions(): ts.FormatCodeOptions {
            return ts.clone(this.formatCodeOptions);
        }

        public setFormatOptions(formatCodeOptions: ts.FormatCodeOptions): ts.FormatCodeOptions {
            const oldFormatCodeOptions = this.formatCodeOptions;
            this.formatCodeOptions = formatCodeOptions;
            return oldFormatCodeOptions;
        }

        public formatDocument() {
            const edits = this.languageService.getFormattingEditsForDocument(this.activeFile.fileName, this.formatCodeOptions);
            this.currentCaretPosition += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
            this.fixCaretPosition();
        }

        public formatSelection(start: number, end: number) {
            const edits = this.languageService.getFormattingEditsForRange(this.activeFile.fileName, start, end, this.formatCodeOptions);
            this.currentCaretPosition += this.applyEdits(this.activeFile.fileName, edits, /*isFormattingEdit*/ true);
            this.fixCaretPosition();
        }

        private updateMarkersForEdit(fileName: string, minChar: number, limChar: number, text: string) {
            for (let i = 0; i < this.testData.markers.length; i++) {
                const marker = this.testData.markers[i];
                if (marker.fileName === fileName) {
                    if (marker.position > minChar) {
                        if (marker.position < limChar) {
                            // Marker is inside the edit - mark it as invalidated (?)
                            marker.position = -1;
                        }
                        else {
                            // Move marker back/forward by the appropriate amount
                            marker.position += (minChar - limChar) + text.length;
                        }
                    }
                }
            }
        }

        public goToBOF() {
            this.goToPosition(0);
        }

        public goToEOF() {
            const len = this.getFileContent(this.activeFile.fileName).length;
            this.goToPosition(len);
        }

        public goToDefinition(definitionIndex: number) {
            const definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (!definitions || !definitions.length) {
                this.raiseError("goToDefinition failed - expected to at least one definition location but got 0");
            }

            if (definitionIndex >= definitions.length) {
                this.raiseError(`goToDefinition failed - definitionIndex value (${definitionIndex}) exceeds definition list size (${definitions.length})`);
            }

            const definition = definitions[definitionIndex];
            this.openFile(definition.fileName);
            this.currentCaretPosition = definition.textSpan.start;
        }

        public goToTypeDefinition(definitionIndex: number) {
            const definitions = this.languageService.getTypeDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            if (!definitions || !definitions.length) {
                this.raiseError("goToTypeDefinition failed - expected to at least one definition location but got 0");
            }

            if (definitionIndex >= definitions.length) {
                this.raiseError(`goToTypeDefinition failed - definitionIndex value (${definitionIndex}) exceeds definition list size (${definitions.length})`);
            }

            const definition = definitions[definitionIndex];
            this.openFile(definition.fileName);
            this.currentCaretPosition = definition.textSpan.start;
        }

        public verifyDefinitionLocationExists(negative: boolean) {
            const definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);

            const foundDefinitions = definitions && definitions.length;

            if (foundDefinitions && negative) {
                this.raiseError(`goToDefinition - expected to 0 definition locations but got ${definitions.length}`);
            }
            else if (!foundDefinitions && !negative) {
                this.raiseError("goToDefinition - expected to at least one definition location but got 0");
            }
        }

        public verifyDefinitionsCount(negative: boolean, expectedCount: number) {
            const assertFn = negative ? assert.notEqual : assert.equal;

            const definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            const actualCount = definitions && definitions.length || 0;

            assertFn(actualCount, expectedCount, this.messageAtLastKnownMarker("Definitions Count"));
        }

        public verifyTypeDefinitionsCount(negative: boolean, expectedCount: number) {
            const assertFn = negative ? assert.notEqual : assert.equal;

            const definitions = this.languageService.getTypeDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            const actualCount = definitions && definitions.length || 0;

            assertFn(actualCount, expectedCount, this.messageAtLastKnownMarker("Type definitions Count"));
        }

        public verifyDefinitionsName(negative: boolean, expectedName: string, expectedContainerName: string) {
            const definitions = this.languageService.getDefinitionAtPosition(this.activeFile.fileName, this.currentCaretPosition);
            const actualDefinitionName = definitions && definitions.length ? definitions[0].name : "";
            const actualDefinitionContainerName = definitions && definitions.length ? definitions[0].containerName : "";
            if (negative) {
                assert.notEqual(actualDefinitionName, expectedName, this.messageAtLastKnownMarker("Definition Info Name"));
                assert.notEqual(actualDefinitionContainerName, expectedContainerName, this.messageAtLastKnownMarker("Definition Info Container Name"));
            }
            else {
                assert.equal(actualDefinitionName, expectedName, this.messageAtLastKnownMarker("Definition Info Name"));
                assert.equal(actualDefinitionContainerName, expectedContainerName, this.messageAtLastKnownMarker("Definition Info Container Name"));
            }
        }

        public getMarkers(): Marker[] {
            //  Return a copy of the list
            return this.testData.markers.slice(0);
        }

        public getRanges(): Range[] {
            //  Return a copy of the list
            return this.testData.ranges.slice(0);
        }

        public verifyCaretAtMarker(markerName = "") {
            const pos = this.getMarkerByName(markerName);
            if (pos.fileName !== this.activeFile.fileName) {
                throw new Error(`verifyCaretAtMarker failed - expected to be in file "${pos.fileName}", but was in file "${this.activeFile.fileName}"`);
            }
            if (pos.position !== this.currentCaretPosition) {
                throw new Error(`verifyCaretAtMarker failed - expected to be at marker "/*${markerName}*/, but was at position ${this.currentCaretPosition}(${this.getLineColStringAtPosition(this.currentCaretPosition)})`);
            }
        }

        private getIndentation(fileName: string, position: number, indentStyle: ts.IndentStyle): number {

            const formatOptions = ts.clone(this.formatCodeOptions);
            formatOptions.IndentStyle = indentStyle;

            return this.languageService.getIndentationAtPosition(fileName, position, formatOptions);
        }

        public verifyIndentationAtCurrentPosition(numberOfSpaces: number, indentStyle: ts.IndentStyle = ts.IndentStyle.Smart) {
            const actual = this.getIndentation(this.activeFile.fileName, this.currentCaretPosition, indentStyle);
            const lineCol = this.getLineColStringAtPosition(this.currentCaretPosition);
            if (actual !== numberOfSpaces) {
                this.raiseError(`verifyIndentationAtCurrentPosition failed at ${lineCol} - expected: ${numberOfSpaces}, actual: ${actual}`);
            }
        }

        public verifyIndentationAtPosition(fileName: string, position: number, numberOfSpaces: number, indentStyle: ts.IndentStyle = ts.IndentStyle.Smart) {
            const actual = this.getIndentation(fileName, position, indentStyle);
            const lineCol = this.getLineColStringAtPosition(position);
            if (actual !== numberOfSpaces) {
                this.raiseError(`verifyIndentationAtPosition failed at ${lineCol} - expected: ${numberOfSpaces}, actual: ${actual}`);
            }
        }

        public verifyCurrentLineContent(text: string) {
            const actual = this.getCurrentLineContent();
            if (actual !== text) {
                throw new Error("verifyCurrentLineContent\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        }

        public verifyCurrentFileContent(text: string) {
            const actual = this.getFileContent(this.activeFile.fileName);
            const replaceNewlines = (str: string) => str.replace(/\r\n/g, "\n");
            if (replaceNewlines(actual) !== replaceNewlines(text)) {
                throw new Error("verifyCurrentFileContent\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        }

        public verifyTextAtCaretIs(text: string) {
            const actual = this.getFileContent(this.activeFile.fileName).substring(this.currentCaretPosition, this.currentCaretPosition + text.length);
            if (actual !== text) {
                throw new Error("verifyTextAtCaretIs\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        }

        public verifyCurrentNameOrDottedNameSpanText(text: string) {
            const span = this.languageService.getNameOrDottedNameSpan(this.activeFile.fileName, this.currentCaretPosition, this.currentCaretPosition);
            if (!span) {
                this.raiseError("verifyCurrentNameOrDottedNameSpanText\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: undefined");
            }

            const actual = this.getFileContent(this.activeFile.fileName).substring(span.start, ts.textSpanEnd(span));
            if (actual !== text) {
                this.raiseError("verifyCurrentNameOrDottedNameSpanText\n" +
                    "\tExpected: \"" + text + "\"\n" +
                    "\t  Actual: \"" + actual + "\"");
            }
        }

        private getNameOrDottedNameSpan(pos: number) {
            return this.languageService.getNameOrDottedNameSpan(this.activeFile.fileName, pos, pos);
        }

        public baselineCurrentFileNameOrDottedNameSpans() {
            Harness.Baseline.runBaseline(
                "Name OrDottedNameSpans for " + this.activeFile.fileName,
                this.testData.globalOptions[metadataOptionNames.baselineFile],
                () => {
                    return this.baselineCurrentFileLocations(pos =>
                        this.getNameOrDottedNameSpan(pos));
                },
                true /* run immediately */);
        }

        public printNameOrDottedNameSpans(pos: number) {
            Harness.IO.log(this.spanInfoToString(pos, this.getNameOrDottedNameSpan(pos), "**"));
        }

        private verifyClassifications(expected: { classificationType: string; text: string; textSpan?: TextSpan }[], actual: ts.ClassifiedSpan[]) {
            if (actual.length !== expected.length) {
                this.raiseError("verifyClassifications failed - expected total classifications to be " + expected.length +
                    ", but was " + actual.length +
                    jsonMismatchString());
            }

            for (let i = 0; i < expected.length; i++) {
                const expectedClassification = expected[i];
                const actualClassification = actual[i];

                const expectedType: string = (<any>ts.ClassificationTypeNames)[expectedClassification.classificationType];
                if (expectedType !== actualClassification.classificationType) {
                    this.raiseError("verifyClassifications failed - expected classifications type to be " +
                        expectedType + ", but was " +
                        actualClassification.classificationType +
                        jsonMismatchString());
                }

                const expectedSpan = expectedClassification.textSpan;
                const actualSpan = actualClassification.textSpan;

                if (expectedSpan) {
                    const expectedLength = expectedSpan.end - expectedSpan.start;

                    if (expectedSpan.start !== actualSpan.start || expectedLength !== actualSpan.length) {
                        this.raiseError("verifyClassifications failed - expected span of text to be " +
                            "{start=" + expectedSpan.start + ", length=" + expectedLength + "}, but was " +
                            "{start=" + actualSpan.start + ", length=" + actualSpan.length + "}" +
                            jsonMismatchString());
                    }
                }

                const actualText = this.activeFile.content.substr(actualSpan.start, actualSpan.length);
                if (expectedClassification.text !== actualText) {
                    this.raiseError("verifyClassifications failed - expected classified text to be " +
                        expectedClassification.text + ", but was " +
                        actualText +
                        jsonMismatchString());
                }
            }

            function jsonMismatchString() {
                return Harness.IO.newLine() +
                    "expected: '" + Harness.IO.newLine() + JSON.stringify(expected, (k, v) => v, 2) + "'" + Harness.IO.newLine() +
                    "actual:   '" + Harness.IO.newLine() + JSON.stringify(actual, (k, v) => v, 2) + "'";
            }
        }

        public verifyProjectInfo(expected: string[]) {
            if (this.testType === FourSlashTestType.Server) {
                const actual = (<ts.server.SessionClient>this.languageService).getProjectInfo(
                    this.activeFile.fileName,
                    /* needFileNameList */ true
                    );
                assert.equal(
                    expected.join(","),
                    actual.fileNames.map( file => {
                        return file.replace(this.basePath + "/", "");
                        }).join(",")
                    );
            }
        }

        public verifySemanticClassifications(expected: { classificationType: string; text: string }[]) {
            const actual = this.languageService.getSemanticClassifications(this.activeFile.fileName,
                ts.createTextSpan(0, this.activeFile.content.length));

            this.verifyClassifications(expected, actual);
        }

        public verifySyntacticClassifications(expected: { classificationType: string; text: string }[]) {
            const actual = this.languageService.getSyntacticClassifications(this.activeFile.fileName,
                ts.createTextSpan(0, this.activeFile.content.length));

            this.verifyClassifications(expected, actual);
        }

        public verifyOutliningSpans(spans: TextSpan[]) {
            const actual = this.languageService.getOutliningSpans(this.activeFile.fileName);

            if (actual.length !== spans.length) {
                this.raiseError(`verifyOutliningSpans failed - expected total spans to be ${spans.length}, but was ${actual.length}`);
            }

            for (let i = 0; i < spans.length; i++) {
                const expectedSpan = spans[i];
                const actualSpan = actual[i];
                if (expectedSpan.start !== actualSpan.textSpan.start || expectedSpan.end !== ts.textSpanEnd(actualSpan.textSpan)) {
                    this.raiseError(`verifyOutliningSpans failed - span ${(i + 1)} expected: (${expectedSpan.start},${expectedSpan.end}),  actual: (${actualSpan.textSpan.start},${ts.textSpanEnd(actualSpan.textSpan)})`);
                }
            }
        }

        public verifyTodoComments(descriptors: string[], spans: TextSpan[]) {
            const actual = this.languageService.getTodoComments(this.activeFile.fileName,
                descriptors.map(d => { return { text: d, priority: 0 }; }));

            if (actual.length !== spans.length) {
                this.raiseError(`verifyTodoComments failed - expected total spans to be ${spans.length}, but was ${actual.length}`);
            }

            for (let i = 0; i < spans.length; i++) {
                const expectedSpan = spans[i];
                const actualComment = actual[i];
                const actualCommentSpan = ts.createTextSpan(actualComment.position, actualComment.message.length);

                if (expectedSpan.start !== actualCommentSpan.start || expectedSpan.end !== ts.textSpanEnd(actualCommentSpan)) {
                    this.raiseError(`verifyOutliningSpans failed - span ${(i + 1)} expected: (${expectedSpan.start},${expectedSpan.end}),  actual: (${actualCommentSpan.start},${ts.textSpanEnd(actualCommentSpan)})`);
                }
            }
        }

        public verifyDocCommentTemplate(expected?: ts.TextInsertion) {
            const name = "verifyDocCommentTemplate";
            const actual = this.languageService.getDocCommentTemplateAtPosition(this.activeFile.fileName, this.currentCaretPosition);

            if (expected === undefined) {
                if (actual) {
                    this.raiseError(name + " failed - expected no template but got {newText: \"" + actual.newText + "\" caretOffset: " + actual.caretOffset + "}");
                }

                return;
            }
            else {
                if (actual === undefined) {
                    this.raiseError(name + " failed - expected the template {newText: \"" + actual.newText + "\" caretOffset: " + actual.caretOffset + "} but got nothing instead");
                }

                if (actual.newText !== expected.newText) {
                    this.raiseError(name + " failed - expected insertion:\n" + this.clarifyNewlines(expected.newText) + "\nactual insertion:\n" + this.clarifyNewlines(actual.newText));
                }

                if (actual.caretOffset !== expected.caretOffset) {
                    this.raiseError(name + " failed - expected caretOffset: " + expected.caretOffset + ",\nactual caretOffset:" + actual.caretOffset);
                }
            }
        }

        private clarifyNewlines(str: string) {
            return str.replace(/\r?\n/g, lineEnding => {
                const representation = lineEnding === "\r\n" ? "CRLF" : "LF";
                return "# - " + representation + lineEnding;
            });
        }

        public verifyMatchingBracePosition(bracePosition: number, expectedMatchPosition: number) {
            const actual = this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, bracePosition);

            if (actual.length !== 2) {
                this.raiseError(`verifyMatchingBracePosition failed - expected result to contain 2 spans, but it had ${actual.length}`);
            }

            let actualMatchPosition = -1;
            if (bracePosition === actual[0].start) {
                actualMatchPosition = actual[1].start;
            }
            else if (bracePosition === actual[1].start) {
                actualMatchPosition = actual[0].start;
            }
            else {
                this.raiseError(`verifyMatchingBracePosition failed - could not find the brace position: ${bracePosition} in the returned list: (${actual[0].start},${ts.textSpanEnd(actual[0])}) and (${actual[1].start},${ts.textSpanEnd(actual[1])})`);
            }

            if (actualMatchPosition !== expectedMatchPosition) {
                this.raiseError(`verifyMatchingBracePosition failed - expected: ${actualMatchPosition},  actual: ${expectedMatchPosition}`);
            }
        }

        public verifyNoMatchingBracePosition(bracePosition: number) {
            const actual = this.languageService.getBraceMatchingAtPosition(this.activeFile.fileName, bracePosition);

            if (actual.length !== 0) {
                this.raiseError("verifyNoMatchingBracePosition failed - expected: 0 spans, actual: " + actual.length);
            }
        }

        /*
            Check number of navigationItems which match both searchValue and matchKind.
            Report an error if expected value and actual value do not match.
        */
        public verifyNavigationItemsCount(expected: number, searchValue: string, matchKind?: string) {
            const items = this.languageService.getNavigateToItems(searchValue);
            let actual = 0;
            let item: ts.NavigateToItem = null;

            // Count only the match that match the same MatchKind
            for (let i = 0; i < items.length; ++i) {
                item = items[i];
                if (!matchKind || item.matchKind === matchKind) {
                    actual++;
                }
            }

            if (expected !== actual) {
                this.raiseError(`verifyNavigationItemsCount failed - found: ${actual} navigation items, expected: ${expected}.`);
            }
        }

        /*
            Verify that returned navigationItems from getNavigateToItems have matched searchValue, matchKind, and kind.
            Report an error if getNavigateToItems does not find any matched searchValue.
        */
        public verifyNavigationItemsListContains(
            name: string,
            kind: string,
            searchValue: string,
            matchKind: string,
            fileName?: string,
            parentName?: string) {
            const items = this.languageService.getNavigateToItems(searchValue);

            if (!items || items.length === 0) {
                this.raiseError("verifyNavigationItemsListContains failed - found 0 navigation items, expected at least one.");
            }

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item && item.name === name && item.kind === kind &&
                    (matchKind === undefined || item.matchKind === matchKind) &&
                    (fileName === undefined || item.fileName === fileName) &&
                    (parentName === undefined || item.containerName === parentName)) {
                    return;
                }
            }

            // if there was an explicit match kind specified, then it should be validated.
            if (matchKind !== undefined) {
                const missingItem = { name: name, kind: kind, searchValue: searchValue, matchKind: matchKind, fileName: fileName, parentName: parentName };
                this.raiseError(`verifyNavigationItemsListContains failed - could not find the item: ${JSON.stringify(missingItem)} in the returned list: (${JSON.stringify(items)})`);
            }
        }

        public verifyGetScriptLexicalStructureListCount(expected: number) {
            const items = this.languageService.getNavigationBarItems(this.activeFile.fileName);
            const actual = this.getNavigationBarItemsCount(items);

            if (expected !== actual) {
                this.raiseError(`verifyGetScriptLexicalStructureListCount failed - found: ${actual} navigation items, expected: ${expected}.`);
            }
        }

        private getNavigationBarItemsCount(items: ts.NavigationBarItem[]) {
            let result = 0;
            if (items) {
                for (let i = 0, n = items.length; i < n; i++) {
                    result++;
                    result += this.getNavigationBarItemsCount(items[i].childItems);
                }
            }

            return result;
        }

        public verifyGetScriptLexicalStructureListContains(name: string, kind: string) {
            const items = this.languageService.getNavigationBarItems(this.activeFile.fileName);

            if (!items || items.length === 0) {
                this.raiseError("verifyGetScriptLexicalStructureListContains failed - found 0 navigation items, expected at least one.");
            }

            if (this.navigationBarItemsContains(items, name, kind)) {
                return;
            }

            const missingItem = { name: name, kind: kind };
            this.raiseError(`verifyGetScriptLexicalStructureListContains failed - could not find the item: ${JSON.stringify(missingItem)} in the returned list: (${JSON.stringify(items, null, " ")})`);
        }

        private navigationBarItemsContains(items: ts.NavigationBarItem[], name: string, kind: string) {
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item && item.text === name && item.kind === kind) {
                        return true;
                    }

                    if (this.navigationBarItemsContains(item.childItems, name, kind)) {
                        return true;
                    }
                }
            }

            return false;
        }

        public printNavigationItems(searchValue: string) {
            const items = this.languageService.getNavigateToItems(searchValue);
            const length = items && items.length;

            Harness.IO.log(`NavigationItems list (${length} items)`);

            for (let i = 0; i < length; i++) {
                const item = items[i];
                Harness.IO.log(`name: ${item.name}, kind: ${item.kind}, parentName: ${item.containerName}, fileName: ${item.fileName}`);
            }
        }

        public printScriptLexicalStructureItems() {
            const items = this.languageService.getNavigationBarItems(this.activeFile.fileName);
            const length = items && items.length;

            Harness.IO.log(`NavigationItems list (${length} items)`);

            for (let i = 0; i < length; i++) {
                const item = items[i];
                Harness.IO.log(`name: ${item.text}, kind: ${item.kind}`);
            }
        }

        private getOccurrencesAtCurrentPosition() {
            return this.languageService.getOccurrencesAtPosition(this.activeFile.fileName, this.currentCaretPosition);
        }

        public verifyOccurrencesAtPositionListContains(fileName: string, start: number, end: number, isWriteAccess?: boolean) {
            const occurrences = this.getOccurrencesAtCurrentPosition();

            if (!occurrences || occurrences.length === 0) {
                this.raiseError("verifyOccurrencesAtPositionListContains failed - found 0 references, expected at least one.");
            }

            for (const occurrence of occurrences) {
                if (occurrence && occurrence.fileName === fileName && occurrence.textSpan.start === start && ts.textSpanEnd(occurrence.textSpan) === end) {
                    if (typeof isWriteAccess !== "undefined" && occurrence.isWriteAccess !== isWriteAccess) {
                        this.raiseError(`verifyOccurrencesAtPositionListContains failed - item isWriteAccess value does not match, actual: ${occurrence.isWriteAccess}, expected: ${isWriteAccess}.`);
                    }
                    return;
                }
            }

            const missingItem = { fileName: fileName, start: start, end: end, isWriteAccess: isWriteAccess };
            this.raiseError(`verifyOccurrencesAtPositionListContains failed - could not find the item: ${JSON.stringify(missingItem)} in the returned list: (${JSON.stringify(occurrences)})`);
        }

        public verifyOccurrencesAtPositionListCount(expectedCount: number) {
            const occurrences = this.getOccurrencesAtCurrentPosition();
            const actualCount = occurrences ? occurrences.length : 0;
            if (expectedCount !== actualCount) {
                this.raiseError(`verifyOccurrencesAtPositionListCount failed - actual: ${actualCount}, expected:${expectedCount}`);
            }
        }

        private getDocumentHighlightsAtCurrentPosition(fileNamesToSearch: string[]) {
            const filesToSearch = fileNamesToSearch.map(name => ts.combinePaths(this.basePath, name));
            return this.languageService.getDocumentHighlights(this.activeFile.fileName, this.currentCaretPosition, filesToSearch);
        }

        public verifyDocumentHighlightsAtPositionListContains(fileName: string, start: number, end: number, fileNamesToSearch: string[], kind?: string) {
            const documentHighlights = this.getDocumentHighlightsAtCurrentPosition(fileNamesToSearch);

            if (!documentHighlights || documentHighlights.length === 0) {
                this.raiseError("verifyDocumentHighlightsAtPositionListContains failed - found 0 highlights, expected at least one.");
            }

            for (const documentHighlight of documentHighlights) {
                if (documentHighlight.fileName === fileName) {
                    const { highlightSpans } = documentHighlight;

                    for (const highlight of highlightSpans) {
                        if (highlight && highlight.textSpan.start === start && ts.textSpanEnd(highlight.textSpan) === end) {
                            if (typeof kind !== "undefined" && highlight.kind !== kind) {
                                this.raiseError(`verifyDocumentHighlightsAtPositionListContains failed - item "kind" value does not match, actual: ${highlight.kind}, expected: ${kind}.`);
                            }
                            return;
                        }
                    }
                }
            }

            const missingItem = { fileName: fileName, start: start, end: end, kind: kind };
            this.raiseError(`verifyDocumentHighlightsAtPositionListContains failed - could not find the item: ${JSON.stringify(missingItem)} in the returned list: (${JSON.stringify(documentHighlights)})`);
        }

        public verifyDocumentHighlightsAtPositionListCount(expectedCount: number, fileNamesToSearch: string[]) {
            const documentHighlights = this.getDocumentHighlightsAtCurrentPosition(fileNamesToSearch);
            const actualCount = documentHighlights
                ? documentHighlights.reduce((currentCount, { highlightSpans }) => currentCount + highlightSpans.length, 0)
                : 0;

            if (expectedCount !== actualCount) {
                this.raiseError("verifyDocumentHighlightsAtPositionListCount failed - actual: " + actualCount + ", expected:" + expectedCount);
            }
        }

        // Get the text of the entire line the caret is currently at
        private getCurrentLineContent() {
            const text = this.getFileContent(this.activeFile.fileName);

            const pos = this.currentCaretPosition;
            let startPos = pos, endPos = pos;

            while (startPos > 0) {
                const ch = text.charCodeAt(startPos - 1);
                if (ch === ts.CharacterCodes.carriageReturn || ch === ts.CharacterCodes.lineFeed) {
                    break;
                }

                startPos--;
            }

            while (endPos < text.length) {
                const ch = text.charCodeAt(endPos);

                if (ch === ts.CharacterCodes.carriageReturn || ch === ts.CharacterCodes.lineFeed) {
                    break;
                }

                endPos++;
            }

            return text.substring(startPos, endPos);
        }

        private assertItemInCompletionList(items: ts.CompletionEntry[], name: string, text?: string, documentation?: string, kind?: string) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.name === name) {
                    if (documentation != undefined || text !== undefined) {
                        const details = this.getCompletionEntryDetails(item.name);

                        if (documentation !== undefined) {
                            assert.equal(ts.displayPartsToString(details.documentation), documentation, this.assertionMessageAtLastKnownMarker("completion item documentation for " + name));
                        }
                        if (text !== undefined) {
                            assert.equal(ts.displayPartsToString(details.displayParts), text, this.assertionMessageAtLastKnownMarker("completion item detail text for " + name));
                        }
                    }

                    if (kind !== undefined) {
                        assert.equal(item.kind, kind, this.assertionMessageAtLastKnownMarker("completion item kind for " + name));
                    }

                    return;
                }
            }

            const itemsString = items.map((item) => JSON.stringify({ name: item.name, kind: item.kind })).join(",\n");

            this.raiseError(`Expected "${JSON.stringify({ name, text, documentation, kind })}" to be in list [${itemsString}]`);
        }

        private findFile(indexOrName: any) {
            let result: FourSlashFile = null;
            if (typeof indexOrName === "number") {
                const index = <number>indexOrName;
                if (index >= this.testData.files.length) {
                    throw new Error(`File index (${index}) in openFile was out of range. There are only ${this.testData.files.length} files in this test.`);
                }
                else {
                    result = this.testData.files[index];
                }
            }
            else if (typeof indexOrName === "string") {
                let name = <string>indexOrName;

                // names are stored in the compiler with this relative path, this allows people to use goTo.file on just the fileName
                name = name.indexOf("/") === -1 ? (this.basePath + "/" + name) : name;

                const availableNames: string[] = [];
                let foundIt = false;
                for (let i = 0; i < this.testData.files.length; i++) {
                    const fn = this.testData.files[i].fileName;
                    if (fn) {
                        if (fn === name) {
                            result = this.testData.files[i];
                            foundIt = true;
                            break;
                        }
                        availableNames.push(fn);
                    }
                }

                if (!foundIt) {
                    throw new Error(`No test file named "${name}" exists. Available file names are: ${availableNames.join(", ")}`);
                }
            }
            else {
                throw new Error("Unknown argument type");
            }

            return result;
        }

        private getLineColStringAtPosition(position: number) {
            const pos = this.languageServiceAdapterHost.positionToLineAndCharacter(this.activeFile.fileName, position);
            return `line ${(pos.line + 1)}, col ${pos.character}`;
        }

        public getMarkerByName(markerName: string) {
            const markerPos = this.testData.markerPositions[markerName];
            if (markerPos === undefined) {
                const markerNames: string[] = [];
                for (const m in this.testData.markerPositions) markerNames.push(m);
                throw new Error(`Unknown marker "${markerName}" Available markers: ${markerNames.map(m => "\"" + m + "\"").join(", ")}`);
            }
            else {
                return markerPos;
            }
        }

        private static makeWhitespaceVisible(text: string) {
            return text.replace(/ /g, "\u00B7").replace(/\r/g, "\u00B6").replace(/\n/g, "\u2193\n").replace(/\t/g, "\u2192\   ");
        }

        public setCancelled(numberOfCalls: number): void {
            this.cancellationToken.setCancelled(numberOfCalls);
        }

        public resetCancelled(): void {
            this.cancellationToken.resetCancelled();
        }
    }

    // TOOD: should these just use the Harness's stdout/stderr?
    const fsOutput = new Harness.Compiler.WriterAggregator();
    const fsErrors = new Harness.Compiler.WriterAggregator();
    export function runFourSlashTest(basePath: string, testType: FourSlashTestType, fileName: string) {
        const content = Harness.IO.readFile(fileName);
        runFourSlashTestContent(basePath, testType, content, fileName);
    }

    export function runFourSlashTestContent(basePath: string, testType: FourSlashTestType, content: string, fileName: string): void {
        // Parse out the files and their metadata
        const testData = parseTestData(basePath, content, fileName);

        const state = new TestState(basePath, testType, testData);

        let result = "";
        const fourslashFile: Harness.Compiler.TestFile = {
            unitName: Harness.Compiler.fourslashFileName,
            content: undefined,
        };
        const testFile: Harness.Compiler.TestFile = {
            unitName: fileName,
            content: content
        };

        const host = Harness.Compiler.createCompilerHost(
            [ fourslashFile, testFile ],
            (fn, contents) => result = contents,
            ts.ScriptTarget.Latest,
            Harness.IO.useCaseSensitiveFileNames(),
            Harness.IO.getCurrentDirectory());

        const program = ts.createProgram([Harness.Compiler.fourslashFileName, fileName], { outFile: "fourslashTestOutput.js", noResolve: true, target: ts.ScriptTarget.ES3 }, host);

        const sourceFile = host.getSourceFile(fileName, ts.ScriptTarget.ES3);

        const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
        if (diagnostics.length > 0) {
            throw new Error(`Error compiling ${fileName}: ` +
                diagnostics.map(e => ts.flattenDiagnosticMessageText(e.messageText, Harness.IO.newLine())).join("\r\n"));
        }

        program.emit(sourceFile);

        ts.Debug.assert(!!result);
        runCode(result, state);
    }

    function runCode(code: string, state: TestState): void {
        // Compile and execute the test
        const wrappedCode =
`(function(test, goTo, verify, edit, debug, format, cancellation, classification, verifyOperationIsCancelled) {
${code}
})`;
        try {
            const test = new FourSlashInterface.Test(state);
            const goTo = new FourSlashInterface.GoTo(state);
            const verify = new FourSlashInterface.Verify(state);
            const edit = new FourSlashInterface.Edit(state);
            const debug = new FourSlashInterface.Debug(state);
            const format = new FourSlashInterface.Format(state);
            const cancellation = new FourSlashInterface.Cancellation(state);
            const f = eval(wrappedCode);
            f(test, goTo, verify, edit, debug, format, cancellation, FourSlashInterface.Classification, FourSlash.verifyOperationIsCancelled);
        }
        catch (err) {
            // Debugging: FourSlash.currentTestState.printCurrentFileState();
            throw err;
        }
    }

    function chompLeadingSpace(content: string) {
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            if ((lines[i].length !== 0) && (lines[i].charAt(0) !== " ")) {
                return content;
            }
        }

        return lines.map(s => s.substr(1)).join("\n");
    }

    function parseTestData(basePath: string, contents: string, fileName: string): FourSlashData {
        // Regex for parsing options in the format "@Alpha: Value of any sort"
        const optionRegex = /^\s*@(\w+): (.*)\s*/;

        // List of all the subfiles we've parsed out
        const files: FourSlashFile[] = [];
        // Global options
        const globalOptions: { [s: string]: string; } = {};
        // Marker positions

        // Split up the input file by line
        // Note: IE JS engine incorrectly handles consecutive delimiters here when using RegExp split, so
        // we have to string-based splitting instead and try to figure out the delimiting chars
        const lines = contents.split("\n");

        const markerPositions: MarkerMap = {};
        const markers: Marker[] = [];
        const ranges: Range[] = [];

        // Stuff related to the subfile we're parsing
        let currentFileContent: string = null;
        let currentFileName = fileName;
        let currentFileOptions: { [s: string]: string } = {};

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const lineLength = line.length;

            if (lineLength > 0 && line.charAt(lineLength - 1) === "\r") {
                line = line.substr(0, lineLength - 1);
            }

            if (line.substr(0, 4) === "////") {
                // Subfile content line

                // Append to the current subfile content, inserting a newline needed
                if (currentFileContent === null) {
                    currentFileContent = "";
                }
                else {
                    // End-of-line
                    currentFileContent = currentFileContent + "\n";
                }

                currentFileContent = currentFileContent + line.substr(4);
            }
            else if (line.substr(0, 2) === "//") {
                // Comment line, check for global/file @options and record them
                const match = optionRegex.exec(line.substr(2));
                if (match) {
                    const fileMetadataNamesIndex = fileMetadataNames.indexOf(match[1]);
                    if (fileMetadataNamesIndex === -1) {
                        // Check if the match is already existed in the global options
                        if (globalOptions[match[1]] !== undefined) {
                            throw new Error("Global Option : '" + match[1] + "' is already existed");
                        }
                        globalOptions[match[1]] = match[2];
                    }
                    else {
                        if (fileMetadataNamesIndex === fileMetadataNames.indexOf(metadataOptionNames.fileName)) {
                            // Found an @FileName directive, if this is not the first then create a new subfile
                            if (currentFileContent) {
                                const file = parseFileContent(currentFileContent, currentFileName, markerPositions, markers, ranges);
                                file.fileOptions = currentFileOptions;

                                // Store result file
                                files.push(file);

                                // Reset local data
                                currentFileContent = null;
                                currentFileOptions = {};
                                currentFileName = fileName;
                            }

                            currentFileName = basePath + "/" + match[2];
                            currentFileOptions[match[1]] = match[2];
                        }
                        else {
                            // Add other fileMetadata flag
                            currentFileOptions[match[1]] = match[2];
                        }
                    }
                }
            // TODO: should be '==='?
            }
            else if (line == "" || lineLength === 0) {
                // Previously blank lines between fourslash content caused it to be considered as 2 files,
                // Remove this behavior since it just causes errors now
            }
            else {
                // Empty line or code line, terminate current subfile if there is one
                if (currentFileContent) {
                    const file = parseFileContent(currentFileContent, currentFileName, markerPositions, markers, ranges);
                    file.fileOptions = currentFileOptions;

                    // Store result file
                    files.push(file);

                    // Reset local data
                    currentFileContent = null;
                    currentFileOptions = {};
                    currentFileName = fileName;
                }
            }
        }

        // @Filename is the only directive that can be used in a test that contains tsconfig.json file.
        if (containTSConfigJson(files)) {
            let directive = getNonFileNameOptionInFileList(files);
            if (!directive) {
                directive = getNonFileNameOptionInObject(globalOptions);
            }
            if (directive) {
                throw Error("It is not allowed to use tsconfig.json along with directive '" + directive + "'");
            }
        }

        return {
            markerPositions,
            markers,
            globalOptions,
            files,
            ranges
        };
    }

    function containTSConfigJson(files: FourSlashFile[]): boolean {
        return ts.forEach(files, f => f.fileOptions["Filename"] === "tsconfig.json");
    }

    function getNonFileNameOptionInFileList(files: FourSlashFile[]): string {
        return ts.forEach(files, f => getNonFileNameOptionInObject(f.fileOptions));
    }

    function getNonFileNameOptionInObject(optionObject: { [s: string]: string }): string {
        for (const option in optionObject) {
            if (option !== metadataOptionNames.fileName) {
                return option;
            }
        }
        return undefined;
    }

    const enum State {
        none,
        inSlashStarMarker,
        inObjectMarker
    }

    function reportError(fileName: string, line: number, col: number, message: string) {
        const errorMessage = fileName + "(" + line + "," + col + "): " + message;
        throw new Error(errorMessage);
    }

    function recordObjectMarker(fileName: string, location: LocationInformation, text: string, markerMap: MarkerMap, markers: Marker[]): Marker {
        let markerValue: any = undefined;
        try {
            // Attempt to parse the marker value as JSON
            markerValue = JSON.parse("{ " + text + " }");
        }
        catch (e) {
            reportError(fileName, location.sourceLine, location.sourceColumn, "Unable to parse marker text " + e.message);
        }

        if (markerValue === undefined) {
            reportError(fileName, location.sourceLine, location.sourceColumn, "Object markers can not be empty");
            return null;
        }

        const marker: Marker = {
            fileName: fileName,
            position: location.position,
            data: markerValue
        };

        // Object markers can be anonymous
        if (markerValue.name) {
            markerMap[markerValue.name] = marker;
        }

        markers.push(marker);

        return marker;
    }

    function recordMarker(fileName: string, location: LocationInformation, name: string, markerMap: MarkerMap, markers: Marker[]): Marker {
        const marker: Marker = {
            fileName: fileName,
            position: location.position
        };

        // Verify markers for uniqueness
        if (markerMap[name] !== undefined) {
            const message = "Marker '" + name + "' is duplicated in the source file contents.";
            reportError(marker.fileName, location.sourceLine, location.sourceColumn, message);
            return null;
        }
        else {
            markerMap[name] = marker;
            markers.push(marker);
            return marker;
        }
    }

    function parseFileContent(content: string, fileName: string, markerMap: MarkerMap, markers: Marker[], ranges: Range[]): FourSlashFile {
        content = chompLeadingSpace(content);

        // Any slash-star comment with a character not in this string is not a marker.
        const validMarkerChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$1234567890_";

        /// The file content (minus metacharacters) so far
        let output = "";

        /// The current marker (or maybe multi-line comment?) we're parsing, possibly
        let openMarker: LocationInformation = null;

        /// A stack of the open range markers that are still unclosed
        const openRanges: RangeLocationInformation[] = [];

        /// A list of ranges we've collected so far */
        let localRanges: Range[] = [];

        /// The latest position of the start of an unflushed plain text area
        let lastNormalCharPosition = 0;

        /// The total number of metacharacters removed from the file (so far)
        let difference = 0;

        /// The fourslash file state object we are generating
        let state: State = State.none;

        /// Current position data
        let line = 1;
        let column = 1;

        const flush = (lastSafeCharIndex: number) => {
            if (lastSafeCharIndex === undefined) {
                output = output + content.substr(lastNormalCharPosition);
            }
            else {
                output = output + content.substr(lastNormalCharPosition, lastSafeCharIndex - lastNormalCharPosition);
            }
        };

        if (content.length > 0) {
            let previousChar = content.charAt(0);
            for (let i = 1; i < content.length; i++) {
                const currentChar = content.charAt(i);
                switch (state) {
                    case State.none:
                        if (previousChar === "[" && currentChar === "|") {
                            // found a range start
                            openRanges.push({
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column,
                            });
                            // copy all text up to marker position
                            flush(i - 1);
                            lastNormalCharPosition = i + 1;
                            difference += 2;
                        }
                        else if (previousChar === "|" && currentChar === "]") {
                            // found a range end
                            const rangeStart = openRanges.pop();
                            if (!rangeStart) {
                                reportError(fileName, line, column, "Found range end with no matching start.");
                            }

                            const range: Range = {
                                fileName: fileName,
                                start: rangeStart.position,
                                end: (i - 1) - difference,
                                marker: rangeStart.marker
                            };
                            localRanges.push(range);

                            // copy all text up to range marker position
                            flush(i - 1);
                            lastNormalCharPosition = i + 1;
                            difference += 2;
                        }
                        else if (previousChar === "/" && currentChar === "*") {
                            // found a possible marker start
                            state = State.inSlashStarMarker;
                            openMarker = {
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column,
                            };
                        }
                        else if (previousChar === "{" && currentChar === "|") {
                            // found an object marker start
                            state = State.inObjectMarker;
                            openMarker = {
                                position: (i - 1) - difference,
                                sourcePosition: i - 1,
                                sourceLine: line,
                                sourceColumn: column,
                            };
                            flush(i - 1);
                        }
                        break;

                    case State.inObjectMarker:
                        // Object markers are only ever terminated by |} and have no content restrictions
                        if (previousChar === "|" && currentChar === "}") {
                            // Record the marker
                            const objectMarkerNameText = content.substring(openMarker.sourcePosition + 2, i - 1).trim();
                            const marker = recordObjectMarker(fileName, openMarker, objectMarkerNameText, markerMap, markers);

                            if (openRanges.length > 0) {
                                openRanges[openRanges.length - 1].marker = marker;
                            }

                            // Set the current start to point to the end of the current marker to ignore its text
                            lastNormalCharPosition = i + 1;
                            difference += i + 1 - openMarker.sourcePosition;

                            // Reset the state
                            openMarker = null;
                            state = State.none;
                        }
                        break;

                    case State.inSlashStarMarker:
                        if (previousChar === "*" && currentChar === "/") {
                            // Record the marker
                            // start + 2 to ignore the */, -1 on the end to ignore the * (/ is next)
                            const markerNameText = content.substring(openMarker.sourcePosition + 2, i - 1).trim();
                            const marker = recordMarker(fileName, openMarker, markerNameText, markerMap, markers);

                            if (openRanges.length > 0) {
                                openRanges[openRanges.length - 1].marker = marker;
                            }

                            // Set the current start to point to the end of the current marker to ignore its text
                            flush(openMarker.sourcePosition);
                            lastNormalCharPosition = i + 1;
                            difference += i + 1 - openMarker.sourcePosition;

                            // Reset the state
                            openMarker = null;
                            state = State.none;
                        }
                        else if (validMarkerChars.indexOf(currentChar) < 0) {
                            if (currentChar === "*" && i < content.length - 1 && content.charAt(i + 1) === "/") {
                                // The marker is about to be closed, ignore the 'invalid' char
                            }
                            else {
                                // We've hit a non-valid marker character, so we were actually in a block comment
                                // Bail out the text we've gathered so far back into the output
                                flush(i);
                                lastNormalCharPosition = i;
                                openMarker = null;

                                state = State.none;
                            }
                        }
                        break;
                }

                if (currentChar === "\n" && previousChar === "\r") {
                    // Ignore trailing \n after a \r
                    continue;
                }
                else if (currentChar === "\n" || currentChar === "\r") {
                    line++;
                    column = 1;
                    continue;
                }

                column++;
                previousChar = currentChar;
            }
        }

        // Add the remaining text
        flush(undefined);

        if (openRanges.length > 0) {
            const openRange = openRanges[0];
            reportError(fileName, openRange.sourceLine, openRange.sourceColumn, "Unterminated range.");
        }

        if (openMarker !== null) {
            reportError(fileName, openMarker.sourceLine, openMarker.sourceColumn, "Unterminated marker.");
        }

        // put ranges in the correct order
        localRanges = localRanges.sort((a, b) => a.start < b.start ? -1 : 1);
        localRanges.forEach((r) => { ranges.push(r); });

        return {
            content: output,
            fileOptions: {},
            version: 0,
            fileName: fileName
        };
    }
}

namespace FourSlashInterface {
    export class Test {
        constructor(private state: FourSlash.TestState) {
        }

        public markers(): FourSlash.Marker[] {
            return this.state.getMarkers();
        }

        public marker(name?: string): FourSlash.Marker {
            return this.state.getMarkerByName(name);
        }

        public ranges(): FourSlash.Range[] {
            return this.state.getRanges();
        }

        public markerByName(s: string): FourSlash.Marker {
            return this.state.getMarkerByName(s);
        }
    }

    export class GoTo {
        constructor(private state: FourSlash.TestState) {
        }
        // Moves the caret to the specified marker,
        // or the anonymous marker ('/**/') if no name
        // is given
        public marker(name?: string) {
            this.state.goToMarker(name);
        }

        public bof() {
            this.state.goToBOF();
        }

        public eof() {
            this.state.goToEOF();
        }

        public definition(definitionIndex = 0) {
            this.state.goToDefinition(definitionIndex);
        }

        public type(definitionIndex = 0) {
            this.state.goToTypeDefinition(definitionIndex);
        }

        public position(position: number, fileIndex?: number): void;
        public position(position: number, fileName?: string): void;
        public position(position: number, fileNameOrIndex?: any): void {
            if (fileNameOrIndex !== undefined) {
                this.file(fileNameOrIndex);
            }
            this.state.goToPosition(position);
        }

        // Opens a file, given either its index as it
        // appears in the test source, or its filename
        // as specified in the test metadata
        public file(index: number, content?: string): void;
        public file(name: string, content?: string): void;
        public file(indexOrName: any, content?: string): void {
            this.state.openFile(indexOrName, content);
        }
    }

    export class VerifyNegatable {
        public not: VerifyNegatable;

        constructor(protected state: FourSlash.TestState, private negative = false) {
            if (!negative) {
                this.not = new VerifyNegatable(state, true);
            }
        }

        // Verifies the member list contains the specified symbol. The
        // member list is brought up if necessary
        public memberListContains(symbol: string, text?: string, documenation?: string, kind?: string) {
            if (this.negative) {
                this.state.verifyMemberListDoesNotContain(symbol);
            }
            else {
                this.state.verifyMemberListContains(symbol, text, documenation, kind);
            }
        }

        public memberListCount(expectedCount: number) {
            this.state.verifyMemberListCount(expectedCount, this.negative);
        }

        // Verifies the completion list contains the specified symbol. The
        // completion list is brought up if necessary
        public completionListContains(symbol: string, text?: string, documentation?: string, kind?: string) {
            if (this.negative) {
                this.state.verifyCompletionListDoesNotContain(symbol, text, documentation, kind);
            }
            else {
                this.state.verifyCompletionListContains(symbol, text, documentation, kind);
            }
        }

        // Verifies the completion list items count to be greater than the specified amount. The
        // completion list is brought up if necessary
        public completionListItemsCountIsGreaterThan(count: number) {
            this.state.verifyCompletionListItemsCountIsGreaterThan(count, this.negative);
        }

        public completionListIsEmpty() {
            this.state.verifyCompletionListIsEmpty(this.negative);
        }

        public completionListAllowsNewIdentifier() {
            this.state.verifyCompletionListAllowsNewIdentifier(this.negative);
        }

        public memberListIsEmpty() {
            this.state.verifyMemberListIsEmpty(this.negative);
        }

        public referencesCountIs(count: number) {
            this.state.verifyReferencesCountIs(count, /*localFilesOnly*/ false);
        }

        public referencesAtPositionContains(range: FourSlash.Range, isWriteAccess?: boolean) {
            this.state.verifyReferencesAtPositionListContains(range.fileName, range.start, range.end, isWriteAccess);
        }

        public signatureHelpPresent() {
            this.state.verifySignatureHelpPresent(!this.negative);
        }

        public errorExistsBetweenMarkers(startMarker: string, endMarker: string) {
            this.state.verifyErrorExistsBetweenMarkers(startMarker, endMarker, !this.negative);
        }

        public errorExistsAfterMarker(markerName = "") {
            this.state.verifyErrorExistsAfterMarker(markerName, !this.negative, /*after*/ true);
        }

        public errorExistsBeforeMarker(markerName = "") {
            this.state.verifyErrorExistsAfterMarker(markerName, !this.negative, /*after*/ false);
        }

        public quickInfoIs(expectedText?: string, expectedDocumentation?: string) {
            this.state.verifyQuickInfoString(this.negative, expectedText, expectedDocumentation);
        }

        public quickInfoExists() {
            this.state.verifyQuickInfoExists(this.negative);
        }

        public definitionCountIs(expectedCount: number) {
            this.state.verifyDefinitionsCount(this.negative, expectedCount);
        }

        public typeDefinitionCountIs(expectedCount: number) {
            this.state.verifyTypeDefinitionsCount(this.negative, expectedCount);
        }

        public definitionLocationExists() {
            this.state.verifyDefinitionLocationExists(this.negative);
        }

        public verifyDefinitionsName(name: string, containerName: string) {
            this.state.verifyDefinitionsName(this.negative, name, containerName);
        }
    }

    export class Verify extends VerifyNegatable {
        constructor(state: FourSlash.TestState) {
            super(state);
        }

        public caretAtMarker(markerName?: string) {
            this.state.verifyCaretAtMarker(markerName);
        }

        public indentationIs(numberOfSpaces: number) {
            this.state.verifyIndentationAtCurrentPosition(numberOfSpaces);
        }

        public indentationAtPositionIs(fileName: string, position: number, numberOfSpaces: number, indentStyle = ts.IndentStyle.Smart) {
            this.state.verifyIndentationAtPosition(fileName, position, numberOfSpaces, indentStyle);
        }

        public textAtCaretIs(text: string) {
            this.state.verifyTextAtCaretIs(text);
        }

        /**
         * Compiles the current file and evaluates 'expr' in a context containing
         * the emitted output, then compares (using ===) the result of that expression
         * to 'value'. Do not use this function with external modules as it is not supported.
         */
        public eval(expr: string, value: any) {
            this.state.verifyEval(expr, value);
        }

        public currentLineContentIs(text: string) {
            this.state.verifyCurrentLineContent(text);
        }

        public currentFileContentIs(text: string) {
            this.state.verifyCurrentFileContent(text);
        }

        public verifyGetEmitOutputForCurrentFile(expected: string): void {
            this.state.verifyGetEmitOutputForCurrentFile(expected);
        }

        public verifyGetEmitOutputContentsForCurrentFile(expected: ts.OutputFile[]): void {
            this.state.verifyGetEmitOutputContentsForCurrentFile(expected);
        }

        public currentParameterHelpArgumentNameIs(name: string) {
            this.state.verifyCurrentParameterHelpName(name);
        }

        public currentParameterSpanIs(parameter: string) {
            this.state.verifyCurrentParameterSpanIs(parameter);
        }

        public currentParameterHelpArgumentDocCommentIs(docComment: string) {
            this.state.verifyCurrentParameterHelpDocComment(docComment);
        }

        public currentSignatureHelpDocCommentIs(docComment: string) {
            this.state.verifyCurrentSignatureHelpDocComment(docComment);
        }

        public signatureHelpCountIs(expected: number) {
            this.state.verifySignatureHelpCount(expected);
        }

        public signatureHelpArgumentCountIs(expected: number) {
            this.state.verifySignatureHelpArgumentCount(expected);
        }

        public currentSignatureParameterCountIs(expected: number) {
            this.state.verifyCurrentSignatureHelpParameterCount(expected);
        }

        public currentSignatureHelpIs(expected: string) {
            this.state.verifyCurrentSignatureHelpIs(expected);
        }

        public numberOfErrorsInCurrentFile(expected: number) {
            this.state.verifyNumberOfErrorsInCurrentFile(expected);
        }

        public baselineCurrentFileBreakpointLocations() {
            this.state.baselineCurrentFileBreakpointLocations();
        }

        public baselineCurrentFileNameOrDottedNameSpans() {
            this.state.baselineCurrentFileNameOrDottedNameSpans();
        }

        public baselineGetEmitOutput() {
            this.state.baselineGetEmitOutput();
        }

        public nameOrDottedNameSpanTextIs(text: string) {
            this.state.verifyCurrentNameOrDottedNameSpanText(text);
        }

        public outliningSpansInCurrentFile(spans: FourSlash.TextSpan[]) {
            this.state.verifyOutliningSpans(spans);
        }

        public todoCommentsInCurrentFile(descriptors: string[]) {
            this.state.verifyTodoComments(descriptors, this.state.getRanges());
        }

        public matchingBracePositionInCurrentFile(bracePosition: number, expectedMatchPosition: number) {
            this.state.verifyMatchingBracePosition(bracePosition, expectedMatchPosition);
        }

        public noMatchingBracePositionInCurrentFile(bracePosition: number) {
            this.state.verifyNoMatchingBracePosition(bracePosition);
        }

        public DocCommentTemplate(expectedText: string, expectedOffset: number, empty?: boolean) {
            this.state.verifyDocCommentTemplate(empty ? undefined : { newText: expectedText, caretOffset: expectedOffset });
        }

        public noDocCommentTemplate() {
            this.DocCommentTemplate(/*expectedText*/ undefined, /*expectedOffset*/ undefined, /*empty*/ true);
        }

        public getScriptLexicalStructureListCount(count: number) {
            this.state.verifyGetScriptLexicalStructureListCount(count);
        }

        // TODO: figure out what to do with the unused arguments.
        public getScriptLexicalStructureListContains(
            name: string,
            kind: string,
            fileName?: string,
            parentName?: string,
            isAdditionalSpan?: boolean,
            markerPosition?: number) {
            this.state.verifyGetScriptLexicalStructureListContains(name, kind);
        }

        public navigationItemsListCount(count: number, searchValue: string, matchKind?: string) {
            this.state.verifyNavigationItemsCount(count, searchValue, matchKind);
        }

        public navigationItemsListContains(
            name: string,
            kind: string,
            searchValue: string,
            matchKind: string,
            fileName?: string,
            parentName?: string) {
            this.state.verifyNavigationItemsListContains(
                name,
                kind,
                searchValue,
                matchKind,
                fileName,
                parentName);
        }

        public occurrencesAtPositionContains(range: FourSlash.Range, isWriteAccess?: boolean) {
            this.state.verifyOccurrencesAtPositionListContains(range.fileName, range.start, range.end, isWriteAccess);
        }

        public occurrencesAtPositionCount(expectedCount: number) {
            this.state.verifyOccurrencesAtPositionListCount(expectedCount);
        }

        public documentHighlightsAtPositionContains(range: FourSlash.Range, fileNamesToSearch: string[], kind?: string) {
            this.state.verifyDocumentHighlightsAtPositionListContains(range.fileName, range.start, range.end, fileNamesToSearch, kind);
        }

        public documentHighlightsAtPositionCount(expectedCount: number, fileNamesToSearch: string[]) {
            this.state.verifyDocumentHighlightsAtPositionListCount(expectedCount, fileNamesToSearch);
        }

        public completionEntryDetailIs(entryName: string, text: string, documentation?: string, kind?: string) {
            this.state.verifyCompletionEntryDetails(entryName, text, documentation, kind);
        }

        /**
         * This method *requires* a contiguous, complete, and ordered stream of classifications for a file.
         */
        public syntacticClassificationsAre(...classifications: { classificationType: string; text: string }[]) {
            this.state.verifySyntacticClassifications(classifications);
        }

        /**
         * This method *requires* an ordered stream of classifications for a file, and spans are highly recommended.
         */
        public semanticClassificationsAre(...classifications: { classificationType: string; text: string; textSpan?: FourSlash.TextSpan }[]) {
            this.state.verifySemanticClassifications(classifications);
        }

        public renameInfoSucceeded(displayName?: string, fullDisplayName?: string, kind?: string, kindModifiers?: string) {
            this.state.verifyRenameInfoSucceeded(displayName, fullDisplayName, kind, kindModifiers);
        }

        public renameInfoFailed(message?: string) {
            this.state.verifyRenameInfoFailed(message);
        }

        public renameLocations(findInStrings: boolean, findInComments: boolean) {
            this.state.verifyRenameLocations(findInStrings, findInComments);
        }

        public verifyQuickInfoDisplayParts(kind: string, kindModifiers: string, textSpan: { start: number; length: number; },
            displayParts: ts.SymbolDisplayPart[], documentation: ts.SymbolDisplayPart[]) {
            this.state.verifyQuickInfoDisplayParts(kind, kindModifiers, textSpan, displayParts, documentation);
        }

        public getSyntacticDiagnostics(expected: string) {
            this.state.getSyntacticDiagnostics(expected);
        }

        public getSemanticDiagnostics(expected: string) {
            this.state.getSemanticDiagnostics(expected);
        }

        public ProjectInfo(expected: string []) {
            this.state.verifyProjectInfo(expected);
        }
    }

    export class Edit {
        constructor(private state: FourSlash.TestState) {
        }
        public backspace(count?: number) {
            this.state.deleteCharBehindMarker(count);
        }

        public deleteAtCaret(times?: number) {
            this.state.deleteChar(times);
        }

        public replace(start: number, length: number, text: string) {
            this.state.replace(start, length, text);
        }

        public paste(text: string) {
            this.state.paste(text);
        }

        public insert(text: string) {
            this.insertLines(text);
        }

        public insertLine(text: string) {
            this.insertLines(text + "\n");
        }

        public insertLines(...lines: string[]) {
            this.state.type(lines.join("\n"));
        }

        public moveRight(count?: number) {
            this.state.moveCaretRight(count);
        }

        public moveLeft(count?: number) {
            if (typeof count === "undefined") {
                count = 1;
            }
            this.state.moveCaretRight(count * -1);
        }

        public enableFormatting() {
            this.state.enableFormatting = true;
        }

        public disableFormatting() {
            this.state.enableFormatting = false;
        }
    }

    export class Debug {
        constructor(private state: FourSlash.TestState) {
        }

        public printCurrentParameterHelp() {
            this.state.printCurrentParameterHelp();
        }

        public printCurrentFileState() {
            this.state.printCurrentFileState();
        }

        public printCurrentFileStateWithWhitespace() {
            this.state.printCurrentFileState(/*makeWhitespaceVisible*/true);
        }

        public printCurrentFileStateWithoutCaret() {
            this.state.printCurrentFileState(/*makeWhitespaceVisible*/false, /*makeCaretVisible*/false);
        }

        public printCurrentQuickInfo() {
            this.state.printCurrentQuickInfo();
        }

        public printCurrentSignatureHelp() {
            this.state.printCurrentSignatureHelp();
        }

        public printMemberListMembers() {
            this.state.printMemberListMembers();
        }

        public printCompletionListMembers() {
            this.state.printCompletionListMembers();
        }

        public printBreakpointLocation(pos: number) {
            this.state.printBreakpointLocation(pos);
        }
        public printBreakpointAtCurrentLocation() {
            this.state.printBreakpointAtCurrentLocation();
        }

        public printNameOrDottedNameSpans(pos: number) {
            this.state.printNameOrDottedNameSpans(pos);
        }

        public printErrorList() {
            this.state.printErrorList();
        }

        public printNavigationItems(searchValue = ".*") {
            this.state.printNavigationItems(searchValue);
        }

        public printScriptLexicalStructureItems() {
            this.state.printScriptLexicalStructureItems();
        }

        public printReferences() {
            this.state.printReferences();
        }

        public printContext() {
            this.state.printContext();
        }
    }

    export class Format {
        constructor(private state: FourSlash.TestState) {
        }

        public document() {
            this.state.formatDocument();
        }

        public copyFormatOptions(): ts.FormatCodeOptions {
            return this.state.copyFormatOptions();
        }

        public setFormatOptions(options: ts.FormatCodeOptions) {
            return this.state.setFormatOptions(options);
        }

        public selection(startMarker: string, endMarker: string) {
            this.state.formatSelection(this.state.getMarkerByName(startMarker).position, this.state.getMarkerByName(endMarker).position);
        }

        public setOption(name: string, value: number): void;
        public setOption(name: string, value: string): void;
        public setOption(name: string, value: boolean): void;
        public setOption(name: string, value: any): void {
            this.state.formatCodeOptions[name] = value;
        }
    }

    export class Cancellation {
        constructor(private state: FourSlash.TestState) {
        }

        public resetCancelled() {
            this.state.resetCancelled();
        }

        public setCancelled(numberOfCalls = 0) {
            this.state.setCancelled(numberOfCalls);
        }
    }

    export namespace Classification {
        export function comment(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("comment", text, position);
        }

        export function identifier(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("identifier", text, position);
        }

        export function keyword(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("keyword", text, position);
        }

        export function numericLiteral(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("numericLiteral", text, position);
        }

        export function operator(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("operator", text, position);
        }

        export function stringLiteral(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("stringLiteral", text, position);
        }

        export function whiteSpace(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("whiteSpace", text, position);
        }

        export function text(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("text", text, position);
        }

        export function punctuation(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("punctuation", text, position);
        }

        export function docCommentTagName(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("docCommentTagName", text, position);
        }

        export function className(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("className", text, position);
        }

        export function enumName(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("enumName", text, position);
        }

        export function interfaceName(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("interfaceName", text, position);
        }

        export function moduleName(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("moduleName", text, position);
        }

        export function typeParameterName(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("typeParameterName", text, position);
        }

        export function parameterName(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("parameterName", text, position);
        }

        export function typeAliasName(text: string, position?: number): { classificationType: string; text: string; textSpan?: FourSlash.TextSpan } {
            return getClassification("typeAliasName", text, position);
        }

        function getClassification(type: string, text: string, position?: number) {
            return {
                classificationType: type,
                text: text,
                textSpan: position === undefined ? undefined : { start: position, end: position + text.length }
            };
        }
    }
}
