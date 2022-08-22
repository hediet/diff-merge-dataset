//// [computedPropertyNames50_ES5.ts]

var x = {
    p1: 10,
    get foo() {
        if (1 == 1) {
            return 10;
        }
    },
    get [1 + 1]() {
        throw 10;
    },
    set [1 + 1]() {
        // just throw
        throw 10;
    },
    get [1 + 1]() {
        return 10;
    },
    get foo() {
        if (2 == 2) {
            return 20;
        }
    },
    p2: 20
}

//// [computedPropertyNames50_ES5.js]
var x = (_a = {
        p1: 10,
        get foo() {
            if (1 == 1) {
                return 10;
            }
        }
<<<<<<< HEAD
    },
    Object.defineProperty(_a, 1 + 1, {
        get: function () {
            throw 10;
        },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, 1 + 1, {
        set: function () {
            // just throw
            throw 10;
        },
        enumerable: true,
        configurable: true
    }),
    Object.defineProperty(_a, 1 + 1, {
        get: function () {
            return 10;
        },
        enumerable: true,
        configurable: true
    }),
    ,
    _a.p2 = 20,
    _a
);
=======
    }
},
    _a.p1 = 10,
    _a.foo = Object.defineProperty({ get: function () {
            if (1 == 1) {
                return 10;
            }
        }, enumerable: true, configurable: true }),
    _a[1 + 1] = Object.defineProperty({ get: function () {
            throw 10;
        }, enumerable: true, configurable: true }),
    _a[1 + 1] = Object.defineProperty({ set: function () {
            // just throw
            throw 10;
        }, enumerable: true, configurable: true }),
    _a[1 + 1] = Object.defineProperty({ get: function () {
            return 10;
        }, enumerable: true, configurable: true }),
    _a.p2 = 20,
    _a);
>>>>>>> 5e7343f573c3e987caaa3f2326386b8c796e6fa3
var _a;
