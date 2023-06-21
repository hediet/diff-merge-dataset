/// <reference path='harness.ts' />
/// <reference path='runnerbase.ts' />
/// <reference path='syntacticCleaner.ts' />

class Test262BaselineRunner extends RunnerBase {
    private static basePath = 'tests/cases/test262';
    private static helpersFilePath = 'tests/cases/test262-harness/helpers.d.ts';
    private static helperFile = {
        unitName: Test262BaselineRunner.helpersFilePath,
        content: Harness.IO.readFile(Test262BaselineRunner.helpersFilePath)
    };
    private static testFileExtensionRegex = /\.js$/;
    private static options: ts.CompilerOptions = {
        allowNonTsExtensions: true,
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.CommonJS
    };
    private static baselineOptions: Harness.Baseline.BaselineOptions = { Subfolder: 'test262' };

    private static getTestFilePath(filename: string): string {
        return Test262BaselineRunner.basePath + "/" + filename;
    }

<<<<<<< HEAD
=======
    private static serializeSourceFile(file: ts.SourceFile): string {
        function getKindName(k: number): string {
            return (<any>ts).SyntaxKind[k]
        }

        function getFlagName(flags: any, f: number): any {
            if (f === 0) {
                return 0;
            }

            var result = "";
            ts.forEach(Object.getOwnPropertyNames(flags), (v: any) => {
                if (isFinite(v)) {
                    v = +v;
                    if (f === +v) {
                        result = flags[v];
                        return true;
                    }
                    else if ((f & v) > 0) {
                        if (result.length)
                            result += " | ";
                        result += flags[v];
                        return false;
                    }
                }
            });
            return result;
        }

        function getNodeFlagName(f: number) { return getFlagName((<any>ts).NodeFlags, f); }
        function getParserContextFlagName(f: number) {
            // Clear the flag that are produced by aggregating child values..  That is ephemeral 
            // data we don't care about in the dump.  We only care what the parser set directly
            // on the ast.
            return getFlagName((<any>ts).ParserContextFlags, f & ts.ParserContextFlags.ParserGeneratedFlags);
        }
        function convertDiagnostics(diagnostics: ts.Diagnostic[]) {
            return diagnostics.map(convertDiagnostic);
        }

        function convertDiagnostic(diagnostic: ts.Diagnostic): any {
            return {
                start: diagnostic.start,
                length: diagnostic.length,
                messageText: diagnostic.messageText,
                category: (<any>ts).DiagnosticCategory[diagnostic.category],
                code: diagnostic.code
            };
        }

        function serializeNode(n: ts.Node): any {
            var o: any = { kind: getKindName(n.kind) };
            if (ts.containsParseError(n)) {
                o.containsParseError = true;
            }

            ts.forEach(Object.getOwnPropertyNames(n), propertyName => {
                switch (propertyName) {
                    case "parent":
                    case "symbol":
                    case "locals":
                    case "localSymbol":
                    case "kind":
                    case "semanticDiagnostics":
                    case "id":
                    case "nodeCount":
                    case "symbolCount":
                    case "identifierCount":
                        // Blacklist of items we never put in the baseline file.
                        break;

                    case "flags":
                        // Print out flags with their enum names.
                        o[propertyName] = getNodeFlagName(n.flags);
                        break;

                    case "parserContextFlags":
                        o[propertyName] = getParserContextFlagName(n.parserContextFlags);
                        break;

                    case "referenceDiagnostics":
                    case "parseDiagnostics":
                    case "grammarDiagnostics":
                        o[propertyName] = convertDiagnostics((<any>n)[propertyName]);
                        break;

                    case "nextContainer":
                        if (n.nextContainer) {
                            o[propertyName] = { kind: n.nextContainer.kind, pos: n.nextContainer.pos, end: n.nextContainer.end };
                        }
                        break;

                    case "text":
                        // Include 'text' field for identifiers/literals, but not for source files.
                        if (n.kind !== ts.SyntaxKind.SourceFile) {
                            o[propertyName] = (<any>n)[propertyName];
                        }
                        break;

                    default:
                        o[propertyName] = (<any>n)[propertyName];
                }

                return undefined;
            });

            return o;
        }

        return JSON.stringify(file, (k, v) => {
            return Test262BaselineRunner.isNodeOrArray(v) ? serializeNode(v) : v;
        }, "    ");
    }

    private static isNodeOrArray(a: any): boolean {
        return a !== undefined && typeof a.pos === "number";
    }

>>>>>>> 6ff58e302875e1b25d1245209ce70a5b5d388ec8
    private runTest(filePath: string) {
        describe('test262 test for ' + filePath, () => {
            // Mocha holds onto the closure environment of the describe callback even after the test is done.
            // Everything declared here should be cleared out in the "after" callback.
            var testState: {
                filename: string;
                compilerResult: Harness.Compiler.CompilerResult;
                inputFiles: { unitName: string; content: string }[];
                checker: ts.TypeChecker;
            };

            before(() => {
                var content = Harness.IO.readFile(filePath);
                var testFilename = ts.removeFileExtension(filePath).replace(/\//g, '_') + ".test";
                var testCaseContent = Harness.TestCaseParser.makeUnitsFromTest(content, testFilename);

                var inputFiles = testCaseContent.testUnitData.map(unit => {
                    return { unitName: Test262BaselineRunner.getTestFilePath(unit.name), content: unit.content };
                });

                // Emit the results
                testState = {
                    filename: testFilename,
                    inputFiles: inputFiles,
                    compilerResult: undefined,
                    checker: undefined,
                };

                Harness.Compiler.getCompiler().compileFiles([Test262BaselineRunner.helperFile].concat(inputFiles), /*otherFiles*/ [], (compilerResult, checker) => {
                    testState.compilerResult = compilerResult;
                    testState.checker = checker;
                }, /*settingsCallback*/ undefined, Test262BaselineRunner.options);
            });

            after(() => {
                testState = undefined;
            });

            it('has the expected emitted code', () => {
                Harness.Baseline.runBaseline('has the expected emitted code', testState.filename + '.output.js', () => {
                    var files = testState.compilerResult.files.filter(f=> f.fileName !== Test262BaselineRunner.helpersFilePath);
                    return Harness.Compiler.collateOutputs(files, s => SyntacticCleaner.clean(s));
                }, false, Test262BaselineRunner.baselineOptions);
            });

            it('has the expected errors', () => {
                Harness.Baseline.runBaseline('has the expected errors', testState.filename + '.errors.txt', () => {
                    var errors = testState.compilerResult.errors;
                    if (errors.length === 0) {
                        return null;
                    }

                    return Harness.Compiler.getErrorBaseline(testState.inputFiles, errors);
                }, false, Test262BaselineRunner.baselineOptions);
            });

            it('satisfies invariants', () => {
                var sourceFile = testState.checker.getProgram().getSourceFile(Test262BaselineRunner.getTestFilePath(testState.filename));
                Utils.assertInvariants(sourceFile, /*parent:*/ undefined);
            });

            it('has the expected AST',() => {
                Harness.Baseline.runBaseline('has the expected AST', testState.filename + '.AST.txt',() => {
                    var sourceFile = testState.checker.getProgram().getSourceFile(Test262BaselineRunner.getTestFilePath(testState.filename));
                    return Utils.sourceFileToJSON(sourceFile);
                }, false, Test262BaselineRunner.baselineOptions);
            });
        });
    }

    public initializeTests() {
        // this will set up a series of describe/it blocks to run between the setup and cleanup phases
        if (this.tests.length === 0) {
            var testFiles = this.enumerateFiles(Test262BaselineRunner.basePath, Test262BaselineRunner.testFileExtensionRegex, { recursive: true });
            testFiles.forEach(fn => {
                this.runTest(ts.normalizePath(fn));
            });
        }
        else {
            this.tests.forEach(test => this.runTest(test));
        }
    }
}  