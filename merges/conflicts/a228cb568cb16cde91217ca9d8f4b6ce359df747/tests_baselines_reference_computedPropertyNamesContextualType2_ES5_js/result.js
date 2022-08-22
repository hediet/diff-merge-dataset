//// [computedPropertyNamesContextualType2_ES5.ts]
interface I {
    [s: string]: (x: any) => number; // Doesn't get hit
    [s: number]: (x: string) => number;
}

var o: I = {
    [+"foo"](y) { return y.length; },
    [+"bar"]: y => y.length
}

//// [computedPropertyNamesContextualType2_ES5.js]
<<<<<<< HEAD
var o = (_a = {}, _a[+"foo"] = function (y) { return y.length; }, _a[+"bar"] = function (y) { return y.length; }, _a);
=======
var o = (_a = {}, _a[+"foo"] = function (y) {
    return y.length;
}, _a[+"bar"] =
function (y) { return y.length; },
_a);
>>>>>>> df963e42182d501421e32a02f32912029f8bb683
var _a;
