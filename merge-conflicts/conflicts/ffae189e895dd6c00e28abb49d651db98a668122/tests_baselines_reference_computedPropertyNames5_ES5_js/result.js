//// [computedPropertyNames5_ES5.ts]
var b: boolean;
var v = {
    [b]: 0,
    [true]: 1,
    [[]]: 0,
    [{}]: 0,
    [undefined]: undefined,
    [null]: null
}

//// [computedPropertyNames5_ES5.js]
var b;
var v = (_a = {},
    _a[b] = 0,
    _a[true] = 1,
    _a[[]] = 0,
    _a[{}] = 0,
    _a[undefined] = undefined,
    _a[null] = null,
<<<<<<< HEAD
    _a
);
=======
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
