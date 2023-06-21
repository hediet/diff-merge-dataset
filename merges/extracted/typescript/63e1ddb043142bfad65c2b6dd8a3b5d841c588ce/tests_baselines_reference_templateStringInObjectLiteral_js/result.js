//// [templateStringInObjectLiteral.ts]
var x = {
    a: `abc${ 123 }def`,
    `b`: 321
}

//// [templateStringInObjectLiteral.js]
<<<<<<< HEAD
var x = (_a = ["b"], _a.raw = ["b"], ({
    a: "abc" + 123 + "def"
})(_a));
=======
var x = {
    a: "abc" + 123 + "def" } "b";
>>>>>>> 60a6b2816abff2af1bac455d2d12b16cc17a7f91
321;
var _a;
