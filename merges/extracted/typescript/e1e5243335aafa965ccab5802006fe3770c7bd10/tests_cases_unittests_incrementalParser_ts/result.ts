/// <reference path="..\..\..\src\harness\external\mocha.d.ts" />
/// <reference path="..\..\..\src\compiler\parser.ts" />

module ts {
    function withChange(text: IScriptSnapshot, start: number, length: number, newText: string): { text: IScriptSnapshot; textChangeRange: TextChangeRange; } {
        var contents = text.getText(0, text.getLength());
        var newContents = contents.substr(0, start) + newText + contents.substring(start + length);

        return { text: ScriptSnapshot.fromString(newContents), textChangeRange: createTextChangeRange(createTextSpan(start, length), newText.length) }
    }

    function withInsert(text: IScriptSnapshot, start: number, newText: string): { text: IScriptSnapshot; textChangeRange: TextChangeRange; } {
        return withChange(text, start, 0, newText);
    }

    function withDelete(text: IScriptSnapshot, start: number, length: number): { text: IScriptSnapshot; textChangeRange: TextChangeRange; } {
        return withChange(text, start, length, "");
    }

    function createTree(text: IScriptSnapshot, version: string) {
        return createLanguageServiceSourceFile(/*fileName:*/ "", text, ScriptTarget.Latest, version, /*isOpen:*/ true, /*setNodeParents:*/ true)
    }

    function assertSameDiagnostics(file1: SourceFile, file2: SourceFile) {
        var diagnostics1 = file1.getSyntacticDiagnostics();
        var diagnostics2 = file2.getSyntacticDiagnostics();

        assert.equal(diagnostics1.length, diagnostics2.length, "diagnostics1.length !== diagnostics2.length");
        for (var i = 0, n = diagnostics1.length; i < n; i++) {
            var d1 = diagnostics1[i];
            var d2 = diagnostics2[i];

            assert.equal(d1.file, file1, "d1.file !== file1");
            assert.equal(d2.file, file2, "d2.file !== file2");
            assert.equal(d1.start, d2.start, "d1.start !== d2.start");
            assert.equal(d1.length, d2.length, "d1.length !== d2.length");
            assert.equal(d1.messageText, d2.messageText, "d1.messageText !== d2.messageText");
            assert.equal(d1.category, d2.category, "d1.category !== d2.category");
            assert.equal(d1.code, d2.code, "d1.code !== d2.code");
            assert.equal(d1.isEarly, d2.isEarly, "d1.isEarly !== d2.isEarly");
        }
    }

    // NOTE: 'reusedElements' is the expected count of elements reused from the old tree to the new
    // tree.  It may change as we tweak the parser.  If the count increases then that should always
    // be a good thing.  If it decreases, that's not great (less reusability), but that may be 
    // unavoidable.  If it does decrease an investigation should be done to make sure that things 
    // are still ok and we're still appropriately reusing most of the tree.
    function compareTrees(oldText: IScriptSnapshot, newText: IScriptSnapshot, textChangeRange: TextChangeRange, expectedReusedElements: number, oldTree?: SourceFile): SourceFile {
        oldTree = oldTree || createTree(oldText, /*version:*/ ".");
        Utils.assertInvariants(oldTree, /*parent:*/ undefined);

        // Create a tree for the new text, in a non-incremental fashion.
        var newTree = createTree(newText, oldTree.version + ".");
        Utils.assertInvariants(newTree, /*parent:*/ undefined);

        // Create a tree for the new text, in an incremental fashion.
        var incrementalNewTree = updateLanguageServiceSourceFile(oldTree, newText, oldTree.version + ".", /*isOpen:*/ true, textChangeRange, /*useIncremental:*/ true);
        Utils.assertInvariants(incrementalNewTree, /*parent:*/ undefined);

        // We should get the same tree when doign a full or incremental parse.
        Utils.assertStructuralEquals(newTree, incrementalNewTree);

        // We should also get the exact same set of diagnostics.
        assertSameDiagnostics(newTree, incrementalNewTree);

        // There should be no reused nodes between two trees that are fully parsed.
        assert.isTrue(reusedElements(oldTree, newTree) === 0);

        assert.equal(newTree.filename, incrementalNewTree.filename, "newTree.filename !== incrementalNewTree.filename");
        assert.equal(newTree.text, incrementalNewTree.text, "newTree.filename !== incrementalNewTree.filename");

        if (expectedReusedElements !== -1) {
            var actualReusedCount = reusedElements(oldTree, incrementalNewTree);
            assert.equal(actualReusedCount, expectedReusedElements, actualReusedCount + " !== " + expectedReusedElements);
        }

        return incrementalNewTree;
    }

<<<<<<< HEAD
    function assertStructuralEquals(node1: Node, node2: Node) {
        if (node1 === node2) {
            return;
        }

        assert(node1, "node1");
        assert(node2, "node2");
        assert.equal(node1.pos, node2.pos, "node1.pos !== node2.pos");
        assert.equal(node1.end, node2.end, "node1.end !== node2.end");
        assert.equal(node1.kind, node2.kind, "node1.kind !== node2.kind");

        // call this on both nodes to ensure all propagated flags have been set (and thus can be 
        // compared).
        ts.containsParseError(node1);
        ts.containsParseError(node2);
        assert.equal(node1.flags, node2.flags, "node1.flags !== node2.flags");
        assert.equal(node1.parserContextFlags, node2.parserContextFlags, "node1.parserContextFlags !== node2.parserContextFlags");

        forEachChild(node1,
            child1 => {
                var childName = findChildName(node1, child1);
                var child2: Node = (<any>node2)[childName];

                assertStructuralEquals(child1, child2);
            },
            (array1: NodeArray<Node>) => {
                var childName = findChildName(node1, array1);
                var array2: NodeArray<Node> = (<any>node2)[childName];

                assertArrayStructuralEquals(array1, array2);
            });
    }

    function assertArrayStructuralEquals(array1: NodeArray<Node>, array2: NodeArray<Node>) {
        if (array1 === array2) {
            return;
        }

        assert(array1, "array1");
        assert(array2, "array2");
        assert.equal(array1.pos, array2.pos, "array1.pos !== array2.pos");
        assert.equal(array1.end, array2.end, "array1.end !== array2.end");
        assert.equal(array1.length, array2.length, "array1.length !== array2.length");

        for (var i = 0, n = array1.length; i < n; i++) {
            assertStructuralEquals(array1[i], array2[i]);
        }
    }

    function findChildName(parent: any, child: any) {
        for (var name in parent) {
            if (parent.hasOwnProperty(name) && parent[name] === child) {
                return name;
            }
        }

        throw new Error("Could not find child in parent");
    }

=======
>>>>>>> 2bb0eb604bb95db67aaf55f800a228207a75d95a
    function reusedElements(oldNode: SourceFile, newNode: SourceFile): number {
        var allOldElements = collectElements(oldNode);
        var allNewElements = collectElements(newNode);

        return filter(allOldElements, v => contains(allNewElements, v)).length;
    }

    function collectElements(node: Node) {
        var result: Node[] = [];
        visit(node);
        return result;

        function visit(node: Node) {
            result.push(node);
            forEachChild(node, visit);
        }
    }

    function deleteCode(source: string, index: number, toDelete: string) {
        var repeat = toDelete.length;
        var oldTree = createTree(ScriptSnapshot.fromString(source), /*version:*/ ".");
        for (var i = 0; i < repeat; i++) {
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index, 1);
            var newTree = compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, -1, oldTree);

            source = newTextAndChange.text.getText(0, newTextAndChange.text.getLength());
            oldTree = newTree;
        }
    }

    function insertCode(source: string, index: number, toInsert: string) {
        var repeat = toInsert.length;
        var oldTree = createTree(ScriptSnapshot.fromString(source), /*version:*/ ".");
        for (var i = 0; i < repeat; i++) {
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index + i, toInsert.charAt(i));
            var newTree = compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, -1, oldTree);

            source = newTextAndChange.text.getText(0, newTextAndChange.text.getLength());
            oldTree = newTree;
        }
    }

    describe('Incremental',() => {
        it('Inserting into method',() => {
            var source = "class C {\r\n" +
                "    public foo1() { }\r\n" +
                "    public foo2() {\r\n" +
                "        return 1;\r\n" +
                "    }\r\n" +
                "    public foo3() { }\r\n" +
                "}";

            var oldText = ScriptSnapshot.fromString(source);
            var semicolonIndex = source.indexOf(";");
            var newTextAndChange = withInsert(oldText, semicolonIndex, " + 1");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 8);
        });

        it('Deleting from method',() => {
            var source = "class C {\r\n" +
                "    public foo1() { }\r\n" +
                "    public foo2() {\r\n" +
                "        return 1 + 1;\r\n" +
                "    }\r\n" +
                "    public foo3() { }\r\n" +
                "}";

            var index = source.indexOf("+ 1");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index, "+ 1".length);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 8);
        });

        it('Regular expression 1',() => {
            var source = "class C { public foo1() { /; } public foo2() { return 1;} public foo3() { } }";

            var semicolonIndex = source.indexOf(";}");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, semicolonIndex, "/");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Regular expression 2',() => {
            var source = "class C { public foo1() { ; } public foo2() { return 1/;} public foo3() { } }";

            var semicolonIndex = source.indexOf(";");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, semicolonIndex, "/");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 4);
        });

        it('Comment 1',() => {
            var source = "class C { public foo1() { /; } public foo2() { return 1; } public foo3() { } }";

            var semicolonIndex = source.indexOf(";");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, semicolonIndex, "/");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Comment 2',() => {
            var source = "class C { public foo1() { /; } public foo2() { return 1; } public foo3() { } }";

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, 0, "//");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Comment 3',() => {
            var source = "//class C { public foo1() { /; } public foo2() { return 1; } public foo3() { } }";

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, 0, 2);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Comment 4',() => {
            var source = "class C { public foo1() { /; } public foo2() { */ return 1; } public foo3() { } }";

            var index = source.indexOf(";");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index, "*");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 4);
        });

        it('Parameter 1',() => {
            // Should be able to reuse all the parameters.
            var source = "class C {\r\n" +
                "    public foo2(a, b, c, d) {\r\n" +
                "        return 1;\r\n" +
                "    }\r\n" +
                "}";

            var semicolonIndex = source.indexOf(";");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, semicolonIndex, " + 1");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 8);
        });

        it('Type member 1',() => {
            // Should be able to reuse most of the type members.
            var source = "interface I { a: number; b: string; (c): d; new (e): f; g(): h }";

            var index = source.indexOf(": string");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index, "?");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 14);
        });

        it('Enum element 1',() => {
            // Should be able to reuse most of the enum elements.
            var source = "enum E { a = 1, b = 1 << 1, c = 3, e = 4, f = 5, g = 7, h = 8, i = 9, j = 10 }";

            var index = source.indexOf("<<");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, index, 2, "+");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 21);
        });

        it('Strict mode 1',() => {
            // In non-strict mode 'package' means nothing and can be reused.  In strict mode though
            // we'll have to reparse the nodes (and generate an error for 'package();'
            //
            // Note: in this test we don't actually add 'use strict'.  This is so we can compare 
            // reuse with/without a strict mode change.
            var source = "foo1();\r\nfoo1();\r\nfoo1();\r\package();";

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, 0, "'strict';\r\n");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Strict mode 2',() => {
            // In non-strict mode 'package' means nothing and can be reused.  In strict mode though
            // we'll have to reparse the nodes (and generate an error for 'package();'
            var source = "foo1();\r\nfoo1();\r\nfoo1();\r\package();";

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, 0, "'use strict';\r\n");

            // Note the decreased reuse of nodes compared to 'Strict mode 1'
            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Strict mode 3',() => {
            // In non-strict mode 'package' means nothing and can be reused.  In strict mode though
            // we'll have to reparse the nodes (and generate an error for 'package();'
            //
            // Note: in this test we don't actually remove 'use strict'.  This is so we can compare 
            // reuse with/without a strict mode change.
            var source = "'strict';\r\nfoo1();\r\nfoo1();\r\nfoo1();\r\npackage();";

            var index = source.indexOf('f');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, 0, index);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Strict mode 4',() => {
            // In non-strict mode 'package' means nothing and can be reused.  In strict mode though
            // we'll have to reparse the nodes (and generate an error for 'package();'
            var source = "'use strict';\r\nfoo1();\r\nfoo1();\r\nfoo1();\r\npackage();";

            var index = source.indexOf('f');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, 0, index);

            // Note the decreased reuse of nodes compared to testStrictMode3
            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Strict mode 5',() => {
            var source = "'use blahhh';\r\nfoo1();\r\nfoo2();\r\nfoo3();\r\nfoo4();\r\nfoo4();\r\nfoo6();\r\nfoo7();\r\nfoo8();\r\nfoo9();\r\n";

            var index = source.indexOf('b');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, index, 6, "strict");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Strict mode 6',() => {
            var source = "'use strict';\r\nfoo1();\r\nfoo2();\r\nfoo3();\r\nfoo4();\r\nfoo4();\r\nfoo6();\r\nfoo7();\r\nfoo8();\r\nfoo9();\r\n";

            var index = source.indexOf('s');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, index, 6, "blahhh");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Strict mode 7',() => {
            var source = "'use blahhh';\r\nfoo1();\r\nfoo2();\r\nfoo3();\r\nfoo4();\r\nfoo4();\r\nfoo6();\r\nfoo7();\r\nfoo8();\r\nfoo9();\r\n";

            var index = source.indexOf('f');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, 0, index);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Parenthesized expression to arrow function 1',() => {
            var source = "var v = (a, b, c, d, e)";

            var index = source.indexOf('a');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index + 1, ":");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Parenthesized expression to arrow function 2',() => {
            var source = "var v = (a, b) = c";

            var index = source.indexOf("= c") + 1;
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index, ">");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Arrow function to parenthesized expression 1',() => {
            var source = "var v = (a:, b, c, d, e)";

            var index = source.indexOf(':');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index, 1);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Arrow function to parenthesized expression 2',() => {
            var source = "var v = (a, b) => c";

            var index = source.indexOf(">");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index, 1);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Speculative generic lookahead 1',() => {
            var source = "var v = F<b>e";

            var index = source.indexOf('b');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index + 1, ",x");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, -1);
        });

        it('Speculative generic lookahead 2',() => {
            var source = "var v = F<a,b>e";

            var index = source.indexOf('b');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index + 1, ",x");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, -1);
        });

        it('Speculative generic lookahead 3',() => {
            var source = "var v = F<a,b,c>e";

            var index = source.indexOf('b');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index + 1, ",x");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, -1);
        });

        it('Speculative generic lookahead 4',() => {
            var source = "var v = F<a,b,c,d>e";

            var index = source.indexOf('b');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index + 1, ",x");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, -1);
        });

        it('Assertion to arrow function',() => {
            var source = "var v = <T>(a);";

            var index = source.indexOf(';');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index, " => 1");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Arrow function to assertion',() => {
            var source = "var v = <T>(a) => 1;";

            var index = source.indexOf(' =>');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index, " => 1".length);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Contextual shift to shift-equals',() => {
            var source = "var v = 1 >> = 2";

            var index = source.indexOf('>> =');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index + 2, 1);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Contextual shift-equals to shift',() => {
            var source = "var v = 1 >>= 2";

            var index = source.indexOf('>>=');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index + 2, " ");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Contextual shift to generic invocation',() => {
            var source = "var v = T>>(2)";

            var index = source.indexOf('T');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, index, "Foo<Bar<");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Test generic invocation to contextual shift',() => {
            var source = "var v = Foo<Bar<T>>(2)";

            var index = source.indexOf('Foo<Bar<');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index, "Foo<Bar<".length);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Contextual shift to generic type and initializer',() => {
            var source = "var v = T>>=2;";

            var index = source.indexOf('=');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, index, "= ".length, ": Foo<Bar<");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Generic type and initializer to contextual shift',() => {
            var source = "var v : Foo<Bar<T>>=2;";

            var index = source.indexOf(':');
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, index, ": Foo<Bar<".length, "= ");

            // Note the decreased reuse of nodes compared to testStrictMode3
            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Arithmetic operator to type argument list',() => {
            var source = "var v = new Dictionary<A, B>0";

            var index = source.indexOf("0");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, index, 1, "()");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Type argument list to arithmetic operator',() => {
            var source = "var v = new Dictionary<A, B>()";

            var index = source.indexOf("()");
            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, index, 2);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Yield context 1',() => {
            // We're changing from a non-generator to a genarator.  We can't reuse statement nodes.
            var source = "function foo() {\r\nyield(foo1);\r\n}";

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.indexOf("foo");
            var newTextAndChange = withInsert(oldText, index, "*");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Yield context 2',() => {
            // We're changing from a generator to a non-genarator.  We can't reuse statement nodes.
            var source = "function *foo() {\r\nyield(foo1);\r\n}";

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.indexOf("*");
            var newTextAndChange = withDelete(oldText, index, "*".length);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Delete semicolon',() => {
            var source = "export class Foo {\r\n}\r\n\r\nexport var foo = new Foo();\r\n\r\n    export function test(foo: Foo) {\r\n        return true;\r\n    }\r\n";

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.lastIndexOf(";");
            var newTextAndChange = withDelete(oldText, index, 1);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 4);
        });

        it('Edit after empty type parameter list',() => {
            var source = "class Dictionary<> { }\r\nvar y;\r\n";

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.length;
            var newTextAndChange = withInsert(oldText, index, "var x;");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Delete parameter after comment',() => {
            var source = "function fn(/* comment! */ a: number, c) { }";

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.indexOf("a:");
            var newTextAndChange = withDelete(oldText, index, "a: number,".length);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Modifier added to accessor',() => {
            var source =
                "class C {\
    set Bar(bar:string) {}\
}\
var o2 = { set Foo(val:number) { } };";

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.indexOf("set");
            var newTextAndChange = withInsert(oldText, index, "public ");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 6);
        });

        it('Insert parameter ahead of parameter',() => {
            var source =
                "alert(100);\
\
class OverloadedMonster {\
constructor();\
constructor(name) { }\
}";

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.indexOf("100");
            var newTextAndChange = withInsert(oldText, index, "'1', ");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 5);
        });

        it('Insert declare modifier before module',() => {
            var source =
                "module mAmbient {\
module m3 { }\
}";

            var oldText = ScriptSnapshot.fromString(source);
            var index = 0;
            var newTextAndChange = withInsert(oldText, index, "declare ");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 3);
        });

        it('Insert function above arrow function with comment',() => {
            var source =
                "\
() =>\
   // do something\
0;";

            var oldText = ScriptSnapshot.fromString(source);
            var index = 0;
            var newTextAndChange = withInsert(oldText, index, "function Foo() { }");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Finish incomplete regular expression',() => {
            var source = "while (true) /3; return;"

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.length - 1;
            var newTextAndChange = withInsert(oldText, index, "/");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Regular expression to divide operation',() => {
            var source = "return;\r\nwhile (true) /3/g;"

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.indexOf("while");
            var newTextAndChange = withDelete(oldText, index, "while ".length);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Divide operation to regular expression',() => {
            var source = "return;\r\n(true) /3/g;"

            var oldText = ScriptSnapshot.fromString(source);
            var index = source.indexOf("(");
            var newTextAndChange = withInsert(oldText, index, "while ");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Unterminated comment after keyword converted to identifier',() => {
            // 'public' as a keyword should be incrementally unusable (because it has an 
            // unterminated comment).  When we convert it to an identifier, that shouldn't
            // change anything, and we should still get the same errors.
            var source = "return; a.public /*"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, 0, "");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 7);
        });

        it('Class to interface',() => {
            var source = "class A { public M1() { } public M2() { } public M3() { } p1 = 0; p2 = 0; p3 = 0 }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "class".length, "interface");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Interface to class',() => {
            var source = "interface A { M1?(); M2?(); M3?(); p1?; p2?; p3? }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "interface".length, "class");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Surrounding function declarations with block',() => {
            debugger;
            var source = "declare function F1() { } export function F2() { } declare export function F3() { }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withInsert(oldText, 0, "{");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 9);
        });

        it('Removing block around function declarations',() => {
            var source = "{ declare function F1() { } export function F2() { } declare export function F3() { }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withDelete(oldText, 0, "{".length);

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Moving methods from class to object literal',() => {
            var source = "class C { public A() { } public B() { } public C() { } }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "class C".length, "var v =");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Moving methods from object literal to class',() => {
            var source = "var v = { public A() { } public B() { } public C() { } }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "var v =".length, "class C");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 4);
        });

        it('Moving index signatures from class to interface',() => {
            var source = "class C { public [a: number]: string; public [a: number]: string; public [a: number]: string }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "class".length, "interface");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 18);
        });

        it('Moving index signatures from interface to class',() => {
            var source = "interface C { public [a: number]: string; public [a: number]: string; public [a: number]: string }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "interface".length, "class");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 18);
        });

        it('Moving accessors from class to object literal',() => {
            var source = "class C { public get A() { } public get B() { } public get C() { } }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "class C".length, "var v =");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 0);
        });

        it('Moving accessors from object literal to class',() => {
            var source = "var v = { public get A() { } public get B() { } public get C() { } }"

            var oldText = ScriptSnapshot.fromString(source);
            var newTextAndChange = withChange(oldText, 0, "var v =".length, "class C");

            compareTrees(oldText, newTextAndChange.text, newTextAndChange.textChangeRange, 4);
        });

        // Simulated typing tests.

        it('Type extends clause 1',() => {
            var source = "interface IFoo<T> { }\r\ninterface Array<T> extends IFoo<T> { }";

            var index = source.indexOf('extends');
            deleteCode(source, index, "extends IFoo<T>");
        });

        it('Type after incomplete enum 1',() => {
            var source = "function foo() {\r\n" +
                "            function getOccurrencesAtPosition() {\r\n" +
                "            switch (node) {\r\n" +
                "                enum \r\n" +
                "            }\r\n" +
                "                \r\n" +
                "                return undefined;\r\n" +
                "                \r\n" +
                "                function keywordToReferenceEntry() {\r\n" +
                "                }\r\n" +
                "            }\r\n" +
                "                \r\n" +
                "            return {\r\n" +
                "                getEmitOutput: (filename): Bar => null,\r\n" +
                "            };\r\n" +
                "        }";

            var index = source.indexOf("enum ") + "enum ".length;
            insertCode(source, index, "Fo");
        });
    });
}