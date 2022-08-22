//// [computedPropertyNamesDeclarationEmit5_ES5.ts]
var v = {
    ["" + ""]: 0,
    ["" + ""]() { },
    get ["" + ""]() { return 0; },
    set ["" + ""](x) { }
}

//// [computedPropertyNamesDeclarationEmit5_ES5.js]
var v = (_a = {},
    _a["" + ""] = 0,
    _a["" + ""] = function () { },
<<<<<<< HEAD
    Object.defineProperty(_a, "" + "", {
        get: function () { return 0; },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, "" + "", {
        set: function (x) { },
        enumerable: true,
        configurable: true
    }),
    _a
);
=======
    _a["" + ""] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }),
    _a["" + ""] = Object.defineProperty({ set: function (x) { }, enumerable: true, configurable: true }),
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;


//// [computedPropertyNamesDeclarationEmit5_ES5.d.ts]
declare var v: {};
