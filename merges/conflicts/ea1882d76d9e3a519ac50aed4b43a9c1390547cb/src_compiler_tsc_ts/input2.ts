/// <reference path="program.ts"/>
/// <reference path="commandLineParser.ts"/>

namespace ts {
    export interface SourceFile {
        fileWatcher?: FileWatcher;
    }

    /**
     * Checks to see if the locale is in the appropriate format,
     * and if it is, attempts to set the appropriate language.
     */
    function validateLocaleAndSetLanguage(locale: string, errors: Diagnostic[]): boolean {
        let matchResult = /^([a-z]+)([_\-]([a-z]+))?$/.exec(locale.toLowerCase());

        if (!matchResult) {
            errors.push(createCompilerDiagnostic(Diagnostics.Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1, "en", "ja-jp"));
            return false;
        }

        let language = matchResult[1];
        let territory = matchResult[3];

        // First try the entire locale, then fall back to just language if that's all we have.
        if (!trySetLanguageAndTerritory(language, territory, errors) &&
            !trySetLanguageAndTerritory(language, undefined, errors)) {

            errors.push(createCompilerDiagnostic(Diagnostics.Unsupported_locale_0, locale));
            return false;
        }

        return true;
    }

    function trySetLanguageAndTerritory(language: string, territory: string, errors: Diagnostic[]): boolean {
        let compilerFilePath = normalizePath(sys.getExecutingFilePath());
        let containingDirectoryPath = getDirectoryPath(compilerFilePath);

        let filePath = combinePaths(containingDirectoryPath, language);

        if (territory) {
            filePath = filePath + "-" + territory;
        }

        filePath = sys.resolvePath(combinePaths(filePath, "diagnosticMessages.generated.json"));

        if (!sys.fileExists(filePath)) {
            return false;
        }

        // TODO: Add codePage support for readFile?
        let fileContents = "";
        try {
            fileContents = sys.readFile(filePath);
        }
        catch (e) {
            errors.push(createCompilerDiagnostic(Diagnostics.Unable_to_open_file_0, filePath));
            return false;
        }
        try {
            ts.localizedDiagnosticMessages = JSON.parse(fileContents);
        }
        catch (e) {
            errors.push(createCompilerDiagnostic(Diagnostics.Corrupted_locale_file_0, filePath));
            return false;
        }

        return true;
    }

    function countLines(program: Program): number {
        let count = 0;
        forEach(program.getSourceFiles(), file => {
            count += getLineStarts(file).length;
        });
        return count;
    }

    function getDiagnosticText(message: DiagnosticMessage, ...args: any[]): string {
        let diagnostic = createCompilerDiagnostic.apply(undefined, arguments);
        return <string>diagnostic.messageText;
    }

    function reportDiagnostic(diagnostic: Diagnostic) {
        let output = "";

        if (diagnostic.file) {
            let loc = getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);

            output += `${ diagnostic.file.fileName }(${ loc.line + 1 },${ loc.character + 1 }): `;
        }

        let category = DiagnosticCategory[diagnostic.category].toLowerCase();
        output += `${ category } TS${ diagnostic.code }: ${ flattenDiagnosticMessageText(diagnostic.messageText, sys.newLine) }${ sys.newLine }`;

        sys.write(output);
    }

    function reportDiagnostics(diagnostics: Diagnostic[]) {
        for (let i = 0; i < diagnostics.length; i++) {
            reportDiagnostic(diagnostics[i]);
        }
    }

    function padLeft(s: string, length: number) {
        while (s.length < length) {
            s = " " + s;
        }
        return s;
    }

    function padRight(s: string, length: number) {
        while (s.length < length) {
            s = s + " ";
        }

        return s;
    }

    function reportStatisticalValue(name: string, value: string) {
        sys.write(padRight(name + ":", 12) + padLeft(value.toString(), 10) + sys.newLine);
    }

    function reportCountStatistic(name: string, count: number) {
        reportStatisticalValue(name, "" + count);
    }

    function reportTimeStatistic(name: string, time: number) {
        reportStatisticalValue(name, (time / 1000).toFixed(2) + "s");
    }

    function isJSONSupported() {
        return typeof JSON === "object" && typeof JSON.parse === "function";
    }

    export function executeCommandLine(args: string[]): void {
        let commandLine = parseCommandLine(args);
        let configFileName: string;                 // Configuration file name (if any)
        let configFileWatcher: FileWatcher;         // Configuration file watcher
        let cachedProgram: Program;                 // Program cached from last compilation
        let rootFileNames: string[];                // Root fileNames for compilation
        let compilerOptions: CompilerOptions;       // Compiler options for compilation
        let compilerHost: CompilerHost;             // Compiler host
        let hostGetSourceFile: typeof compilerHost.getSourceFile;  // getSourceFile method from default host
        let timerHandle: number;                    // Handle for 0.25s wait timer

        if (commandLine.options.locale) {
            if (!isJSONSupported()) {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.The_current_host_does_not_support_the_0_option, "--locale"));
                return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
            validateLocaleAndSetLanguage(commandLine.options.locale, commandLine.errors);
        }

        // If there are any errors due to command line parsing and/or
        // setting up localization, report them and quit.
        if (commandLine.errors.length > 0) {
            reportDiagnostics(commandLine.errors);
            return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
        }

        if (commandLine.options.version) {
            reportDiagnostic(createCompilerDiagnostic(Diagnostics.Version_0, ts.version));
            return sys.exit(ExitStatus.Success);
        }

        if (commandLine.options.help) {
            printVersion();
            printHelp();
            return sys.exit(ExitStatus.Success);
        }

        if (commandLine.options.project) {
            if (!isJSONSupported()) {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.The_current_host_does_not_support_the_0_option, "--project"));
                return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
            configFileName = normalizePath(combinePaths(commandLine.options.project, "tsconfig.json"));
            if (commandLine.fileNames.length !== 0) {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.Option_project_cannot_be_mixed_with_source_files_on_a_command_line));
                return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
        }
        else if (commandLine.fileNames.length === 0 && isJSONSupported()) {
            let searchPath = normalizePath(sys.getCurrentDirectory());
            configFileName = findConfigFile(searchPath);
        }

        if (commandLine.fileNames.length === 0 && !configFileName) {
            printVersion();
            printHelp();
            return sys.exit(ExitStatus.Success);
        }

        // Firefox has Object.prototype.watch
        if (commandLine.options.watch && commandLine.options.hasOwnProperty("watch")) {
            if (!sys.watchFile) {
                reportDiagnostic(createCompilerDiagnostic(Diagnostics.The_current_host_does_not_support_the_0_option, "--watch"));
                return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
            }
            if (configFileName) {
                configFileWatcher = sys.watchFile(configFileName, configFileChanged);
            }
        }

        performCompilation();

        // Invoked to perform initial compilation or re-compilation in watch mode
        function performCompilation() {

            if (!cachedProgram) {
                if (configFileName) {

                    let result = readConfigFile(configFileName);
                    if (result.error) {
                        reportDiagnostic(result.error);
                        return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
                    }

                    let configObject = result.config;
                    let configParseResult = parseConfigFile(configObject, sys, getDirectoryPath(configFileName));
                    if (configParseResult.errors.length > 0) {
                        reportDiagnostics(configParseResult.errors);
                        return sys.exit(ExitStatus.DiagnosticsPresent_OutputsSkipped);
                    }
                    rootFileNames = configParseResult.fileNames;
                    compilerOptions = extend(commandLine.options, configParseResult.options);
                }
                else {
                    rootFileNames = commandLine.fileNames;
                    compilerOptions = commandLine.options;
                }
                compilerHost = createCompilerHost(compilerOptions);
                hostGetSourceFile = compilerHost.getSourceFile;
                compilerHost.getSourceFile = getSourceFile;
            }

            let compileResult = compile(rootFileNames, compilerOptions, compilerHost);

            if (!compilerOptions.watch) {
                return sys.exit(compileResult.exitStatus);
            }

            setCachedProgram(compileResult.program);
            reportDiagnostic(createCompilerDiagnostic(Diagnostics.Compilation_complete_Watching_for_file_changes));
        }

        function getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) {
            // Return existing SourceFile object if one is available
            if (cachedProgram) {
                let sourceFile = cachedProgram.getSourceFile(fileName);
                // A modified source file has no watcher and should not be reused
                if (sourceFile && sourceFile.fileWatcher) {
                    return sourceFile;
                }
            }
            // Use default host function
            let sourceFile = hostGetSourceFile(fileName, languageVersion, onError);
            if (sourceFile && compilerOptions.watch) {
                // Attach a file watcher
                sourceFile.fileWatcher = sys.watchFile(sourceFile.fileName, () => sourceFileChanged(sourceFile));
            }
            return sourceFile;
        }

        // Change cached program to the given program
        function setCachedProgram(program: Program) {
            if (cachedProgram) {
                let newSourceFiles = program ? program.getSourceFiles() : undefined;
                forEach(cachedProgram.getSourceFiles(), sourceFile => {
                    if (!(newSourceFiles && contains(newSourceFiles, sourceFile))) {
                        if (sourceFile.fileWatcher) {
                            sourceFile.fileWatcher.close();
                            sourceFile.fileWatcher = undefined;
                        }
                    }
                });
            }
            cachedProgram = program;
        }

        // If a source file changes, mark it as unwatched and start the recompilation timer
        function sourceFileChanged(sourceFile: SourceFile) {
            sourceFile.fileWatcher.close();
            sourceFile.fileWatcher = undefined;
            startTimer();
        }

        // If the configuration file changes, forget cached program and start the recompilation timer
        function configFileChanged() {
            setCachedProgram(undefined);
            startTimer();
        }

        // Upon detecting a file change, wait for 250ms and then perform a recompilation. This gives batch
        // operations (such as saving all modified files in an editor) a chance to complete before we kick
        // off a new compilation.
        function startTimer() {
            if (timerHandle) {
                clearTimeout(timerHandle);
            }
            timerHandle = setTimeout(recompile, 250);
        }

        function recompile() {
            timerHandle = undefined;
            reportDiagnostic(createCompilerDiagnostic(Diagnostics.File_change_detected_Starting_incremental_compilation));
            performCompilation();
        }
    }

    function compile(fileNames: string[], compilerOptions: CompilerOptions, compilerHost: CompilerHost) {
        ioReadTime = 0;
        ioWriteTime = 0;
        programTime = 0;
        bindTime = 0;
        checkTime = 0;
        emitTime = 0;

        let program = createProgram(fileNames, compilerOptions, compilerHost);
        let exitStatus = compileProgram();

        if (compilerOptions.listFiles) {
            forEach(program.getSourceFiles(), file => {
                sys.write(file.fileName + sys.newLine);
            });
        }

        if (compilerOptions.diagnostics) {
            let memoryUsed = sys.getMemoryUsage ? sys.getMemoryUsage() : -1;
            reportCountStatistic("Files", program.getSourceFiles().length);
            reportCountStatistic("Lines", countLines(program));
            reportCountStatistic("Nodes", program.getNodeCount());
            reportCountStatistic("Identifiers", program.getIdentifierCount());
            reportCountStatistic("Symbols", program.getSymbolCount());
            reportCountStatistic("Types", program.getTypeCount());

            if (memoryUsed >= 0) {
                reportStatisticalValue("Memory used", Math.round(memoryUsed / 1000) + "K");
            }

            // Individual component times.
            // Note: To match the behavior of previous versions of the compiler, the reported parse time includes
            // I/O read time and processing time for triple-slash references and module imports, and the reported
            // emit time includes I/O write time. We preserve this behavior so we can accurately compare times.
            reportTimeStatistic("I/O read", ioReadTime);
            reportTimeStatistic("I/O write", ioWriteTime);
            reportTimeStatistic("Parse time", programTime);
            reportTimeStatistic("Bind time", bindTime);
            reportTimeStatistic("Check time", checkTime);
            reportTimeStatistic("Emit time", emitTime);
            reportTimeStatistic("Total time", programTime + bindTime + checkTime + emitTime);
        }

        return { program, exitStatus };

        function compileProgram(): ExitStatus {
            let diagnostics: Diagnostic[];
            
            // First get and report any syntactic errors.
            diagnostics = program.getSyntacticDiagnostics();

            // If we didn't have any syntactic errors, then also try getting the global and
            // semantic errors.
            if (diagnostics.length === 0) {
                diagnostics = program.getOptionsDiagnostics().concat(program.getGlobalDiagnostics());

                if (diagnostics.length === 0) {
                    diagnostics = program.getSemanticDiagnostics();
                }
            }

            reportDiagnostics(diagnostics);

            // If the user doesn't want us to emit, then we're done at this point.
            if (compilerOptions.noEmit) {
                return diagnostics.length
                    ? ExitStatus.DiagnosticsPresent_OutputsSkipped
                    : ExitStatus.Success;
            }

            // Otherwise, emit and report any errors we ran into.
            let emitOutput = program.emit();
            reportDiagnostics(emitOutput.diagnostics);

            // If the emitter didn't emit anything, then pass that value along.
            if (emitOutput.emitSkipped) {
                return ExitStatus.DiagnosticsPresent_OutputsSkipped;
            }

            // The emitter emitted something, inform the caller if that happened in the presence
            // of diagnostics or not.
            if (diagnostics.length > 0 || emitOutput.diagnostics.length > 0) {
                return ExitStatus.DiagnosticsPresent_OutputsGenerated;
            }

            return ExitStatus.Success;
        }
    }

    function printVersion() {
        sys.write(getDiagnosticText(Diagnostics.Version_0, ts.version) + sys.newLine);
    }

    function printHelp() {
        let output = "";

        // We want to align our "syntax" and "examples" commands to a certain margin.
        let syntaxLength = getDiagnosticText(Diagnostics.Syntax_Colon_0, "").length;
        let examplesLength = getDiagnosticText(Diagnostics.Examples_Colon_0, "").length;
        let marginLength = Math.max(syntaxLength, examplesLength);

        // Build up the syntactic skeleton.
        let syntax = makePadding(marginLength - syntaxLength);
        syntax += "tsc [" + getDiagnosticText(Diagnostics.options) + "] [" + getDiagnosticText(Diagnostics.file) + " ...]";

        output += getDiagnosticText(Diagnostics.Syntax_Colon_0, syntax);
        output += sys.newLine + sys.newLine;

        // Build up the list of examples.
        let padding = makePadding(marginLength);
        output += getDiagnosticText(Diagnostics.Examples_Colon_0, makePadding(marginLength - examplesLength) + "tsc hello.ts") + sys.newLine;
        output += padding + "tsc --out file.js file.ts" + sys.newLine;
        output += padding + "tsc @args.txt" + sys.newLine;
        output += sys.newLine;

        output += getDiagnosticText(Diagnostics.Options_Colon) + sys.newLine;

        // Sort our options by their names, (e.g. "--noImplicitAny" comes before "--watch")
        let optsList = filter(optionDeclarations.slice(), v => !v.experimental);
        optsList.sort((a, b) => compareValues<string>(a.name.toLowerCase(), b.name.toLowerCase()));

        // We want our descriptions to align at the same column in our output,
        // so we keep track of the longest option usage string.
        marginLength = 0;
        let usageColumn: string[] = []; // Things like "-d, --declaration" go in here.
        let descriptionColumn: string[] = [];

        for (let i = 0; i < optsList.length; i++) {
            let option = optsList[i];

            // If an option lacks a description,
            // it is not officially supported.
            if (!option.description) {
                continue;
            }

            let usageText = " ";
            if (option.shortName) {
                usageText += "-" + option.shortName;
                usageText += getParamType(option);
                usageText += ", ";
            }

            usageText += "--" + option.name;
            usageText += getParamType(option);

            usageColumn.push(usageText);
            descriptionColumn.push(getDiagnosticText(option.description));

            // Set the new margin for the description column if necessary.
            marginLength = Math.max(usageText.length, marginLength);
        }

        // Special case that can't fit in the loop.
        let usageText = " @<" + getDiagnosticText(Diagnostics.file) + ">";
        usageColumn.push(usageText);
        descriptionColumn.push(getDiagnosticText(Diagnostics.Insert_command_line_options_and_files_from_a_file));
        marginLength = Math.max(usageText.length, marginLength);

        // Print out each row, aligning all the descriptions on the same column.
        for (let i = 0; i < usageColumn.length; i++) {
            let usage = usageColumn[i];
            let description = descriptionColumn[i];
            output += usage + makePadding(marginLength - usage.length + 2) + description + sys.newLine;
        }

        sys.write(output);
        return;

        function getParamType(option: CommandLineOption) {
            if (option.paramType !== undefined) {
                return " " + getDiagnosticText(option.paramType);
            }
            return "";
        }

        function makePadding(paddingLength: number): string {
            return Array(paddingLength + 1).join(" ");
        }
    }
}

ts.executeCommandLine(ts.sys.args);
