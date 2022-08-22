
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
/// <reference path="..\server\session.ts" />
/// <reference path="..\server\client.ts" />
/// <reference path="..\server\node.d.ts" />
/// <reference path="external\mocha.d.ts"/>
/// <reference path="external\chai.d.ts"/>
/// <reference path="sourceMapRecorder.ts"/>
/// <reference path="runnerbase.ts"/>
/* tslint:disable:no-null */

// Block scoped definitions work poorly for global variables, temporarily enable var
/* tslint:disable:no-var-keyword */

// this will work in the browser via browserify
var _chai: typeof chai = require("chai");
var assert: typeof _chai.assert = _chai.assert;
var expect: typeof _chai.expect = _chai.expect;
declare var __dirname: string; // Node-specific
var global = <any>Function("return this").call(null);
/* tslint:enable:no-var-keyword */

namespace Utils {
    // Setup some globals based on the current environment
    export const enum ExecutionEnvironment {
        Node,
        Browser,
        CScript
    }

    export function getExecutionEnvironment() {
        if (typeof WScript !== "undefined" && typeof ActiveXObject === "function") {
            return ExecutionEnvironment.CScript;
        }
        else if (typeof window !== "undefined") {
            return ExecutionEnvironment.Browser;
        }
        else {
            return ExecutionEnvironment.Node;
        }
    }

    export let currentExecutionEnvironment = getExecutionEnvironment();

    const Buffer: BufferConstructor = currentExecutionEnvironment !== ExecutionEnvironment.Browser
        ? require("buffer").Buffer
        : undefined;

    export function encodeString(s: string): string {
        return Buffer ? (new Buffer(s)).toString("utf8") : s;
    }

    export function evalFile(fileContents: string, fileName: string, nodeContext?: any) {
        const environment = getExecutionEnvironment();
        switch (environment) {
            case ExecutionEnvironment.CScript:
            case ExecutionEnvironment.Browser:
                eval(fileContents);
                break;
            case ExecutionEnvironment.Node:
                let vm = require("vm");
                if (nodeContext) {
                    vm.runInNewContext(fileContents, nodeContext, fileName);
                }
                else {
                    vm.runInThisContext(fileContents, fileName);
                }
                break;
            default:
                throw new Error("Unknown context");
        }
    }

    /** Splits the given string on \r\n, or on only \n if that fails, or on only \r if *that* fails. */
    export function splitContentByNewlines(content: string) {
        // Split up the input file by line
        // Note: IE JS engine incorrectly handles consecutive delimiters here when using RegExp split, so
        // we have to use string-based splitting instead and try to figure out the delimiting chars
        let lines = content.split("\r\n");
        if (lines.length === 1) {
            lines = content.split("\n");

            if (lines.length === 1) {
                lines = content.split("\r");
            }
        }
        return lines;
    }

    /** Reads a file under /tests */
    export function readTestFile(path: string) {
        if (path.indexOf("tests") < 0) {
            path = "tests/" + path;
        }

        let content: string = undefined;
        try {
            content = Harness.IO.readFile(Harness.userSpecifiedRoot + path);
        }
        catch (err) {
            return undefined;
        }

        return content;
    }

    export function memoize<T extends Function>(f: T): T {
        const cache: { [idx: string]: any } = {};

        return <any>(function () {
            const key = Array.prototype.join.call(arguments);
            const cachedResult = cache[key];
            if (cachedResult) {
                return cachedResult;
            }
            else {
                return cache[key] = f.apply(this, arguments);
            }
        });
    }

    export function assertInvariants(node: ts.Node, parent: ts.Node): void {
        if (node) {
            assert.isFalse(node.pos < 0, "node.pos < 0");
            assert.isFalse(node.end < 0, "node.end < 0");
            assert.isFalse(node.end < node.pos, "node.end < node.pos");
            assert.equal(node.parent, parent, "node.parent !== parent");

            if (parent) {
                // Make sure each child is contained within the parent.
                assert.isFalse(node.pos < parent.pos, "node.pos < parent.pos");
                assert.isFalse(node.end > parent.end, "node.end > parent.end");
            }

            ts.forEachChild(node, child => {
                assertInvariants(child, node);
            });

            // Make sure each of the children is in order.
            let currentPos = 0;
            ts.forEachChild(node,
                child => {
                    assert.isFalse(child.pos < currentPos, "child.pos < currentPos");
                    currentPos = child.end;
                },
                (array: ts.NodeArray<ts.Node>) => {
                    assert.isFalse(array.pos < node.pos, "array.pos < node.pos");
                    assert.isFalse(array.end > node.end, "array.end > node.end");
                    assert.isFalse(array.pos < currentPos, "array.pos < currentPos");

                    for (let i = 0, n = array.length; i < n; i++) {
                        assert.isFalse(array[i].pos < currentPos, "array[i].pos < currentPos");
                        currentPos = array[i].end;
                    }

                    currentPos = array.end;
                });

            const childNodesAndArrays: any[] = [];
            ts.forEachChild(node, child => { childNodesAndArrays.push(child); }, array => { childNodesAndArrays.push(array); });

            for (const childName in node) {
                if (childName === "parent" || childName === "nextContainer" || childName === "modifiers" || childName === "externalModuleIndicator") {
                    continue;
                }
                const child = (<any>node)[childName];
                if (isNodeOrArray(child)) {
                    assert.isFalse(childNodesAndArrays.indexOf(child) < 0,
                        "Missing child when forEach'ing over node: " + (<any>ts).SyntaxKind[node.kind] + "-" + childName);
                }
            }
        }
    }

    function isNodeOrArray(a: any): boolean {
        return a !== undefined && typeof a.pos === "number";
    }

    export function convertDiagnostics(diagnostics: ts.Diagnostic[]) {
        return diagnostics.map(convertDiagnostic);
    }

    function convertDiagnostic(diagnostic: ts.Diagnostic) {
        return {
            start: diagnostic.start,
            length: diagnostic.length,
            messageText: ts.flattenDiagnosticMessageText(diagnostic.messageText, Harness.IO.newLine()),
            category: (<any>ts).DiagnosticCategory[diagnostic.category],
            code: diagnostic.code
        };
    }

    export function sourceFileToJSON(file: ts.Node): string {
        return JSON.stringify(file, (k, v) => {
            return isNodeOrArray(v) ? serializeNode(v) : v;
        }, "    ");

        function getKindName(k: number | string): string {
            if (typeof k === "string") {
                return k;
            }

            return (<any>ts).SyntaxKind[k];
        }

        function getFlagName(flags: any, f: number): any {
            if (f === 0) {
                return 0;
            }

            let result = "";
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
        function getParserContextFlagName(f: number) { return getFlagName((<any>ts).ParserContextFlags, f); }

        function serializeNode(n: ts.Node): any {
            const o: any = { kind: getKindName(n.kind) };
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
                    case "scriptSnapshot":
                        // Blacklist of items we never put in the baseline file.
                        break;

                    case "originalKeywordKind":
                        o[propertyName] = getKindName((<any>n)[propertyName]);
                        break;

                    case "flags":
                        // Print out flags with their enum names.
                        if (n.flags) {
                            o[propertyName] = getNodeFlagName(n.flags);
                        }
                        break;

                    case "parserContextFlags":
                        // Clear the flag that are produced by aggregating child values..  That is ephemeral 
                        // data we don't care about in the dump.  We only care what the parser set directly
                        // on the ast.
                        let value = n.parserContextFlags & ts.ParserContextFlags.ParserGeneratedFlags;
                        if (value) {
                            o[propertyName] = getParserContextFlagName(value);
                        }
                        break;

                    case "referenceDiagnostics":
                    case "parseDiagnostics":
                        o[propertyName] = Utils.convertDiagnostics((<any>n)[propertyName]);
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
    }

    export function assertDiagnosticsEquals(array1: ts.Diagnostic[], array2: ts.Diagnostic[]) {
        if (array1 === array2) {
            return;
        }

        assert(array1, "array1");
        assert(array2, "array2");

        assert.equal(array1.length, array2.length, "array1.length !== array2.length");

        for (let i = 0, n = array1.length; i < n; i++) {
            const d1 = array1[i];
            const d2 = array2[i];

            assert.equal(d1.start, d2.start, "d1.start !== d2.start");
            assert.equal(d1.length, d2.length, "d1.length !== d2.length");
            assert.equal(
                ts.flattenDiagnosticMessageText(d1.messageText, Harness.IO.newLine()),
                ts.flattenDiagnosticMessageText(d2.messageText, Harness.IO.newLine()), "d1.messageText !== d2.messageText");
            assert.equal(d1.category, d2.category, "d1.category !== d2.category");
            assert.equal(d1.code, d2.code, "d1.code !== d2.code");
        }
    }

    export function assertStructuralEquals(node1: ts.Node, node2: ts.Node) {
        if (node1 === node2) {
            return;
        }

        assert(node1, "node1");
        assert(node2, "node2");
        assert.equal(node1.pos, node2.pos, "node1.pos !== node2.pos");
        assert.equal(node1.end, node2.end, "node1.end !== node2.end");
        assert.equal(node1.kind, node2.kind, "node1.kind !== node2.kind");
        assert.equal(node1.flags, node2.flags, "node1.flags !== node2.flags");

        // call this on both nodes to ensure all propagated flags have been set (and thus can be 
        // compared).
        assert.equal(ts.containsParseError(node1), ts.containsParseError(node2));
        assert.equal(node1.parserContextFlags, node2.parserContextFlags, "node1.parserContextFlags !== node2.parserContextFlags");

        ts.forEachChild(node1,
            child1 => {
                const childName = findChildName(node1, child1);
                const child2: ts.Node = (<any>node2)[childName];

                assertStructuralEquals(child1, child2);
            },
            (array1: ts.NodeArray<ts.Node>) => {
                const childName = findChildName(node1, array1);
                const array2: ts.NodeArray<ts.Node> = (<any>node2)[childName];

                assertArrayStructuralEquals(array1, array2);
            });
    }

    function assertArrayStructuralEquals(array1: ts.NodeArray<ts.Node>, array2: ts.NodeArray<ts.Node>) {
        if (array1 === array2) {
            return;
        }

        assert(array1, "array1");
        assert(array2, "array2");
        assert.equal(array1.pos, array2.pos, "array1.pos !== array2.pos");
        assert.equal(array1.end, array2.end, "array1.end !== array2.end");
        assert.equal(array1.length, array2.length, "array1.length !== array2.length");

        for (let i = 0, n = array1.length; i < n; i++) {
            assertStructuralEquals(array1[i], array2[i]);
        }
    }

    function findChildName(parent: any, child: any) {
        for (const name in parent) {
            if (parent.hasOwnProperty(name) && parent[name] === child) {
                return name;
            }
        }

        throw new Error("Could not find child in parent");
    }
}

namespace Harness.Path {
    export function getFileName(fullPath: string) {
        return fullPath.replace(/^.*[\\\/]/, "");
    }

    export function filePath(fullPath: string) {
        fullPath = ts.normalizeSlashes(fullPath);
        const components = fullPath.split("/");
        const path: string[] = components.slice(0, components.length - 1);
        return path.join("/") + "/";
    }
}

namespace Harness {
    export interface IO {
        newLine(): string;
        getCurrentDirectory(): string;
        useCaseSensitiveFileNames(): boolean;
        resolvePath(path: string): string;
        readFile(path: string): string;
        writeFile(path: string, contents: string): void;
        directoryName(path: string): string;
        createDirectory(path: string): void;
        fileExists(fileName: string): boolean;
        directoryExists(path: string): boolean;
        deleteFile(fileName: string): void;
        listFiles(path: string, filter: RegExp, options?: { recursive?: boolean }): string[];
        log(text: string): void;
        getMemoryUsage?(): number;
        args(): string[];
        getExecutingFilePath(): string;
        exit(exitCode?: number): void;
        readDirectory(path: string, extension?: string, exclude?: string[]): string[];
    }
    export var IO: IO;

    // harness always uses one kind of new line
    const harnessNewLine = "\r\n";

    namespace IOImpl {
        declare class Enumerator {
            public atEnd(): boolean;
            public moveNext(): boolean;
            public item(): any;
            constructor(o: any);
        }

        export namespace CScript {
            let fso: any;
            if (global.ActiveXObject) {
                fso = new global.ActiveXObject("Scripting.FileSystemObject");
            }
            else {
                fso = {};
            }

            export const args = () => ts.sys.args;
            export const getExecutingFilePath = () => ts.sys.getExecutingFilePath();
            export const exit = (exitCode: number) => ts.sys.exit(exitCode);
            export const resolvePath = (path: string) => ts.sys.resolvePath(path);
            export const getCurrentDirectory = () => ts.sys.getCurrentDirectory();
            export const newLine = () => harnessNewLine;
            export const useCaseSensitiveFileNames = () => ts.sys.useCaseSensitiveFileNames;

            export const readFile: typeof IO.readFile = path => ts.sys.readFile(path);
            export const writeFile: typeof IO.writeFile = (path, content) => ts.sys.writeFile(path, content);
            export const directoryName: typeof IO.directoryName = fso.GetParentFolderName;
            export const directoryExists: typeof IO.directoryExists = fso.FolderExists;
            export const fileExists: typeof IO.fileExists = fso.FileExists;
            export const log: typeof IO.log = global.WScript && global.WScript.StdOut.WriteLine;
            export const readDirectory: typeof IO.readDirectory = (path, extension, exclude) => ts.sys.readDirectory(path, extension, exclude);

            export function createDirectory(path: string) {
                if (directoryExists(path)) {
                    fso.CreateFolder(path);
                }
            }

            export function deleteFile(path: string) {
                if (fileExists(path)) {
                    fso.DeleteFile(path, true); // true: delete read-only files
                }
            }

            export let listFiles: typeof IO.listFiles = (path, spec?, options?) => {
                options = options || <{ recursive?: boolean; }>{};
                function filesInFolder(folder: any, root: string): string[] {
                    let paths: string[] = [];
                    let fc: any;

                    if (options.recursive) {
                        fc = new Enumerator(folder.subfolders);

                        for (; !fc.atEnd(); fc.moveNext()) {
                            paths = paths.concat(filesInFolder(fc.item(), root + "\\" + fc.item().Name));
                        }
                    }

                    fc = new Enumerator(folder.files);

                    for (; !fc.atEnd(); fc.moveNext()) {
                        if (!spec || fc.item().Name.match(spec)) {
                            paths.push(root + "\\" + fc.item().Name);
                        }
                    }

                    return paths;
                }

                const folder: any = fso.GetFolder(path);
                const paths: string[] = [];

                return filesInFolder(folder, path);
            };
        }

        export namespace Node {
            declare const require: any;
            let fs: any, pathModule: any;
            if (require) {
                fs = require("fs");
                pathModule = require("path");
            }
            else {
                fs = pathModule = {};
            }

            export const resolvePath = (path: string) => ts.sys.resolvePath(path);
            export const getCurrentDirectory = () => ts.sys.getCurrentDirectory();
            export const newLine = () => harnessNewLine;
            export const useCaseSensitiveFileNames = () => ts.sys.useCaseSensitiveFileNames;
            export const args = () => ts.sys.args;
            export const getExecutingFilePath = () => ts.sys.getExecutingFilePath();
            export const exit = (exitCode: number) => ts.sys.exit(exitCode);

            export const readFile: typeof IO.readFile = path => ts.sys.readFile(path);
            export const writeFile: typeof IO.writeFile = (path, content) => ts.sys.writeFile(path, content);
            export const fileExists: typeof IO.fileExists = fs.existsSync;
            export const log: typeof IO.log = s => console.log(s);

            export const readDirectory: typeof IO.readDirectory = (path, extension, exclude) => ts.sys.readDirectory(path, extension, exclude);

            export function createDirectory(path: string) {
                if (!directoryExists(path)) {
                    fs.mkdirSync(path);
                }
            }

            export function deleteFile(path: string) {
                try {
                    fs.unlinkSync(path);
                }
                catch (e) {
                }
            }

            export function directoryExists(path: string): boolean {
                return fs.existsSync(path) && fs.statSync(path).isDirectory();
            }

            export function directoryName(path: string) {
                let dirPath = pathModule.dirname(path);

                // Node will just continue to repeat the root path, rather than return null
                if (dirPath === path) {
                    dirPath = null;
                }
                else {
                    return dirPath;
                }
            }

            export let listFiles: typeof IO.listFiles = (path, spec?, options?) => {
                options = options || <{ recursive?: boolean; }>{};

                function filesInFolder(folder: string): string[] {
                    let paths: string[] = [];

                    const files = fs.readdirSync(folder);
                    for (let i = 0; i < files.length; i++) {
                        const pathToFile = pathModule.join(folder, files[i]);
                        const stat = fs.statSync(pathToFile);
                        if (options.recursive && stat.isDirectory()) {
                            paths = paths.concat(filesInFolder(pathToFile));
                        }
                        else if (stat.isFile() && (!spec || files[i].match(spec))) {
                            paths.push(pathToFile);
                        }
                    }

                    return paths;
                }

                return filesInFolder(path);
            };

            export let getMemoryUsage: typeof IO.getMemoryUsage = () => {
                if (global.gc) {
                    global.gc();
                }
                return process.memoryUsage().heapUsed;
            };
        }

        export namespace Network {
            const serverRoot = "http://localhost:8888/";

            export const newLine = () => harnessNewLine;
            export const useCaseSensitiveFileNames = () => false;
            export const getCurrentDirectory = () => "";
            export const args = () => <string[]>[];
            export const getExecutingFilePath = () => "";
            export const exit = (exitCode: number) => {};

            const supportsCodePage = () => false;
            export let log = (s: string) => console.log(s);

            namespace Http {
                function waitForXHR(xhr: XMLHttpRequest) {
                    while (xhr.readyState !== 4) { }
                    return { status: xhr.status, responseText: xhr.responseText };
                }

                /// Ask the server to use node's path.resolve to resolve the given path
                function getResolvedPathFromServer(path: string) {
                    const xhr = new XMLHttpRequest();
                    try {
                        xhr.open("GET", path + "?resolve", false);
                        xhr.send();
                    }
                    catch (e) {
                        return { status: 404, responseText: null };
                    }

                    return waitForXHR(xhr);
                }

                export interface XHRResponse {
                    status: number;
                    responseText: string;
                }

                /// Ask the server for the contents of the file at the given URL via a simple GET request
                export function getFileFromServerSync(url: string): XHRResponse {
                    const xhr = new XMLHttpRequest();
                    try {
                        xhr.open("GET", url, false);
                        xhr.send();
                    }
                    catch (e) {
                        return { status: 404, responseText: null };
                    }

                    return waitForXHR(xhr);
                }

                /// Submit a POST request to the server to do the given action (ex WRITE, DELETE) on the provided URL
                export function writeToServerSync(url: string, action: string, contents?: string): XHRResponse {
                    const xhr = new XMLHttpRequest();
                    try {
                        const actionMsg = "?action=" + action;
                        xhr.open("POST", url + actionMsg, false);
                        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                        xhr.send(contents);
                    }
                    catch (e) {
                        log(`XHR Error: ${e}`);
                        return { status: 500, responseText: null };
                    }

                    return waitForXHR(xhr);
                }
            }

            export function createDirectory(path: string) {
                // Do nothing (?)
            }

            export function deleteFile(path: string) {
                Http.writeToServerSync(serverRoot + path, "DELETE", null);
            }

            export function directoryExists(path: string): boolean {
                return false;
            }

            function directoryNameImpl(path: string) {
                let dirPath = path;
                // root of the server
                if (dirPath.match(/localhost:\d+$/) || dirPath.match(/localhost:\d+\/$/)) {
                    dirPath = null;
                    // path + fileName
                }
                else if (dirPath.indexOf(".") === -1) {
                    dirPath = dirPath.substring(0, dirPath.lastIndexOf("/"));
                    // path
                }
                else {
                    // strip any trailing slash
                    if (dirPath.match(/.*\/$/)) {
                        dirPath = dirPath.substring(0, dirPath.length - 2);
                    }
                    dirPath = dirPath.substring(0, dirPath.lastIndexOf("/"));
                }

                return dirPath;
            }
            export let directoryName: typeof IO.directoryName = Utils.memoize(directoryNameImpl);
            export const resolvePath = (path: string) => directoryName(path);

            export function fileExists(path: string): boolean {
                const response = Http.getFileFromServerSync(serverRoot + path);
                return response.status === 200;
            }

            export function _listFilesImpl(path: string, spec?: RegExp, options?: any) {
                const response = Http.getFileFromServerSync(serverRoot + path);
                if (response.status === 200) {
                    const results = response.responseText.split(",");
                    if (spec) {
                        return results.filter(file => spec.test(file));
                    }
                    else {
                        return results;
                    }
                }
                else {
                    return [""];
                }
            };
            export let listFiles = Utils.memoize(_listFilesImpl);

            export function readFile(file: string) {
                const response = Http.getFileFromServerSync(serverRoot + file);
                if (response.status === 200) {
                    return response.responseText;
                }
                else {
                    return null;
                }
            }

            export function writeFile(path: string, contents: string) {
                Http.writeToServerSync(serverRoot + path, "WRITE", contents);
            }

            export function readDirectory(path: string, extension?: string, exclude?: string[]) {
                return listFiles(path).filter(f => !extension || ts.fileExtensionIs(f, extension));
            }
        }
    }

    switch (Utils.getExecutionEnvironment()) {
        case Utils.ExecutionEnvironment.CScript:
            IO = IOImpl.CScript;
            break;
        case Utils.ExecutionEnvironment.Node:
            IO = IOImpl.Node;
            break;
        case Utils.ExecutionEnvironment.Browser:
            IO = IOImpl.Network;
            break;
    }
}

namespace Harness {
    let tcServicesFileName = "typescriptServices.js";

    export let libFolder: string;
    switch (Utils.getExecutionEnvironment()) {
        case Utils.ExecutionEnvironment.CScript:
            libFolder = "built/local/";
            tcServicesFileName = "built/local/typescriptServices.js";
            break;
        case Utils.ExecutionEnvironment.Node:
            libFolder = "built/local/";
            tcServicesFileName = "built/local/typescriptServices.js";
            break;
        case Utils.ExecutionEnvironment.Browser:
            libFolder = "built/local/";
            tcServicesFileName = "built/local/typescriptServices.js";
            break;
        default:
            throw new Error("Unknown context");
    }
    export let tcServicesFile = IO.readFile(tcServicesFileName);

    export interface SourceMapEmitterCallback {
        (emittedFile: string, emittedLine: number, emittedColumn: number, sourceFile: string, sourceLine: number, sourceColumn: number, sourceName: string): void;
    }

    // Settings 
    export let userSpecifiedRoot = "";
    export let lightMode = false;

    /** Functionality for compiling TypeScript code */
    export namespace Compiler {
        /** Aggregate various writes into a single array of lines. Useful for passing to the
         *  TypeScript compiler to fill with source code or errors.
         */
        export class WriterAggregator implements ITextWriter {
            public lines: string[] = [];
            public currentLine = <string>undefined;

            public Write(str: string) {
                // out of memory usage concerns avoid using + or += if we're going to do any manipulation of this string later
                this.currentLine = [(this.currentLine || ""), str].join("");
            }

            public WriteLine(str: string) {
                // out of memory usage concerns avoid using + or += if we're going to do any manipulation of this string later
                this.lines.push([(this.currentLine || ""), str].join(""));
                this.currentLine = undefined;
            }

            public Close() {
                if (this.currentLine !== undefined) { this.lines.push(this.currentLine); }
                this.currentLine = undefined;
            }

            public reset() {
                this.lines = [];
                this.currentLine = undefined;
            }
        }

        export interface IEmitterIOHost {
            writeFile(path: string, contents: string, writeByteOrderMark: boolean): void;
            resolvePath(path: string): string;
        }

        /** Mimics having multiple files, later concatenated to a single file. */
        export class EmitterIOHost implements IEmitterIOHost {
            private fileCollection: any = {};

            /** create file gets the whole path to create, so this works as expected with the --out parameter */
            public writeFile(s: string, contents: string, writeByteOrderMark: boolean): void {
                let writer: ITextWriter;
                if (this.fileCollection[s]) {
                    writer = <ITextWriter>this.fileCollection[s];
                }
                else {
                    writer = new Harness.Compiler.WriterAggregator();
                    this.fileCollection[s] = writer;
                }

                writer.Write(contents);
                writer.Close();
            }

            public resolvePath(s: string) { return s; }

            public reset() { this.fileCollection = {}; }

            public toArray(): { fileName: string; file: WriterAggregator; }[] {
                const result: { fileName: string; file: WriterAggregator; }[] = [];
                for (const p in this.fileCollection) {
                    if (this.fileCollection.hasOwnProperty(p)) {
                        const current = <Harness.Compiler.WriterAggregator>this.fileCollection[p];
                        if (current.lines.length > 0) {
                            if (p.indexOf(".d.ts") !== -1) { current.lines.unshift(["////[", Path.getFileName(p), "]"].join("")); }
                            result.push({ fileName: p, file: this.fileCollection[p] });
                        }
                    }
                }
                return result;
            }
        }

        export function createSourceFileAndAssertInvariants(
            fileName: string,
            sourceText: string,
            languageVersion: ts.ScriptTarget) {
            // We'll only assert inletiants outside of light mode. 
            const shouldAssertInvariants = !Harness.lightMode;

            // Only set the parent nodes if we're asserting inletiants.  We don't need them otherwise.
            const result = ts.createSourceFile(fileName, sourceText, languageVersion, /*setParentNodes:*/ shouldAssertInvariants);

            if (shouldAssertInvariants) {
                Utils.assertInvariants(result, /*parent:*/ undefined);
            }

            return result;
        }

        const carriageReturnLineFeed = "\r\n";
        const lineFeed = "\n";

        export let defaultLibFileName = "lib.d.ts";
        export let defaultLibSourceFile = createSourceFileAndAssertInvariants(defaultLibFileName, IO.readFile(libFolder + "lib.core.d.ts"), /*languageVersion*/ ts.ScriptTarget.Latest);
        export let defaultES6LibSourceFile = createSourceFileAndAssertInvariants(defaultLibFileName, IO.readFile(libFolder + "lib.core.es6.d.ts"), /*languageVersion*/ ts.ScriptTarget.Latest);

        // Cache these between executions so we don't have to re-parse them for every test
        export let fourslashFileName = "fourslash.ts";
        export let fourslashSourceFile: ts.SourceFile;

        export function getCanonicalFileName(fileName: string): string {
            return Harness.IO.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
        }

        export function createCompilerHost(
            inputFiles: { unitName: string; content: string; }[],
            writeFile: (fn: string, contents: string, writeByteOrderMark: boolean) => void,
            scriptTarget: ts.ScriptTarget,
            useCaseSensitiveFileNames: boolean,
            // the currentDirectory is needed for rwcRunner to passed in specified current directory to compiler host
            currentDirectory?: string,
            newLineKind?: ts.NewLineKind): ts.CompilerHost {

            // Local get canonical file name function, that depends on passed in parameter for useCaseSensitiveFileNames
            function getCanonicalFileName(fileName: string): string {
                return useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
            }

            const filemap: { [fileName: string]: ts.SourceFile; } = {};
            const getCurrentDirectory = currentDirectory === undefined ? Harness.IO.getCurrentDirectory : () => currentDirectory;

            // Register input files
            function register(file: { unitName: string; content: string; }) {
                if (file.content !== undefined) {
                    const fileName = ts.normalizePath(file.unitName);
                    const sourceFile = createSourceFileAndAssertInvariants(fileName, file.content, scriptTarget);
                    filemap[getCanonicalFileName(fileName)] = sourceFile;
                    filemap[getCanonicalFileName(ts.getNormalizedAbsolutePath(fileName, getCurrentDirectory()))] = sourceFile;
                }
            };
            inputFiles.forEach(register);

            function getSourceFile(fn: string, languageVersion: ts.ScriptTarget) {
                fn = ts.normalizePath(fn);
                if (Object.prototype.hasOwnProperty.call(filemap, getCanonicalFileName(fn))) {
                    return filemap[getCanonicalFileName(fn)];
                }
                else if (currentDirectory) {
                    const canonicalAbsolutePath = getCanonicalFileName(ts.getNormalizedAbsolutePath(fn, currentDirectory));
                    return Object.prototype.hasOwnProperty.call(filemap, getCanonicalFileName(canonicalAbsolutePath)) ? filemap[canonicalAbsolutePath] : undefined;
                }
                else if (fn === fourslashFileName) {
                    const tsFn = "tests/cases/fourslash/" + fourslashFileName;
                    fourslashSourceFile = fourslashSourceFile || createSourceFileAndAssertInvariants(tsFn, Harness.IO.readFile(tsFn), scriptTarget);
                    return fourslashSourceFile;
                }
                else {
                    if (fn === defaultLibFileName) {
                        return languageVersion === ts.ScriptTarget.ES6 ? defaultES6LibSourceFile : defaultLibSourceFile;
                    }
                    // Don't throw here -- the compiler might be looking for a test that actually doesn't exist as part of the TC
                    return undefined;
                }
            }

            const newLine =
                newLineKind === ts.NewLineKind.CarriageReturnLineFeed ? carriageReturnLineFeed :
                    newLineKind === ts.NewLineKind.LineFeed ? lineFeed :
                        Harness.IO.newLine();

            return {
                getCurrentDirectory,
                getSourceFile,
                getDefaultLibFileName: options => defaultLibFileName,
                writeFile,
                getCanonicalFileName,
                useCaseSensitiveFileNames: () => useCaseSensitiveFileNames,
                getNewLine: () => newLine,
                fileExists: fileName => getSourceFile(fileName, ts.ScriptTarget.ES5) !== undefined,
                readFile: (fileName: string): string => { throw new Error("NotYetImplemented"); }
            };
        }

        interface HarnessOptions {
            useCaseSensitiveFileNames?: boolean;
            includeBuiltFile?: string;
            baselineFile?: string;
            libFiles?: string;
        }

        // Additional options not already in ts.optionDeclarations 
        const harnessOptionDeclarations: ts.CommandLineOption[] = [
            { name: "allowNonTsExtensions", type: "boolean" },
            { name: "useCaseSensitiveFileNames", type: "boolean" },
            { name: "baselineFile", type: "string" },
            { name: "includeBuiltFile", type: "string" },
            { name: "fileName", type: "string" },
            { name: "libFiles", type: "string" },
            { name: "noErrorTruncation", type: "boolean" }
        ];

        let optionsIndex: ts.Map<ts.CommandLineOption>;
        function getCommandLineOption(name: string): ts.CommandLineOption {
            if (!optionsIndex) {
                optionsIndex = {};
                const optionDeclarations = harnessOptionDeclarations.concat(ts.optionDeclarations);
                for (const option of optionDeclarations) {
                    optionsIndex[option.name.toLowerCase()] = option;
                }
            }
            return ts.lookUp(optionsIndex, name.toLowerCase());
        }

        export function setCompilerOptionsFromHarnessSetting(settings: Harness.TestCaseParser.CompilerSettings, options: ts.CompilerOptions & HarnessOptions): void {
            for (const name in settings) {
                if (settings.hasOwnProperty(name)) {
                    const value = settings[name];
                    if (value === undefined) {
                        throw new Error(`Cannot have undefined value for compiler option '${name}'.`);
                    }
                    const option = getCommandLineOption(name);
                    if (option) {
                        switch (option.type) {
                            case "boolean":
                                options[option.name] = value.toLowerCase() === "true";
                                break;
                            case "string":
                                options[option.name] = value;
                                break;
                            // If not a primitive, the possible types are specified in what is effectively a map of options.
                            default:
                                let map = <ts.Map<number>>option.type;
                                let key = value.toLowerCase();
                                if (ts.hasProperty(map, key)) {
                                    options[option.name] = map[key];
                                }
                                else {
                                    throw new Error(`Unknown value '${value}' for compiler option '${name}'.`);
                                }
                        }
                    }
                    else {
                        throw new Error(`Unknown compiler option '${name}'.`);
                    }
                }
            }
        }

        export class HarnessCompiler {
            private inputFiles: { unitName: string; content: string }[] = [];
            private compileOptions: ts.CompilerOptions;
            private settings: Harness.TestCaseParser.CompilerSettings = {};

            private lastErrors: ts.Diagnostic[];

            public reset() {
                this.inputFiles = [];
                this.settings = {};
                this.lastErrors = [];
            }

            public reportCompilationErrors() {
                return this.lastErrors;
            }

            public setCompilerSettings(tcSettings: Harness.TestCaseParser.CompilerSettings) {
                this.settings = tcSettings;
            }

            public addInputFiles(files: { unitName: string; content: string }[]) {
                files.forEach(file => this.addInputFile(file));
            }

            public addInputFile(file: { unitName: string; content: string }) {
                this.inputFiles.push(file);
            }

            public setCompilerOptions(options?: ts.CompilerOptions) {
                this.compileOptions = options || { noResolve: false };
            }

            public emitAll(ioHost?: IEmitterIOHost) {
                this.compileFiles(this.inputFiles,
                    /*otherFiles*/ [],
                    /*onComplete*/ result => {
                        result.files.forEach(writeFile);
                        result.declFilesCode.forEach(writeFile);
                        result.sourceMaps.forEach(writeFile);
                    },
                    /*settingsCallback*/ () => { },
                    this.compileOptions);

                function writeFile(file: GeneratedFile) {
                    ioHost.writeFile(file.fileName, file.code, false);
                }
            }

            public compileFiles(inputFiles: { unitName: string; content: string }[],
                otherFiles: { unitName: string; content: string }[],
                onComplete: (result: CompilerResult, program: ts.Program) => void,
                settingsCallback?: (settings: ts.CompilerOptions) => void,
                options?: ts.CompilerOptions & HarnessOptions,
                // Current directory is needed for rwcRunner to be able to use currentDirectory defined in json file
                currentDirectory?: string) {

                options = options || { noResolve: false };
                options.target = options.target || ts.ScriptTarget.ES3;
                options.module = options.module || ts.ModuleKind.None;
                options.newLine = options.newLine || ts.NewLineKind.CarriageReturnLineFeed;
                options.noErrorTruncation = true;
                options.skipDefaultLibCheck = true;

                if (settingsCallback) {
                    settingsCallback(null);
                }

                const newLine = "\r\n";

                // Parse settings
                setCompilerOptionsFromHarnessSetting(this.settings, options);

                // Files from built\local that are requested by test "@includeBuiltFiles" to be in the context.
                // Treat them as library files, so include them in build, but not in baselines.
                const includeBuiltFiles: { unitName: string; content: string }[] = [];
                if (options.includeBuiltFile) {
                    const builtFileName = libFolder + options.includeBuiltFile;
                    includeBuiltFiles.push({ unitName: builtFileName, content: normalizeLineEndings(IO.readFile(builtFileName), newLine) });
                }

<<<<<<< HEAD
                // Files from tests\lib that are requested by "@libFiles"
                if (options.libFiles) {
                    ts.forEach(options.libFiles.split(','), filename => {
                        let libFileName = 'tests/lib/' + filename;
                        includeBuiltFiles.push({ unitName: libFileName, content: normalizeLineEndings(IO.readFile(libFileName), newLine) });
                    });
                }


                let useCaseSensitiveFileNames = options.useCaseSensitiveFileNames !== undefined ? options.useCaseSensitiveFileNames : Harness.IO.useCaseSensitiveFileNames();
=======
                const useCaseSensitiveFileNames = options.useCaseSensitiveFileNames !== undefined ? options.useCaseSensitiveFileNames : Harness.IO.useCaseSensitiveFileNames();
>>>>>>> ad61788113b6d14b18802c0b0556947dbfbefce5

                const fileOutputs: GeneratedFile[] = [];

                const programFiles = inputFiles.concat(includeBuiltFiles).map(file => file.unitName);

                const compilerHost = createCompilerHost(
                    inputFiles.concat(includeBuiltFiles).concat(otherFiles),
                    (fn, contents, writeByteOrderMark) => fileOutputs.push({ fileName: fn, code: contents, writeByteOrderMark: writeByteOrderMark }),
                    options.target, useCaseSensitiveFileNames, currentDirectory, options.newLine);
                const program = ts.createProgram(programFiles, options, compilerHost);

                const emitResult = program.emit();

                const errors = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
                this.lastErrors = errors;

                const result = new CompilerResult(fileOutputs, errors, program, Harness.IO.getCurrentDirectory(), emitResult.sourceMaps);
                onComplete(result, program);

                return options;
            }

            public compileDeclarationFiles(inputFiles: { unitName: string; content: string; }[],
                otherFiles: { unitName: string; content: string; }[],
                result: CompilerResult,
                settingsCallback?: (settings: ts.CompilerOptions) => void,
                options?: ts.CompilerOptions,
                // Current directory is needed for rwcRunner to be able to use currentDirectory defined in json file
                currentDirectory?: string) {
                if (options.declaration && result.errors.length === 0 && result.declFilesCode.length !== result.files.length) {
                    throw new Error("There were no errors and declFiles generated did not match number of js files generated");
                }

                const declInputFiles: { unitName: string; content: string }[] = [];
                const declOtherFiles: { unitName: string; content: string }[] = [];
                let declResult: Harness.Compiler.CompilerResult;

                // if the .d.ts is non-empty, confirm it compiles correctly as well
                if (options.declaration && result.errors.length === 0 && result.declFilesCode.length > 0) {
                    ts.forEach(inputFiles, file => addDtsFile(file, declInputFiles));
                    ts.forEach(otherFiles, file => addDtsFile(file, declOtherFiles));
                    this.compileFiles(declInputFiles, declOtherFiles, function (compileResult) { declResult = compileResult; },
                        settingsCallback, options, currentDirectory);

                    return { declInputFiles, declOtherFiles, declResult };
                }

                function addDtsFile(file: { unitName: string; content: string }, dtsFiles: { unitName: string; content: string }[]) {
                    if (isDTS(file.unitName)) {
                        dtsFiles.push(file);
                    }
                    else if (isTS(file.unitName)) {
                        const declFile = findResultCodeFile(file.unitName);
                        if (declFile && !findUnit(declFile.fileName, declInputFiles) && !findUnit(declFile.fileName, declOtherFiles)) {
                            dtsFiles.push({ unitName: declFile.fileName, content: declFile.code });
                        }
                    }

                    function findResultCodeFile(fileName: string) {
                        const sourceFile = result.program.getSourceFile(fileName);
                        assert(sourceFile, "Program has no source file with name '" + fileName + "'");
                        // Is this file going to be emitted separately
                        let sourceFileName: string;
                        const outFile = options.outFile || options.out;
                        if (ts.isExternalModule(sourceFile) || !outFile) {
                            if (options.outDir) {
                                let sourceFilePath = ts.getNormalizedAbsolutePath(sourceFile.fileName, result.currentDirectoryForProgram);
                                sourceFilePath = sourceFilePath.replace(result.program.getCommonSourceDirectory(), "");
                                sourceFileName = ts.combinePaths(options.outDir, sourceFilePath);
                            }
                            else {
                                sourceFileName = sourceFile.fileName;
                            }
                        }
                        else {
                            // Goes to single --out file
                            sourceFileName = outFile;
                        }

                        const dTsFileName = ts.removeFileExtension(sourceFileName) + ".d.ts";

                        return ts.forEach(result.declFilesCode, declFile => declFile.fileName === dTsFileName ? declFile : undefined);
                    }

                    function findUnit(fileName: string, units: { unitName: string; content: string; }[]) {
                        return ts.forEach(units, unit => unit.unitName === fileName ? unit : undefined);
                    }
                }
            }
        }

        function normalizeLineEndings(text: string, lineEnding: string): string {
            let normalized = text.replace(/\r\n?/g, "\n");
            if (lineEnding !== "\n") {
                normalized = normalized.replace(/\n/g, lineEnding);
            }
            return normalized;
        }

        export function minimalDiagnosticsToString(diagnostics: ts.Diagnostic[]) {
            // This is basically copied from tsc.ts's reportError to replicate what tsc does
            let errorOutput = "";
            ts.forEach(diagnostics, diagnostic => {
                if (diagnostic.file) {
                    const lineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                    errorOutput += diagnostic.file.fileName + "(" + (lineAndCharacter.line + 1) + "," + (lineAndCharacter.character + 1) + "): ";
                }

                errorOutput += ts.DiagnosticCategory[diagnostic.category].toLowerCase() + " TS" + diagnostic.code + ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, Harness.IO.newLine()) + Harness.IO.newLine();
            });

            return errorOutput;
        }

        export function getErrorBaseline(inputFiles: { unitName: string; content: string }[], diagnostics: ts.Diagnostic[]) {
            diagnostics.sort(ts.compareDiagnostics);
            const outputLines: string[] = [];
            // Count up all errors that were found in files other than lib.d.ts so we don't miss any
            let totalErrorsReportedInNonLibraryFiles = 0;

            function outputErrorText(error: ts.Diagnostic) {
                const message = ts.flattenDiagnosticMessageText(error.messageText, Harness.IO.newLine());

                const errLines = RunnerBase.removeFullPaths(message)
                    .split("\n")
                    .map(s => s.length > 0 && s.charAt(s.length - 1) === "\r" ? s.substr(0, s.length - 1) : s)
                    .filter(s => s.length > 0)
                    .map(s => "!!! " + ts.DiagnosticCategory[error.category].toLowerCase() + " TS" + error.code + ": " + s);
                errLines.forEach(e => outputLines.push(e));

                // do not count errors from lib.d.ts here, they are computed separately as numLibraryDiagnostics
                // if lib.d.ts is explicitly included in input files and there are some errors in it (i.e. because of duplicate identifiers) 
                // then they will be added twice thus triggering 'total errors' assertion with condition
                // 'totalErrorsReportedInNonLibraryFiles + numLibraryDiagnostics + numTest262HarnessDiagnostics, diagnostics.length

                if (!error.file || !isLibraryFile(error.file.fileName)) {
                    totalErrorsReportedInNonLibraryFiles++;
                }
            }

            // Report global errors
            const globalErrors = diagnostics.filter(err => !err.file);
            globalErrors.forEach(outputErrorText);

            // 'merge' the lines of each input file with any errors associated with it
            inputFiles.filter(f => f.content !== undefined).forEach(inputFile => {
                // Filter down to the errors in the file
                const fileErrors = diagnostics.filter(e => {
                    const errFn = e.file;
                    return errFn && errFn.fileName === inputFile.unitName;
                });


                // Header
                outputLines.push("==== " + inputFile.unitName + " (" + fileErrors.length + " errors) ====");

                // Make sure we emit something for every error
                let markedErrorCount = 0;
                // For each line, emit the line followed by any error squiggles matching this line
                // Note: IE JS engine incorrectly handles consecutive delimiters here when using RegExp split, so
                // we have to string-based splitting instead and try to figure out the delimiting chars

                const lineStarts = ts.computeLineStarts(inputFile.content);
                let lines = inputFile.content.split("\n");
                if (lines.length === 1) {
                    lines = lines[0].split("\r");
                }

                lines.forEach((line, lineIndex) => {
                    if (line.length > 0 && line.charAt(line.length - 1) === "\r") {
                        line = line.substr(0, line.length - 1);
                    }

                    const thisLineStart = lineStarts[lineIndex];
                    let nextLineStart: number;
                    // On the last line of the file, fake the next line start number so that we handle errors on the last character of the file correctly
                    if (lineIndex === lines.length - 1) {
                        nextLineStart = inputFile.content.length;
                    }
                    else {
                        nextLineStart = lineStarts[lineIndex + 1];
                    }
                    // Emit this line from the original file
                    outputLines.push("    " + line);
                    fileErrors.forEach(err => {
                        // Does any error start or continue on to this line? Emit squiggles
                        const end = ts.textSpanEnd(err);
                        if ((end >= thisLineStart) && ((err.start < nextLineStart) || (lineIndex === lines.length - 1))) {
                            // How many characters from the start of this line the error starts at (could be positive or negative)
                            const relativeOffset = err.start - thisLineStart;
                            // How many characters of the error are on this line (might be longer than this line in reality)
                            const length = (end - err.start) - Math.max(0, thisLineStart - err.start);
                            // Calculate the start of the squiggle
                            const squiggleStart = Math.max(0, relativeOffset);
                            // TODO/REVIEW: this doesn't work quite right in the browser if a multi file test has files whose names are just the right length relative to one another
                            outputLines.push("    " + line.substr(0, squiggleStart).replace(/[^\s]/g, " ") + new Array(Math.min(length, line.length - squiggleStart) + 1).join("~"));

                            // If the error ended here, or we're at the end of the file, emit its message
                            if ((lineIndex === lines.length - 1) || nextLineStart > end) {
                                // Just like above, we need to do a split on a string instead of on a regex
                                // because the JS engine does regexes wrong

                                outputErrorText(err);
                                markedErrorCount++;
                            }
                        }
                    });
                });

                // Verify we didn't miss any errors in this file
                assert.equal(markedErrorCount, fileErrors.length, "count of errors in " + inputFile.unitName);
            });

            const numLibraryDiagnostics = ts.countWhere(diagnostics, diagnostic => {
                return diagnostic.file && (isLibraryFile(diagnostic.file.fileName) || isBuiltFile(diagnostic.file.fileName));
            });

            const numTest262HarnessDiagnostics = ts.countWhere(diagnostics, diagnostic => {
                // Count an error generated from tests262-harness folder.This should only apply for test262
                return diagnostic.file && diagnostic.file.fileName.indexOf("test262-harness") >= 0;
            });

            // Verify we didn't miss any errors in total
            assert.equal(totalErrorsReportedInNonLibraryFiles + numLibraryDiagnostics + numTest262HarnessDiagnostics, diagnostics.length, "total number of errors");

            return minimalDiagnosticsToString(diagnostics) +
                Harness.IO.newLine() + Harness.IO.newLine() + outputLines.join("\r\n");
        }

        export function collateOutputs(outputFiles: Harness.Compiler.GeneratedFile[]): string {
            // Collect, test, and sort the fileNames
            outputFiles.sort((a, b) => cleanName(a.fileName).localeCompare(cleanName(b.fileName)));

            // Emit them
            let result = "";
            for (const outputFile of outputFiles) {
                // Some extra spacing if this isn't the first file
                if (result.length) {
                    result += "\r\n\r\n";
                }

                // FileName header + content
                result += "/*====== " + outputFile.fileName + " ======*/\r\n";

                result += outputFile.code;
            }

            return result;

            function cleanName(fn: string) {
                const lastSlash = ts.normalizeSlashes(fn).lastIndexOf("/");
                return fn.substr(lastSlash + 1).toLowerCase();
            }
        }

        /** The harness' compiler instance used when tests are actually run. Reseting or changing settings of this compiler instance must be done within a test case (i.e., describe/it) */
        let harnessCompiler: HarnessCompiler;

        /** Returns the singleton harness compiler instance for generating and running tests.
            If required a fresh compiler instance will be created, otherwise the existing singleton will be re-used.
        */
        export function getCompiler() {
            return harnessCompiler = harnessCompiler || new HarnessCompiler();
        }

        // This does not need to exist strictly speaking, but many tests will need to be updated if it's removed
        export function compileString(code: string, unitName: string, callback: (result: CompilerResult) => void) {
            // NEWTODO: Re-implement 'compileString'
            throw new Error("compileString NYI");
        }

        export interface GeneratedFile {
            fileName: string;
            code: string;
            writeByteOrderMark: boolean;
        }

        function stringEndsWith(str: string, end: string) {
            return str.substr(str.length - end.length) === end;
        }

        export function isTS(fileName: string) {
            return stringEndsWith(fileName, ".ts");
        }

        export function isTSX(fileName: string) {
            return stringEndsWith(fileName, ".tsx");
        }

        export function isDTS(fileName: string) {
            return stringEndsWith(fileName, ".d.ts");
        }

        export function isJS(fileName: string) {
            return stringEndsWith(fileName, ".js");
        }
        export function isJSX(fileName: string) {
            return stringEndsWith(fileName, ".jsx");
        }

        export function isJSMap(fileName: string) {
            return stringEndsWith(fileName, ".js.map") || stringEndsWith(fileName, ".jsx.map");
        }

        /** Contains the code and errors of a compilation and some helper methods to check its status. */
        export class CompilerResult {
            public files: GeneratedFile[] = [];
            public errors: ts.Diagnostic[] = [];
            public declFilesCode: GeneratedFile[] = [];
            public sourceMaps: GeneratedFile[] = [];

            /** @param fileResults an array of strings for the fileName and an ITextWriter with its code */
            constructor(fileResults: GeneratedFile[], errors: ts.Diagnostic[], public program: ts.Program,
                public currentDirectoryForProgram: string, private sourceMapData: ts.SourceMapData[]) {

                fileResults.forEach(emittedFile => {
                    if (isDTS(emittedFile.fileName)) {
                        // .d.ts file, add to declFiles emit
                        this.declFilesCode.push(emittedFile);
                    }
                    else if (isJS(emittedFile.fileName) || isJSX(emittedFile.fileName)) {
                        // .js file, add to files
                        this.files.push(emittedFile);
                    }
                    else if (isJSMap(emittedFile.fileName)) {
                        this.sourceMaps.push(emittedFile);
                    }
                    else {
                        throw new Error("Unrecognized file extension for file " + emittedFile.fileName);
                    }
                });

                this.errors = errors;
            }

            public getSourceMapRecord() {
                if (this.sourceMapData) {
                    return Harness.SourceMapRecoder.getSourceMapRecord(this.sourceMapData, this.program, this.files);
                }
            }
        }
    }

    export namespace TestCaseParser {
        /** all the necessary information to set the right compiler settings */
        export interface CompilerSettings {
            [name: string]: string;
        }

        /** All the necessary information to turn a multi file test into useful units for later compilation */
        export interface TestUnitData {
            content: string;
            name: string;
            fileOptions: any;
            originalFilePath: string;
            references: string[];
        }

        // Regex for parsing options in the format "@Alpha: Value of any sort"
        const optionRegex = /^[\/]{2}\s*@(\w+)\s*:\s*(\S*)/gm;  // multiple matches on multiple lines

        function extractCompilerSettings(content: string): CompilerSettings {
            const opts: CompilerSettings = {};

            let match: RegExpExecArray;
            while ((match = optionRegex.exec(content)) != null) {
                opts[match[1]] = match[2];
            }

            return opts;
        }

        /** Given a test file containing // @FileName directives, return an array of named units of code to be added to an existing compiler instance */
        export function makeUnitsFromTest(code: string, fileName: string): { settings: CompilerSettings; testUnitData: TestUnitData[]; } {
            const settings = extractCompilerSettings(code);

            // List of all the subfiles we've parsed out
            const testUnitData: TestUnitData[] = [];

            const lines = Utils.splitContentByNewlines(code);

            // Stuff related to the subfile we're parsing
            let currentFileContent: string = null;
            let currentFileOptions: any = {};
            let currentFileName: any = null;
            let refs: string[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const testMetaData = optionRegex.exec(line);
                if (testMetaData) {
                    // Comment line, check for global/file @options and record them
                    optionRegex.lastIndex = 0;
                    const metaDataName = testMetaData[1].toLowerCase();
                    if (metaDataName === "filename") {
                        currentFileOptions[testMetaData[1]] = testMetaData[2];
                    }
                    else {
                        continue;
                    }

                    // New metadata statement after having collected some code to go with the previous metadata
                    if (currentFileName) {
                        // Store result file
                        const newTestFile = {
                                content: currentFileContent,
                                name: currentFileName,
                                fileOptions: currentFileOptions,
                                originalFilePath: fileName,
                                references: refs
                            };
                        testUnitData.push(newTestFile);

                        // Reset local data
                        currentFileContent = null;
                        currentFileOptions = {};
                        currentFileName = testMetaData[2];
                        refs = [];
                    }
                    else {
                        // First metadata marker in the file
                        currentFileName = testMetaData[2];
                    }
                }
                else {
                    // Subfile content line
                    // Append to the current subfile content, inserting a newline needed
                    if (currentFileContent === null) {
                        currentFileContent = "";
                    }
                    else {
                        // End-of-line
                        currentFileContent = currentFileContent + "\n";
                    }
                    currentFileContent = currentFileContent + line;
                }
            }

            // normalize the fileName for the single file case
            currentFileName = testUnitData.length > 0 ? currentFileName : Path.getFileName(fileName);

            // EOF, push whatever remains
            const newTestFile2 = {
                content: currentFileContent || "",
                name: currentFileName,
                fileOptions: currentFileOptions,
                originalFilePath: fileName,
                references: refs
            };
            testUnitData.push(newTestFile2);

            return { settings, testUnitData };
        }
    }

    /** Support class for baseline files */
    export namespace Baseline {

        export interface BaselineOptions {
            Subfolder?: string;
            Baselinefolder?: string;
        }

        export function localPath(fileName: string, baselineFolder?: string, subfolder?: string) {
            if (baselineFolder === undefined) {
                return baselinePath(fileName, "local", "tests/baselines", subfolder);
            }
            else {
                return baselinePath(fileName, "local", baselineFolder, subfolder);
            }
        }

        function referencePath(fileName: string, baselineFolder?: string, subfolder?: string) {
            if (baselineFolder === undefined) {
                return baselinePath(fileName, "reference", "tests/baselines", subfolder);
            }
            else {
                return baselinePath(fileName, "reference", baselineFolder, subfolder);
            }
        }

        function baselinePath(fileName: string, type: string, baselineFolder: string, subfolder?: string) {
            if (subfolder !== undefined) {
                return Harness.userSpecifiedRoot + baselineFolder + "/" +  subfolder + "/" + type + "/" + fileName;
            }
            else {
                return Harness.userSpecifiedRoot + baselineFolder + "/"  + type + "/" + fileName;
            }
        }

        const fileCache: { [idx: string]: boolean } = {};
        function generateActual(actualFileName: string, generateContent: () => string): string {
            // For now this is written using TypeScript, because sys is not available when running old test cases.
            // But we need to move to sys once we have
            // Creates the directory including its parent if not already present
            function createDirectoryStructure(dirName: string) {
                if (fileCache[dirName] || IO.directoryExists(dirName)) {
                    fileCache[dirName] = true;
                    return;
                }

                const parentDirectory = IO.directoryName(dirName);
                if (parentDirectory != "") {
                    createDirectoryStructure(parentDirectory);
                }
                IO.createDirectory(dirName);
                fileCache[dirName] = true;
            }

            // Create folders if needed
            createDirectoryStructure(Harness.IO.directoryName(actualFileName));

            // Delete the actual file in case it fails
            if (IO.fileExists(actualFileName)) {
                IO.deleteFile(actualFileName);
            }

            const actual = generateContent();

            if (actual === undefined) {
                throw new Error("The generated content was \"undefined\". Return \"null\" if no baselining is required.\"");
            }

            // Store the content in the 'local' folder so we
            // can accept it later (manually)
            if (actual !== null) {
                IO.writeFile(actualFileName, actual);
            }

            return actual;
        }

        function compareToBaseline(actual: string, relativeFileName: string, opts: BaselineOptions) {
            // actual is now either undefined (the generator had an error), null (no file requested),
            // or some real output of the function
            if (actual === undefined) {
                // Nothing to do
                return;
            }

            const refFileName = referencePath(relativeFileName, opts && opts.Baselinefolder, opts && opts.Subfolder);

            if (actual === null) {
                actual = "<no content>";
            }

            let expected = "<no content>";
            if (IO.fileExists(refFileName)) {
                expected = IO.readFile(refFileName);
            }

            return { expected, actual };
        }

        function writeComparison(expected: string, actual: string, relativeFileName: string, actualFileName: string, descriptionForDescribe: string) {
            const encoded_actual =  Utils.encodeString(actual);
            if (expected != encoded_actual) {
                // Overwrite & issue error
                const errMsg = "The baseline file " + relativeFileName + " has changed";
                throw new Error(errMsg);
            }
        }

        export function runBaseline(
            descriptionForDescribe: string,
            relativeFileName: string,
            generateContent: () => string,
            runImmediately = false,
            opts?: BaselineOptions): void {

            let actual = <string>undefined;
            const actualFileName = localPath(relativeFileName, opts && opts.Baselinefolder, opts && opts.Subfolder);

            if (runImmediately) {
                actual = generateActual(actualFileName, generateContent);
                const comparison = compareToBaseline(actual, relativeFileName, opts);
                writeComparison(comparison.expected, comparison.actual, relativeFileName, actualFileName, descriptionForDescribe);
            }
            else {
                actual = generateActual(actualFileName, generateContent);

                const comparison = compareToBaseline(actual, relativeFileName, opts);
                writeComparison(comparison.expected, comparison.actual, relativeFileName, actualFileName, descriptionForDescribe);
            }
        }
    }

    export function isLibraryFile(filePath: string): boolean {
        return (Path.getFileName(filePath) === "lib.d.ts") || (Path.getFileName(filePath) === "lib.core.d.ts");
    }

    export function isBuiltFile(filePath: string): boolean {
        return filePath.indexOf(Harness.libFolder) === 0;
    }

    export function getDefaultLibraryFile(io: Harness.IO): { unitName: string, content: string } {
        const libFile = Harness.userSpecifiedRoot + Harness.libFolder + "lib.d.ts";
        return {
            unitName: libFile,
            content: io.readFile(libFile)
        };
    }

    if (Error) (<any>Error).stackTraceLimit = 1;
}

// TODO: not sure why Utils.evalFile isn't working with this, eventually will concat it like old compiler instead of eval
eval(Harness.tcServicesFile);
