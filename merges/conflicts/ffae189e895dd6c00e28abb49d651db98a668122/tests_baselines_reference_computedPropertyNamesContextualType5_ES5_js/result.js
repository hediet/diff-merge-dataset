//// [computedPropertyNamesContextualType5_ES5.ts]
interface I {
    [s: string]: any;
    [s: number]: any;
}

var o: I = {
    [+"foo"]: "",
    [+"bar"]: 0
}

//// [computedPropertyNamesContextualType5_ES5.js]
var o = (_a = {},
    _a[+"foo"] = "",
    _a[+"bar"] = 0,
<<<<<<< HEAD
    _a
);
=======
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
