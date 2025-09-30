//// [computedPropertyNames22_ES5.ts]
class C {
    bar() {
        var obj = {
            [this.bar()]() { }
        };
        return 0;
    }
}

//// [computedPropertyNames22_ES5.js]
var C = (function () {
    function C() {
    }
    C.prototype.bar = function () {
        var obj = (_a = {},
            _a[this.bar()] = function () { },
<<<<<<< HEAD
            _a
        );
=======
            _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
        return 0;
        var _a;
    };
    return C;
})();
