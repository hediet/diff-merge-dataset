//// [computedPropertyNames18_ES5.ts]
function foo() {
    var obj = {
        [this.bar]: 0
    }
}

//// [computedPropertyNames18_ES5.js]
function foo() {
    var obj = (_a = {},
        _a[this.bar] = 0,
<<<<<<< HEAD
        _a
    );
=======
        _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
    var _a;
}
