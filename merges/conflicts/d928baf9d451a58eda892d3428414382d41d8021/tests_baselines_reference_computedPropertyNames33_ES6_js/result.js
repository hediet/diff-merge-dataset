//// [computedPropertyNames33_ES6.ts]
function foo<T>() { return '' }
class C<T> {
    bar() {
        var obj = {
            [foo<T>()]() { }
        };
        return 0;
    }
}

<<<<<<< HEAD:tests/baselines/reference/computedPropertyNames33.js
//// [computedPropertyNames33.js]
function foo() { return ''; }
=======
//// [computedPropertyNames33_ES6.js]
function foo() {
    return '';
}
>>>>>>> 7393cf46b926687f94cf5e247121871ba358e96c:tests/baselines/reference/computedPropertyNames33_ES6.js
var C = (function () {
    function C() {
    }
    C.prototype.bar = function () {
        var obj = {
            [foo()]() { }
        };
        return 0;
    };
    return C;
})();
