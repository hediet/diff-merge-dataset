//// [computedPropertyNames28_ES5.ts]
class Base {
}
class C extends Base {
    constructor() {
        super();
        var obj = {
            [(super(), "prop")]() { }
        };
    }
}

//// [computedPropertyNames28_ES5.js]
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Base = (function () {
    function Base() {
    }
    return Base;
})();
var C = (function (_super) {
    __extends(C, _super);
    function C() {
        _super.call(this);
        var obj = (_a = {},
            _a[(_super.call(this), "prop")] = function () { },
<<<<<<< HEAD
            _a
        );
=======
            _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
        var _a;
    }
    return C;
})(Base);
