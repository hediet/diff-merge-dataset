
///<reference path="fourslash.ts" />
// @allowJs: true
// @Filename: Foo.js
/////** @type {function (new: string, string): string} */
////var f = function () { return new/**/; }

goTo.marker();
<<<<<<< HEAD
=======
verify.completionListCount(107);
>>>>>>> 01516c84d2ce87c387b3bf037af2e90a25a6c213
verify.completionListContains('new');
