//// [FunctionPropertyAssignments5_es6.ts]
var v = { *[foo()]() { } }

//// [FunctionPropertyAssignments5_es6.js]
<<<<<<< HEAD
var v = (_a = {}, _a[foo()] = function () { }, _a);
=======
var v = (_a = {},
    _a[foo()] = function () { },
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
