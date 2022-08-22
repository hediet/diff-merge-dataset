//// [computedPropertyNames33_ES5.ts]
function foo<T>() { return '' }
class C<T> {
    bar() {
        var obj = {
            [foo<T>()]() { }
        };
        return 0;
    }
}

//// [computedPropertyNames33_ES5.js]
function foo() { return ''; }
var C = (function () {
    function C() {
    }
    C.prototype.bar = function () {
        var obj = (_a = {},
            _a[foo()] = function () { },
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
