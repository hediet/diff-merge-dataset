//// [privateIndexer2.ts]
// private indexers not allowed

var x = {
    private [x: string]: string;
}

var y: {
    private[x: string]: string;
}

//// [privateIndexer2.js]
// private indexers not allowed
var x = (_a = {},
    _a[x] = string,
    _a.string = ,
<<<<<<< HEAD
    _a
);
=======
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var y;
var _a;
