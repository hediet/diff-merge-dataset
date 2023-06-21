//// [parserES5ComputedPropertyName3.ts]
var v = { [e]() { } };

//// [parserES5ComputedPropertyName3.js]
<<<<<<< HEAD
var v = (_a = {}, _a[e] = function () {
}, _a);
var _a;
=======
var v = { [e]: function () { } };
>>>>>>> 9788acf47529046cc07fa1ee5bd3a32851d0bdd3
