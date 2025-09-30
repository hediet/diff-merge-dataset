//// [parserES5ComputedPropertyName4.ts]
var v = { get [e]() { } };

//// [parserES5ComputedPropertyName4.js]
<<<<<<< HEAD
var v = (_a = {}, Object.defineProperty(_a, e, {
    get: function () {
    },
    enumerable: true,
    configurable: true
}), _a);
var _a;
=======
var v = { get [e]() { } };
>>>>>>> 9788acf47529046cc07fa1ee5bd3a32851d0bdd3
