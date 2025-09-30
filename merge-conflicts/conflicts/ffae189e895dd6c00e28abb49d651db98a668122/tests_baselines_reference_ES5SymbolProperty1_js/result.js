//// [ES5SymbolProperty1.ts]
interface SymbolConstructor {
    foo: string;
}
var Symbol: SymbolConstructor;

var obj = {
    [Symbol.foo]: 0
}

obj[Symbol.foo];

//// [ES5SymbolProperty1.js]
var Symbol;
var obj = (_a = {},
    _a[Symbol.foo] = 0,
<<<<<<< HEAD
    _a
);
=======
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
obj[Symbol.foo];
var _a;
