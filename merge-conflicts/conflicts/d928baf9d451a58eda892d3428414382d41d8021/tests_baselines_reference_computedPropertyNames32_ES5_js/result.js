//// [computedPropertyNames32_ES5.ts]
function foo<T>() { return '' }
class C<T> {
    bar() {
        return 0;
    }
    [foo<T>()]() { }
}

<<<<<<< HEAD:tests/baselines/reference/computedPropertyNames32.js
//// [computedPropertyNames32.js]
function foo() { return ''; }
=======
//// [computedPropertyNames32_ES5.js]
function foo() {
    return '';
}
>>>>>>> 7393cf46b926687f94cf5e247121871ba358e96c:tests/baselines/reference/computedPropertyNames32_ES5.js
var C = (function () {
    function C() {
    }
    C.prototype.bar = function () {
        return 0;
    };
    C.prototype[foo()] = function () { };
    return C;
})();
