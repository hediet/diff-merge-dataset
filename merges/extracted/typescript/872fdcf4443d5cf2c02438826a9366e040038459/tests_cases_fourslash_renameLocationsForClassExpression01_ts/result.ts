/// <reference path='fourslash.ts'/>

////class Foo {
////}
////
<<<<<<< HEAD
//////The class expression Foo
=======
>>>>>>> 42168e39ec02d6d03bad26c638358ee3e3029f7b
////var x = class [|Foo|] {
////    doIt() {
////        return [|Foo|];
////    }
////
////    static doItStatically() {
<<<<<<< HEAD
////        return [|Foo|].y;
=======
////        return [|Foo|];
>>>>>>> 42168e39ec02d6d03bad26c638358ee3e3029f7b
////    }
////} 
////
////var y = class {
////   getSomeName() {
////      return Foo
////   }
////}
////var z = class Foo {}

<<<<<<< HEAD
let ranges = test.ranges()
for (let range of ranges) {
    goTo.position(range.start);
=======

// TODO (yuit): Fix up this test when class expressions are supported.
//              Just uncomment the below, remove the marker, and add the
//              appropriate ranges in the test itself.

let ranges = test.ranges()
for (let range of ranges) {
    goTo.position(range.start);

>>>>>>> 42168e39ec02d6d03bad26c638358ee3e3029f7b
    verify.renameLocations(/*findInStrings*/ false, /*findInComments*/ false);
}