//// [tests/cases/compiler/es6ExportAllInEs5.ts] ////

//// [server.ts]

export class c {
}
export interface i {
}
export module m {
    export var x = 10;
}
export var x = 10;
export module uninstantiated {
}

//// [client.ts]
export * from "server";

//// [server.js]
var c = (function () {
    function c() {
    }
    return c;
})();
exports.c = c;
var m;
(function (m) {
    m.x = 10;
})(m = exports.m || (exports.m = {}));
exports.x = 10;
//// [client.js]
<<<<<<< HEAD
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require("server"));
=======
var server_1 = require("server");
for (var _a in server_1) if (!exports.hasOwnProperty(_a)) exports[_a] = server_1[_a];
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df


//// [server.d.ts]
export declare class c {
}
export interface i {
}
export declare module m {
    var x: number;
}
export declare var x: number;
export declare module uninstantiated {
}
//// [client.d.ts]
export * from "server";
