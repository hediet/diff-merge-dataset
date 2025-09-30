//// [parserES5ComputedPropertyName4.ts]
var v = { get [e]() { } };

//// [parserES5ComputedPropertyName4.js]
<<<<<<< HEAD
var v = (_a = {}, Object.defineProperty(_a, e, {
    get: function () { },
    enumerable: true,
    configurable: true
}), _a);
=======
var v = (_a = {},
    _a[e] = Object.defineProperty({ get: function () { }, enumerable: true, configurable: true }),
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
