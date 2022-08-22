//// [computedPropertyNames29_ES5.ts]
class C {
    bar() {
        () => {
            var obj = {
                [this.bar()]() { } // needs capture
            };
        }
        return 0;
    }
}

//// [computedPropertyNames29_ES5.js]
var C = (function () {
    function C() {
    }
    C.prototype.bar = function () {
        var _this = this;
        (function () {
            var obj = (_a = {},
                _a[_this.bar()] = function () { },
<<<<<<< HEAD
                _a
            );
=======
                _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
            var _a;
        });
        return 0;
    };
    return C;
})();
