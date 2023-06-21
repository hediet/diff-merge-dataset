﻿/// <reference path='..\services\services.ts' />
/// <reference path='..\services\shims.ts' />
/// <reference path='..\server\client.ts' />
/// <reference path='harness.ts' />

module Harness.LanguageService {
    export class ScriptInfo {
        public version: number = 1;
        public editRanges: { length: number; textChangeRange: ts.TextChangeRange; }[] = [];
        public lineMap: number[] = null;

        constructor(public fileName: string, public content: string) {
            this.setContent(content);
        }

        private setContent(content: string): void {
            this.content = content;
            this.lineMap = ts.computeLineStarts(content);
        }

        public updateContent(content: string): void {
            this.editRanges = [];
            this.setContent(content);
            this.version++;
        }

        public editContent(start: number, end: number, newText: string): void {
            // Apply edits
            var prefix = this.content.substring(0, start);
            var middle = newText;
            var suffix = this.content.substring(end);
            this.setContent(prefix + middle + suffix);

            // Store edit range + new length of script
            this.editRanges.push({
                length: this.content.length,
                textChangeRange: ts.createTextChangeRange(
                    ts.createTextSpanFromBounds(start, end), newText.length)
            });

            // Update version #
            this.version++;
        }

        public getTextChangeRangeBetweenVersions(startVersion: number, endVersion: number): ts.TextChangeRange {
            if (startVersion === endVersion) {
                // No edits!
                return ts.unchangedTextChangeRange;
            }

            var initialEditRangeIndex = this.editRanges.length - (this.version - startVersion);
            var lastEditRangeIndex = this.editRanges.length - (this.version - endVersion);

            var entries = this.editRanges.slice(initialEditRangeIndex, lastEditRangeIndex);
            return ts.collapseTextChangeRangesAcrossMultipleVersions(entries.map(e => e.textChangeRange));
        }
    }

    class ScriptSnapshot implements ts.IScriptSnapshot {
        public textSnapshot: string;
        public version: number;

        constructor(public scriptInfo: ScriptInfo) {
            this.textSnapshot = scriptInfo.content;
            this.version = scriptInfo.version;
        }

        public getText(start: number, end: number): string {
            return this.textSnapshot.substring(start, end);
        }

        public getLength(): number {
            return this.textSnapshot.length;
        }

        public getChangeRange(oldScript: ts.IScriptSnapshot): ts.TextChangeRange {
            var oldShim = <ScriptSnapshot>oldScript;
            return this.scriptInfo.getTextChangeRangeBetweenVersions(oldShim.version, this.version);
        }
    }

    class ScriptSnapshotProxy implements ts.ScriptSnapshotShim {
        constructor(public scriptSnapshot: ts.IScriptSnapshot) {
        }

        public getText(start: number, end: number): string {
            return this.scriptSnapshot.getText(start, end);
        }

        public getLength(): number {
            return this.scriptSnapshot.getLength();
        }

        public getChangeRange(oldScript: ts.ScriptSnapshotShim): string {
            var oldShim = <ScriptSnapshotProxy>oldScript;

            var range = this.scriptSnapshot.getChangeRange(oldShim.scriptSnapshot);
            if (range === null) {
                return null;
            }

            return JSON.stringify({ span: { start: range.span.start, length: range.span.length }, newLength: range.newLength });
        }
    }

    class CancellationToken {
        public static None: CancellationToken = new CancellationToken(null);

        constructor(private cancellationToken: ts.CancellationToken) {
        }

        public isCancellationRequested() {
            return this.cancellationToken && this.cancellationToken.isCancellationRequested();
        }
    }

    export interface LanguageServiceAdapter {
        getHost(): LanguageServiceAdapterHost;
        getLanguageService(): ts.LanguageService;
        getClassifier(): ts.Classifier;
        getPreProcessedFileInfo(fileName: string, fileContents: string): ts.PreProcessedFileInfo;
    }

    export class LanguageServiceAdapterHost  {
        protected fileNameToScript: ts.Map<ScriptInfo> = {};
        
        constructor(protected cancellationToken: ts.CancellationToken = CancellationToken.None,
            protected settings = ts.getDefaultCompilerOptions()) { 
        }

        public getNewLine(): string {
            return "\r\n";
        }

        public getFilenames(): string[] {
            var fileNames: string[] = [];
            ts.forEachKey(this.fileNameToScript,(fileName) => { fileNames.push(fileName); });
            return fileNames;
        }

        public getScriptInfo(fileName: string): ScriptInfo {
            return ts.lookUp(this.fileNameToScript, fileName);
        }

        public addScript(fileName: string, content: string): void {
            this.fileNameToScript[fileName] = new ScriptInfo(fileName, content);
        }

        public editScript(fileName: string, start: number, end: number, newText: string) {
            var script = this.getScriptInfo(fileName);
            if (script !== null) {
                script.editContent(start, end, newText);
                return;
            }

            throw new Error("No script with name '" + fileName + "'");
        }

        public openFile(fileName: string): void {
        }

        /**
          * @param line 0 based index
          * @param col 0 based index
          */
        public positionToLineAndCharacter(fileName: string, position: number): ts.LineAndCharacter {
            var script: ScriptInfo = this.fileNameToScript[fileName];
            assert.isNotNull(script);

            return ts.computeLineAndCharacterOfPosition(script.lineMap, position);
        }
    }

    /// Native adapter
    class NativeLanguageServiceHost extends LanguageServiceAdapterHost implements ts.LanguageServiceHost { 
        getCompilationSettings(): ts.CompilerOptions { return this.settings; }
        getCancellationToken(): ts.CancellationToken { return this.cancellationToken; }
        getCurrentDirectory(): string { return ""; }
        getDefaultLibFileName(): string { return ""; }
        getScriptFileNames(): string[] { return this.getFilenames(); }
        getScriptSnapshot(fileName: string): ts.IScriptSnapshot {
            var script = this.getScriptInfo(fileName);
            return script ? new ScriptSnapshot(script) : undefined;
        }
        getScriptVersion(fileName: string): string {
            var script = this.getScriptInfo(fileName);
            return script ? script.version.toString() : undefined;
        }
        log(s: string): void { }
        trace(s: string): void { }
        error(s: string): void { }
    }

    export class NativeLanugageServiceAdapter implements LanguageServiceAdapter {
        private host: NativeLanguageServiceHost;
        constructor(cancellationToken?: ts.CancellationToken, options?: ts.CompilerOptions) { 
            this.host = new NativeLanguageServiceHost(cancellationToken, options);
        }
        getHost() { return this.host; }
        getLanguageService(): ts.LanguageService { return ts.createLanguageService(this.host); }
        getClassifier(): ts.Classifier { return ts.createClassifier(); }
        getPreProcessedFileInfo(fileName: string, fileContents: string): ts.PreProcessedFileInfo { return ts.preProcessFile(fileContents); }
    }

    /// Shim adapter
    class ShimLanguageServiceHost extends LanguageServiceAdapterHost implements ts.LanguageServiceShimHost {
        private nativeHost: NativeLanguageServiceHost;
        constructor(cancellationToken?: ts.CancellationToken, options?: ts.CompilerOptions) {
            super(cancellationToken, options);
            this.nativeHost = new NativeLanguageServiceHost(cancellationToken, options);
        }

        getFilenames(): string[] { return this.nativeHost.getFilenames(); }
        getScriptInfo(fileName: string): ScriptInfo { return this.nativeHost.getScriptInfo(fileName); }
        addScript(fileName: string, content: string): void { this.nativeHost.addScript(fileName, content); }
        editScript(fileName: string, start: number, end: number, newText: string): void { this.nativeHost.editScript(fileName, start, end, newText); }
        positionToLineAndCharacter(fileName: string, position: number): ts.LineAndCharacter { return this.nativeHost.positionToLineAndCharacter(fileName, position); }

        getCompilationSettings(): string { return JSON.stringify(this.nativeHost.getCompilationSettings()); }
        getCancellationToken(): ts.CancellationToken { return this.nativeHost.getCancellationToken(); }
        getCurrentDirectory(): string { return this.nativeHost.getCurrentDirectory(); }
        getDefaultLibFileName(): string { return this.nativeHost.getDefaultLibFileName(); }
        getScriptFileNames(): string { return JSON.stringify(this.nativeHost.getScriptFileNames()); }
        getScriptSnapshot(fileName: string): ts.ScriptSnapshotShim {
            var nativeScriptSnapshot = this.nativeHost.getScriptSnapshot(fileName);
            return nativeScriptSnapshot && new ScriptSnapshotProxy(nativeScriptSnapshot); 
        }
        getScriptVersion(fileName: string): string { return this.nativeHost.getScriptVersion(fileName); }
        getLocalizedDiagnosticMessages(): string { return JSON.stringify({}); }
        log(s: string): void { this.nativeHost.log(s); }
        trace(s: string): void { this.nativeHost.trace(s); }
        error(s: string): void { this.nativeHost.error(s); }
    }

    class ClassifierShimProxy implements ts.Classifier { 
        constructor(private shim: ts.ClassifierShim) {
        }
        getClassificationsForLine(text: string, lexState: ts.EndOfLineState, classifyKeywordsInGenerics?: boolean): ts.ClassificationResult {
            var result = this.shim.getClassificationsForLine(text, lexState, classifyKeywordsInGenerics).split('\n');
            var entries: ts.ClassificationInfo[] = [];
            var i = 0;
            var position = 0;

            for (; i < result.length - 1; i += 2) {
                var t = entries[i / 2] = {
                    length: parseInt(result[i]),
                    classification: parseInt(result[i + 1])
                };

                assert.isTrue(t.length > 0, "Result length should be greater than 0, got :" + t.length);
                position += t.length;
            }
            var finalLexState = parseInt(result[result.length - 1]);

            assert.equal(position, text.length, "Expected cumulative length of all entries to match the length of the source. expected: " + text.length + ", but got: " + position);

            return {
                finalLexState,
                entries
            };
        }
    }

    function unwrapJSONCallResult(result: string): any {
        var parsedResult = JSON.parse(result);
        if (parsedResult.error) {
            throw new Error("Language Service Shim Error: " + JSON.stringify(parsedResult.error));
        }
        else if (parsedResult.canceled) { 
            throw new ts.OperationCanceledException();
        }
        return parsedResult.result;
    }

    class LanguageServiceShimProxy implements ts.LanguageService {
        constructor(private shim: ts.LanguageServiceShim) {
        }
        private unwrappJSONCallResult(result: string): any {
            var parsedResult = JSON.parse(result);
            if (parsedResult.error) {
                throw new Error("Language Service Shim Error: " + JSON.stringify(parsedResult.error));
            }
            return parsedResult.result;
        }
        cleanupSemanticCache(): void {
            this.shim.cleanupSemanticCache();
        }
        getSyntacticDiagnostics(fileName: string): ts.Diagnostic[] {
            return unwrapJSONCallResult(this.shim.getSyntacticDiagnostics(fileName));
        }
        getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
            return unwrapJSONCallResult(this.shim.getSemanticDiagnostics(fileName));
        }
        getCompilerOptionsDiagnostics(): ts.Diagnostic[] {
            return unwrapJSONCallResult(this.shim.getCompilerOptionsDiagnostics());
        }
        getSyntacticClassifications(fileName: string, span: ts.TextSpan): ts.ClassifiedSpan[] {
            return unwrapJSONCallResult(this.shim.getSyntacticClassifications(fileName, span.start, span.length));
        }
        getSemanticClassifications(fileName: string, span: ts.TextSpan): ts.ClassifiedSpan[] {
            return unwrapJSONCallResult(this.shim.getSemanticClassifications(fileName, span.start, span.length));
        }
        getCompletionsAtPosition(fileName: string, position: number): ts.CompletionInfo {
            return unwrapJSONCallResult(this.shim.getCompletionsAtPosition(fileName, position));
        }
        getCompletionEntryDetails(fileName: string, position: number, entryName: string): ts.CompletionEntryDetails {
            return unwrapJSONCallResult(this.shim.getCompletionEntryDetails(fileName, position, entryName));
        }
        getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo {
            return unwrapJSONCallResult(this.shim.getQuickInfoAtPosition(fileName, position));
        }
        getNameOrDottedNameSpan(fileName: string, startPos: number, endPos: number): ts.TextSpan {
            return unwrapJSONCallResult(this.shim.getNameOrDottedNameSpan(fileName, startPos, endPos));
        }
        getBreakpointStatementAtPosition(fileName: string, position: number): ts.TextSpan {
            return unwrapJSONCallResult(this.shim.getBreakpointStatementAtPosition(fileName, position));
        }
        getSignatureHelpItems(fileName: string, position: number): ts.SignatureHelpItems {
            return unwrapJSONCallResult(this.shim.getSignatureHelpItems(fileName, position));
        }
        getRenameInfo(fileName: string, position: number): ts.RenameInfo {
            return unwrapJSONCallResult(this.shim.getRenameInfo(fileName, position));
        }
        findRenameLocations(fileName: string, position: number, findInStrings: boolean, findInComments: boolean): ts.RenameLocation[] {
            return unwrapJSONCallResult(this.shim.findRenameLocations(fileName, position, findInStrings, findInComments));
        }
        getDefinitionAtPosition(fileName: string, position: number): ts.DefinitionInfo[] {
            return unwrapJSONCallResult(this.shim.getDefinitionAtPosition(fileName, position));
        }
        getReferencesAtPosition(fileName: string, position: number): ts.ReferenceEntry[] {
            return unwrapJSONCallResult(this.shim.getReferencesAtPosition(fileName, position));
        }
        getOccurrencesAtPosition(fileName: string, position: number): ts.ReferenceEntry[] {
            return unwrapJSONCallResult(this.shim.getOccurrencesAtPosition(fileName, position));
        }
        getNavigateToItems(searchValue: string): ts.NavigateToItem[] {
            return unwrapJSONCallResult(this.shim.getNavigateToItems(searchValue));
        }
        getNavigationBarItems(fileName: string): ts.NavigationBarItem[] {
            return unwrapJSONCallResult(this.shim.getNavigationBarItems(fileName));
        }
        getOutliningSpans(fileName: string): ts.OutliningSpan[] {
            return unwrapJSONCallResult(this.shim.getOutliningSpans(fileName));
        }
        getTodoComments(fileName: string, descriptors: ts.TodoCommentDescriptor[]): ts.TodoComment[] {
            return unwrapJSONCallResult(this.shim.getTodoComments(fileName, JSON.stringify(descriptors)));
        }
        getBraceMatchingAtPosition(fileName: string, position: number): ts.TextSpan[] {
            return unwrapJSONCallResult(this.shim.getBraceMatchingAtPosition(fileName, position));
        }
        getIndentationAtPosition(fileName: string, position: number, options: ts.EditorOptions): number {
            return unwrapJSONCallResult(this.shim.getIndentationAtPosition(fileName, position, JSON.stringify(options)));
        }
        getFormattingEditsForRange(fileName: string, start: number, end: number, options: ts.FormatCodeOptions): ts.TextChange[] {
            return unwrapJSONCallResult(this.shim.getFormattingEditsForRange(fileName, start, end, JSON.stringify(options)));
        }
        getFormattingEditsForDocument(fileName: string, options: ts.FormatCodeOptions): ts.TextChange[] {
            return unwrapJSONCallResult(this.shim.getFormattingEditsForDocument(fileName, JSON.stringify(options)));
        }
        getFormattingEditsAfterKeystroke(fileName: string, position: number, key: string, options: ts.FormatCodeOptions): ts.TextChange[] {
            return unwrapJSONCallResult(this.shim.getFormattingEditsAfterKeystroke(fileName, position, key, JSON.stringify(options)));
        }
        getEmitOutput(fileName: string): ts.EmitOutput {
            return unwrapJSONCallResult(this.shim.getEmitOutput(fileName));
        }
        getProgram(): ts.Program {
            throw new Error("Program can not be marshaled across the shim layer.");
        }
        getSourceFile(fileName: string): ts.SourceFile {
            throw new Error("SourceFile can not be marshaled across the shim layer.");
        }
        dispose(): void { this.shim.dispose({}); }
    }

    export class ShimLanugageServiceAdapter implements LanguageServiceAdapter {
        private host: ShimLanguageServiceHost;
        private factory: ts.TypeScriptServicesFactory;
        constructor(cancellationToken?: ts.CancellationToken, options?: ts.CompilerOptions) {
            this.host = new ShimLanguageServiceHost(cancellationToken, options);
            this.factory = new TypeScript.Services.TypeScriptServicesFactory();
        }
        getHost() { return this.host; }
        getLanguageService(): ts.LanguageService { return new LanguageServiceShimProxy(this.factory.createLanguageServiceShim(this.host)); }
        getClassifier(): ts.Classifier { return new ClassifierShimProxy(this.factory.createClassifierShim(this.host)); }
        getPreProcessedFileInfo(fileName: string, fileContents: string): ts.PreProcessedFileInfo {
            var shimResult: {
                referencedFiles: ts.IFileReference[];
                importedFiles: ts.IFileReference[];
                isLibFile: boolean;
            };

            var coreServicesShim = this.factory.createCoreServicesShim(this.host);
            shimResult = unwrapJSONCallResult(coreServicesShim.getPreProcessedFileInfo(fileName, ts.ScriptSnapshot.fromString(fileContents)));

            var convertResult: ts.PreProcessedFileInfo = {
                referencedFiles: [],
                importedFiles: [],
                isLibFile: shimResult.isLibFile
            };

            ts.forEach(shimResult.referencedFiles, refFile => {
                convertResult.referencedFiles.push({
                    fileName: refFile.path,
                    pos: refFile.position,
                    end: refFile.position + refFile.length
                });
            });

            ts.forEach(shimResult.importedFiles, importedFile => {
                convertResult.importedFiles.push({
                    fileName: importedFile.path,
                    pos: importedFile.position,
                    end: importedFile.position + importedFile.length
                });
            });

            return convertResult;
        }
    }

    // Server adapter
    class SessionClientHost extends NativeLanguageServiceHost implements ts.server.SessionClientHost { 
        private client: ts.server.SessionClient;

        constructor(cancellationToken: ts.CancellationToken, settings: ts.CompilerOptions) {
            super(cancellationToken, settings);
        }

        onMessage(message: string): void { 
        
        }

        writeMessage(message: string): void { 
        
        }

        setClient(client: ts.server.SessionClient) {
            this.client = client;
        }

        openFile(fileName: string): void {
            super.openFile(fileName);
            this.client.openFile(fileName);
        }

        editScript(fileName: string, start: number, end: number, newText: string) {
            super.editScript(fileName, start, end, newText);
            this.client.changeFile(fileName, start, end, newText);
        }
    }

    class SessionServerHost implements ts.server.ServerHost, ts.server.Logger { 
        args: string[] = [];
        newLine: string;
        useCaseSensitiveFileNames: boolean = false;

        constructor(private host: NativeLanguageServiceHost) {
            this.newLine = this.host.getNewLine();
        }

        onMessage(message: string): void { 
        
        }

        writeMessage(message: string): void {
        }

        write(message: string): void { 
            this.writeMessage(message);
        }

        readFile(fileName: string): string {
            if (fileName.indexOf(Harness.Compiler.defaultLibFileName) >= 0) { 
                fileName = Harness.Compiler.defaultLibFileName;
            }
             
            var snapshot = this.host.getScriptSnapshot(fileName);
            return snapshot && snapshot.getText(0, snapshot.getLength());
        }

        writeFile(name: string, text: string, writeByteOrderMark: boolean): void {
        }

        resolvePath(path: string): string {
            return path;
        }

        fileExists(path: string): boolean {
            return !!this.host.getScriptSnapshot(path);
        }

        directoryExists(path: string): boolean {
            return false;
        }

        getExecutingFilePath(): string {
            return "";
        }

        exit(exitCode: number): void {
        }

        createDirectory(directoryName: string): void {
            throw new Error("Not Implemented Yet.");
        }

        getCurrentDirectory(): string {
            return this.host.getCurrentDirectory();
        }

        readDirectory(path: string, extension?: string): string[] {
            throw new Error("Not implemented Yet.");
        }
        
        watchFile(fileName: string, callback: (fileName: string) => void): ts.FileWatcher { 
            return { close() { } };
        }

        close(): void {
        }

        info(message: string): void {
            return this.host.log(message);
        }

        msg(message: string) {
            return this.host.log(message);
        }

        endGroup(): void {
        }

        perftrc(message: string): void {
            return this.host.log(message);
        }

        startGroup(): void {
        }
    }
    
    export class ServerLanugageServiceAdapter implements LanguageServiceAdapter {
        private host: SessionClientHost;
        private client: ts.server.SessionClient;
        constructor(cancellationToken?: ts.CancellationToken, options?: ts.CompilerOptions) {
            // This is the main host that tests use to direct tests
            var clientHost = new SessionClientHost(cancellationToken, options);
            var client = new ts.server.SessionClient(clientHost);

            // This host is just a proxy for the clientHost, it uses the client
            // host to answer server queries about files on disk
            var serverHost = new SessionServerHost(clientHost);
            var server = new ts.server.Session(serverHost, serverHost);

            // Fake the connection between the client and the server
            serverHost.writeMessage = client.onMessage.bind(client);
            clientHost.writeMessage = server.onMessage.bind(server);

            // Wire the client to the host to get notifications when a file is open
            // or edited.
            clientHost.setClient(client);

            // Set the properties
            this.client = client;
            this.host = clientHost;
        }
        getHost() { return this.host; }
        getLanguageService(): ts.LanguageService { return this.client; }
        getClassifier(): ts.Classifier { throw new Error("getClassifier is not available using the server interface."); }
        getPreProcessedFileInfo(fileName: string, fileContents: string): ts.PreProcessedFileInfo { throw new Error("getPreProcessedFileInfo is not available using the server interface."); }
    }
}
 