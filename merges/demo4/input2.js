const { readFileSync } = require('fs');

let paths = process.argv.slice(2);
run(paths);

function run(paths) {
    // print the welcome message
    printMessage();

    const data = getLineCountInfo(paths);
    console.log("Lines: " + data.totalLineCount);
}

function printMessage() {
    console.log("Welcome To Line Counter");
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
 * @param {string} str2
 */
function getLinesLength(str) {
    return str.split('\n').length;
}
