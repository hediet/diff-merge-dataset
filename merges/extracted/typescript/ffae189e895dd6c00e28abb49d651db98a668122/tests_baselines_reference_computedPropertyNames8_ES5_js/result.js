//// [computedPropertyNames8_ES5.ts]
function f<T, U extends string>() {
    var t: T;
    var u: U;
    var v = {
        [t]: 0,
        [u]: 1
    };
}

//// [computedPropertyNames8_ES5.js]
function f() {
    var t;
    var u;
    var v = (_a = {},
        _a[t] = 0,
        _a[u] = 1,
<<<<<<< HEAD
        _a
    );
=======
        _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
    var _a;
}
