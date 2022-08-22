//// [computedPropertyNamesDeclarationEmit5_ES5.ts]
var v = {
    ["" + ""]: 0,
    ["" + ""]() { },
    get ["" + ""]() { return 0; },
    set ["" + ""](x) { }
}

//// [computedPropertyNamesDeclarationEmit5_ES5.js]
<<<<<<< HEAD
var v = (_a = {}, _a["" + ""] = 0, _a["" + ""] = function () { }, _a["" + ""] = Object.defineProperty({ get: function () { return 0; }, enumerable: true, configurable: true }), _a["" + ""] = Object.defineProperty({ set: function (x) { }, enumerable: true, configurable: true }), _a);
=======
var v = (_a = {}, _a["" + ""] =
0, _a["" + ""] = function () { }, _a["" + ""] = Object.defineProperty({ get: function () {
    return 0;
}, enumerable: true, configurable: true }), _a["" + ""] = Object.defineProperty({ set: function (x) { }, enumerable: true, configurable: true }),
_a);
>>>>>>> df963e42182d501421e32a02f32912029f8bb683
var _a;


//// [computedPropertyNamesDeclarationEmit5_ES5.d.ts]
declare var v: {};
