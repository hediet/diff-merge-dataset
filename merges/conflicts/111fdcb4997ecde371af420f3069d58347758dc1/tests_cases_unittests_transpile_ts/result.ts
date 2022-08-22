/// <reference path="..\..\..\src\harness\harness.ts" />

module ts {
    describe("Transpile", () => {

<<<<<<< HEAD
        function runTest(input: string, compilerOptions: ts.CompilerOptions = {}, fileName?: string,  moduleName?: string, expectedOutput?: string, expectedDiagnosticCodes: number[] = []): void {
            let diagnostics: Diagnostic[] = [];
            let result = transpile(input, compilerOptions, fileName || "file.ts", diagnostics, moduleName);
=======
        function runTest(input: string, compilerOptions: ts.CompilerOptions = {}, moduleName?: string, expectedOutput?: string, expectedDiagnosticCodes: number[] = []): void {
            let diagnostics: Diagnostic[] = [];
            let result = transpile(input, compilerOptions, "file.ts", diagnostics, moduleName);
>>>>>>> fce1423414327c36c2e38f3a13277583d1d83f4d

            for (let i = 0; i < expectedDiagnosticCodes.length; i++) {
                assert.equal(expectedDiagnosticCodes[i], diagnostics[i] && diagnostics[i].code, `Could not find expeced diagnostic.`);
            }
            assert.equal(diagnostics.length, expectedDiagnosticCodes.length, "Resuting diagnostics count does not match expected");

            if (expectedOutput !== undefined) {
                assert.equal(result, expectedOutput);
            }
        }

        it("Generates correct compilerOptions diagnostics", () => {
            // Expecting 5047: "Option 'isolatedModules' can only be used when either option'--module' is provided or option 'target' is 'ES6' or higher."
<<<<<<< HEAD
            runTest(`var x = 0;`, {}, /*fileName*/ undefined, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ [5047]);
=======
            runTest(`var x = 0;`, {}, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ [5047]);
>>>>>>> fce1423414327c36c2e38f3a13277583d1d83f4d
        });

        it("Generates no diagnostics with valid inputs", () => {
            // No errors
<<<<<<< HEAD
            runTest(`var x = 0;`, { module: ModuleKind.CommonJS }, /*fileName*/ undefined, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
=======
            runTest(`var x = 0;`, { module: ModuleKind.CommonJS }, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
>>>>>>> fce1423414327c36c2e38f3a13277583d1d83f4d
        });

        it("Generates no diagnostics for missing file references", () => {
            runTest(`/// <reference path="file2.ts" />
var x = 0;`,
<<<<<<< HEAD
                { module: ModuleKind.CommonJS }, /*fileName*/ undefined, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
=======
                { module: ModuleKind.CommonJS }, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
>>>>>>> fce1423414327c36c2e38f3a13277583d1d83f4d
        });

        it("Generates no diagnostics for missing module imports", () => {
            runTest(`import {a} from "module2";`,
<<<<<<< HEAD
                { module: ModuleKind.CommonJS }, /*fileName*/ undefined,/*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
=======
                { module: ModuleKind.CommonJS }, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
>>>>>>> fce1423414327c36c2e38f3a13277583d1d83f4d
        });

        it("Generates expected syntactic diagnostics", () => {
            runTest(`a b`,
<<<<<<< HEAD
                { module: ModuleKind.CommonJS }, /*fileName*/ undefined, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ [1005]); /// 1005: ';' Expected
=======
                { module: ModuleKind.CommonJS }, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ [1005]); /// 1005: ';' Expected
>>>>>>> fce1423414327c36c2e38f3a13277583d1d83f4d
        });

        it("Does not generate semantic diagnostics", () => {
            runTest(`var x: string = 0;`,
<<<<<<< HEAD
                { module: ModuleKind.CommonJS }, /*fileName*/ undefined, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
        });

        it("Generates module output", () => {
            runTest(`var x = 0;`, { module: ModuleKind.AMD }, /*fileName*/ undefined, /*moduleName*/undefined, `define(["require", "exports"], function (require, exports) {\r\n    var x = 0;\r\n});\r\n`);
        });

        it("Uses correct newLine character", () => {
            runTest(`var x = 0;`, { module: ModuleKind.CommonJS, newLine: NewLineKind.LineFeed }, /*fileName*/ undefined, /*moduleName*/undefined, `var x = 0;\n`, /*expectedDiagnosticCodes*/ []);
=======
                { module: ModuleKind.CommonJS }, /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/ []);
        });

        it("Generates module output", () => {
            runTest(`var x = 0;`, { module: ModuleKind.AMD }, /*moduleName*/undefined, `define(["require", "exports"], function (require, exports) {\r\n    var x = 0;\r\n});\r\n`);
        });

        it("Uses correct newLine character", () => {
            runTest(`var x = 0;`, { module: ModuleKind.CommonJS, newLine: NewLineKind.LineFeed }, /*moduleName*/undefined, `var x = 0;\n`, /*expectedDiagnosticCodes*/ []);
        });

        it("Sets module name", () => {
            let output =
                `System.register("NamedModule", [], function(exports_1) {\n    var x;\n` +
                `    return {\n` +
                `        setters:[],\n` +
                `        execute: function() {\n` +
                `            var x = 1;\n` +
                `        }\n` +
                `    }\n` +
                `});\n`;
            runTest("var x = 1;", { module: ModuleKind.System, newLine: NewLineKind.LineFeed }, "NamedModule", output)
>>>>>>> fce1423414327c36c2e38f3a13277583d1d83f4d
        });

        it("Sets module name", () => {
            let output =
                `System.register("NamedModule", [], function(exports_1) {\n    var x;\n` +
                `    return {\n` +
                `        setters:[],\n` +
                `        execute: function() {\n` +
                `            var x = 1;\n` +
                `        }\n` +
                `    }\n` +
                `});\n`;
            runTest("var x = 1;", { module: ModuleKind.System, newLine: NewLineKind.LineFeed }, /*fileName*/ undefined, "NamedModule", output)
        });
        it("No extra errors for file without extension", () => {
            runTest(`var x = 0;`, { module: ModuleKind.CommonJS }, "file", /*moduleName*/undefined, /*expectedOutput*/ undefined, /*expectedDiagnosticCodes*/[]);
        });

    });
}