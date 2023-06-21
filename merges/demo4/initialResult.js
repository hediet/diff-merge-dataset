<<<<<<< c:\Users\hdieterichs\Desktop\merge-editor-demo\input1.js
const { readFileSync, writeFileSync } = require('fs');
=======
const { readFile } = require('fs');
const { promisify } = require('util');
>>>>>>> c:\Users\hdieterichs\Desktop\merge-editor-demo\input2.js

const paths = process.argv.slice(2);
main(paths);

async function main(paths) {
    // print the welcome message
<<<<<<< c:\Users\hdieterichs\Desktop\merge-editor-demo\input1.js
    printWelcome();

    // Compute the number of lines in each file
    // and print the result
    const data = getLineCountInfo(paths);
    console.log("Total Line Count: " + data.totalLineCount);
    writeFileSync('out.json', JSON.stringify(data), 'utf-8');
=======
    printHeader();

    // Compute the number of lines in each file
    // and print the result
    let data = await getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
>>>>>>> c:\Users\hdieterichs\Desktop\merge-editor-demo\input2.js
}

/**
 * Prints the welcome message
*/
<<<<<<< c:\Users\hdieterichs\Desktop\merge-editor-demo\input1.js
function printWelcome() {
=======
function printHeader() {
>>>>>>> c:\Users\hdieterichs\Desktop\merge-editor-demo\input2.js
    console.log("Welcome To Line Counter");
}

/**
 * @param {string[]} paths
*/
<<<<<<< c:\Users\hdieterichs\Desktop\merge-editor-demo\input1.js
function getLineCountInfo(paths) {
    const lineCounts = paths.map(path => ({ path, count: getLineCount(readFileSync(path, 'utf8')) }));
=======
async function getLineCountInfo(paths) {
    let lineCounts = await Promise.all(
        paths.map(async path => ({
            path,
            count: getLinesLength(await promisify(readFile)(path, 'utf8')) }
        ))
    );
>>>>>>> c:\Users\hdieterichs\Desktop\merge-editor-demo\input2.js
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str 
 */
function getLineCount(str) {
    return str.split('\n').length;
}