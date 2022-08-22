///<reference path="fourslash.ts" />
// @allowJs: true
// @Filename: Foo.js
/////** @type {function (this: string, string): string} */
////var f = function (s) { return this/**/; }

goTo.marker();
<<<<<<< HEAD
=======
verify.completionListCount(108);
>>>>>>> 01516c84d2ce87c387b3bf037af2e90a25a6c213
verify.completionListContains('this')
