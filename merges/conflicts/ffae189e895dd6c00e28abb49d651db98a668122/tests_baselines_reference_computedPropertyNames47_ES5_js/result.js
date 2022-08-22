//// [computedPropertyNames47_ES5.ts]
enum E1 { x }
enum E2 { x }
var o = {
    [E1.x || E2.x]: 0
};

//// [computedPropertyNames47_ES5.js]
var E1;
(function (E1) {
    E1[E1["x"] = 0] = "x";
})(E1 || (E1 = {}));
var E2;
(function (E2) {
    E2[E2["x"] = 0] = "x";
})(E2 || (E2 = {}));
var o = (_a = {},
<<<<<<< HEAD
    _a[0 /* x */ || 0 /* x */] = 0,
    _a
);
=======
    _a[E1.x || E2.x] = 0,
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
