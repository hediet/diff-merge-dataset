//// [computedPropertyNames11_ES5.ts]
var s: string;
var n: number;
var a: any;
var v = {
    get [s]() { return 0; },
    set [n](v) { },
    get [s + s]() { return 0; },
    set [s + n](v) { },
    get [+s]() { return 0; },
    set [""](v) { },
    get [0]() { return 0; },
    set [a](v) { },
    get [<any>true]() { return 0; },
    set [`hello bye`](v) { },
    get [`hello ${a} bye`]() { return 0; }
}

//// [computedPropertyNames11_ES5.js]
var s;
var n;
var a;
var v = (_a = {},
<<<<<<< HEAD
    Object.defineProperty(_a, s, {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, n, {
        set: function (v) { },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, s + s, {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, s + n, {
        set: function (v) { },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, +s, {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, "", {
        set: function (v) { },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, 0, {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, a, {
        set: function (v) { },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, true, {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, "hello bye", {
        set: function (v) { },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, "hello " + a + " bye", {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    _a
);
=======
    _a[s] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a[n] = Object.defineProperty({ set: function (v) { }, enumerable: true, configurable: true }),
    _a[s + s] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a[s + n] = Object.defineProperty({ set: function (v) { }, enumerable: true, configurable: true }),
    _a[+s] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a[""] = Object.defineProperty({ set: function (v) { }, enumerable: true, configurable: true }),
    _a[0] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a[a] = Object.defineProperty({ set: function (v) { }, enumerable: true, configurable: true }),
    _a[true] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a["hello bye"] = Object.defineProperty({ set: function (v) { }, enumerable: true, configurable: true }),
    _a["hello " + a + " bye"] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
