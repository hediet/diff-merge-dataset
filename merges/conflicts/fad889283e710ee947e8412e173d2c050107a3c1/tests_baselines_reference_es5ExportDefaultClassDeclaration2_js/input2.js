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
module.exports = default_1;


//// [es5ExportDefaultClassDeclaration2.d.ts]
export default class  {
    method(): void;
}
