//// [computedPropertyNames19_ES5.ts]
module M {
    var obj = {
        [this.bar]: 0
    }
}

//// [computedPropertyNames19_ES5.js]
var M;
(function (M) {
    var obj = (_a = {},
        _a[this.bar] = 0,
<<<<<<< HEAD
        _a
    );
=======
        _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
    var _a;
})(M || (M = {}));
