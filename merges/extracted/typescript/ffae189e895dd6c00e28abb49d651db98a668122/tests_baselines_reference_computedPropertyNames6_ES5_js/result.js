//// [computedPropertyNames6_ES5.ts]
var p1: number | string;
var p2: number | number[];
var p3: string | boolean;
var v = {
    [p1]: 0,
    [p2]: 1,
    [p3]: 2
}

//// [computedPropertyNames6_ES5.js]
var p1;
var p2;
var p3;
var v = (_a = {},
    _a[p1] = 0,
    _a[p2] = 1,
    _a[p3] = 2,
<<<<<<< HEAD
    _a
);
=======
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
