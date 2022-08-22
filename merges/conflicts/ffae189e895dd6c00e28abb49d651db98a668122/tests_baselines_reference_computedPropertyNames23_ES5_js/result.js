//// [computedPropertyNames23_ES5.ts]
class C {
    bar() {
        return 0;
    }
    [
        { [this.bar()]: 1 }[0]
    ]() { }
}

//// [computedPropertyNames23_ES5.js]
var C = (function () {
    function C() {
    }
    C.prototype.bar = function () {
        return 0;
    };
<<<<<<< HEAD
    C.prototype[(_a = {}, _a[this.bar()] = 1, _a)[0]] = function () { };
=======
    C.prototype[(_a = {},
        _a[this.bar()] = 1,
        _a)[0]] = function () { };
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
    return C;
    var _a;
})();
