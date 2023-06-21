//// [FunctionDeclaration9_es6.ts]
function * foo() {
  var v = { [yield]: foo }
}

//// [FunctionDeclaration9_es6.js]
function foo() {
<<<<<<< HEAD
    var v = (_a = {}, _a[] = foo, _a);
=======
    var v = (_a = {},
        _a[] = foo,
        _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
    var _a;
}
