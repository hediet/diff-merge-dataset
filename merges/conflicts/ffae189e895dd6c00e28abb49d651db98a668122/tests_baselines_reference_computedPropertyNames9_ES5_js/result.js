//// [computedPropertyNames9_ES5.ts]
function f(s: string): string;
function f(n: number): number;
function f<T>(x: T): T;
function f(x): any { }

var v = {
    [f("")]: 0,
    [f(0)]: 0,
    [f(true)]: 0
}

//// [computedPropertyNames9_ES5.js]
function f(x) { }
var v = (_a = {},
    _a[f("")] = 0,
    _a[f(0)] = 0,
    _a[f(true)] = 0,
<<<<<<< HEAD
    _a
);
=======
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
