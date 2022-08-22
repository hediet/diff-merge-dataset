//// [computedPropertyNames1_ES5.ts]
var v = {
    get [0 + 1]() { return 0 },
    set [0 + 1](v: string) { } //No error
}

//// [computedPropertyNames1_ES5.js]
var v = (_a = {},
<<<<<<< HEAD
    Object.defineProperty(_a, 0 + 1, {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, 0 + 1, {
        set: function (v) { } //No error
        ,
        enumerable: true,
        configurable: true
    }),
    _a
);
=======
    _a[0 + 1] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a[0 + 1] = Object.defineProperty({ set: function (v) { }, enumerable: true, configurable: true }),
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
