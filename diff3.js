const { merge } = require("node-diff3");
const { readFileSync, writeFileSync } = require("fs");

const input1 = readFileSync("./input1.txt", { encoding: "utf8" });
const input2 = readFileSync("./input2.txt", { encoding: "utf8" });
const base = readFileSync("./base.txt", { encoding: "utf8" });

console.log(input1, input2, base);

const result = merge(input1, base, input2).result;

writeFileSync("./output.txt", result.join("\n"), "utf-8");