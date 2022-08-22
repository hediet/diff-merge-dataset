//// [es5ExportDefaultClassDeclaration2.ts]

export default class {
    method() { }
}


//// [es5ExportDefaultClassDeclaration2.js]
var default_1 = (function () {
    function default_1() {
    }
    default_1.prototype.method = function () {
    };
    return default_1;
})();
<<<<<<< HEAD
exports.default = _default;
=======
module.exports = default_1;
>>>>>>> a60d5912a9a277128647d218bca5019b3facf4df


//// [es5ExportDefaultClassDeclaration2.d.ts]
export default class  {
    method(): void;
}
