const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
main(paths);

function main(paths) {
    // print the welcome message
    printMessage("Welcome To Line Counter");

    let data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

/**
 * Prints the welcome message
*/
function printMessage(showUsage, message) {
    console.log(message);

    if (showUsage) {
        console.log("Usage: node base.js <file1> <file2> ...");
    }
}

/**
 * @param {string[]} paths
*/
function getLineCountInfo(paths) {
    let lineCounts = paths.map(path => ({ path, count: getLinesLength(readFileSync(path, 'utf8')) }));
    return {
        totalLineCount: lineCounts.reduce((acc, { count }) => acc + count, 0),
        lineCounts,
    };
}

/**
 * @param {string} str
 */
function getLinesLength(str) {
    return str.split('\n').length;
}
