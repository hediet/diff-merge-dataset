//// [computedPropertyNames35_ES5.ts]
function foo<T>() { return '' }
interface I<T> {
    bar(): string;
    [foo<T>()](): void;
}

<<<<<<< HEAD:tests/baselines/reference/computedPropertyNames35.js
//// [computedPropertyNames35.js]
function foo() { return ''; }
=======
//// [computedPropertyNames35_ES5.js]
function foo() {
    return '';
}
>>>>>>> 7393cf46b926687f94cf5e247121871ba358e96c:tests/baselines/reference/computedPropertyNames35_ES5.js
