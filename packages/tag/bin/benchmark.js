const fs = require("fs");
const path = require("path");
const parse = require("../dist/index.js").default;

const text = fs.readFileSync(process.argv[2]).toString();

let result;

for (let i = 0; i < 5; i++) {
  const t0 = performance.now();

  for (let j = 0; j < 1; j++) {
    result = parse(text);
  }
  const t1 = performance.now();

  console.log(result.length, "tokens", (t1 - t0), "ms");
}

const sum = {};

result.forEach((token) => {
  if (sum[token.type]) {
    sum[token.type]++;
  } else {
    sum[token.type] = 1;
  }
})

console.log(sum);
