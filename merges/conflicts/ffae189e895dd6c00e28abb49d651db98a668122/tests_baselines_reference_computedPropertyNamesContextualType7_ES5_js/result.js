//// [computedPropertyNamesContextualType7_ES5.ts]
interface I<T> {
    [s: number]: T;
}

declare function foo<T>(obj: I<T>): T

foo({
    p: "",
    0: () => { },
    ["hi" + "bye"]: true,
    [0 + 1]: 0,
    [+"hi"]: [0]
});

//// [computedPropertyNamesContextualType7_ES5.js]
foo((_a = {
<<<<<<< HEAD
        p: "",
        0: function () { }
    },
    _a["hi" + "bye"] = true,
    _a[0 + 1] = 0,
    _a[+"hi"] = [0],
    _a
));
=======
    p: "",
    0: function () { }
},
    _a.p = "",
    _a[0] = function () { },
    _a["hi" + "bye"] = true,
    _a[0 + 1] = 0,
    _a[+"hi"] = [0],
    _a));
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
