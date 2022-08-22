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