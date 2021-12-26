import { createInterface } from "readline";
import tokenize from "../parser/tokenize";

const rules = [
  {
    rule: "if and endif is same number",
    check: (tokens: any[]) => {
      let unPairedIf = 0;

      for (const token of tokens) {
        if (token.type !== "tag") {
          break;
        }
        if (token.tag === "if") {
          unPairedIf++;
          break;
        }
        if (token.tag === "endif") {
          unPairedIf--;
          break;
        }
      }

      return unPairedIf === 0;
    },
  },
];

process.stdin.setEncoding("utf8");

const lines: any[] = [];
const reader = createInterface({
  input: process.stdin,
});

reader.on("line", (line: any) => {
  // 改行ごとに"line"イベントが発火される
  lines.push(line); // ここで、lines配列に、標準入力から渡されたデータを入れる
});
reader.on("close", () => {
  // 標準入力のストリームが終了すると呼ばれる
  const input = lines.join("\n");
  const tokens = tokenize(input);
  const failedCount = rules.reduce((failedNumber, rule) => {
    if (!rule.check(tokens)) {
      console.log(`failed: ${rule.rule}`);
      return failedNumber + 1;
    } else {
      return failedNumber;
    }
  }, 0);
  if (failedCount !== 0) {
    console.error(`${failedCount} / ${rules.length} rule(s) failed.`);
  }
});
