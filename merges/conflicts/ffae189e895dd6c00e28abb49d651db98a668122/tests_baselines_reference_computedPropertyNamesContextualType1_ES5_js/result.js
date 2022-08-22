//// [computedPropertyNamesContextualType1_ES5.ts]
interface I {
    [s: string]: (x: string) => number;
    [s: number]: (x: any) => number; // Doesn't get hit
}

var o: I = {
    ["" + 0](y) { return y.length; },
    ["" + 1]: y => y.length
}

//// [computedPropertyNamesContextualType1_ES5.js]
var o = (_a = {},
    _a["" + 0] = function (y) { return y.length; },
    _a["" + 1] = function (y) { return y.length; },
<<<<<<< HEAD
    _a
);
=======
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
