//// [es5ExportDefaultFunctionDeclaration.ts]

export default function f() { }


//// [es5ExportDefaultFunctionDeclaration.js]
<<<<<<< HEAD
function f() {
}
exports.default = f;
=======
function f() { }
exports.f = f;
>>>>>>> 71590de1eb4ae837e160be4b2211a4ba4e868be4


//// [es5ExportDefaultFunctionDeclaration.d.ts]
export default function f(): void;
