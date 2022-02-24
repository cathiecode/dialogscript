import tokenize from "./tokenize";

test("tokenize simple plain text", () => {
  expect(tokenize("Hello, world!")).toStrictEqual([
    { type: "text", text: "Hello, world!" },
  ]);
});

test("tokenize simple plain text with escaping", () => {
  expect(tokenize("Hello[, world!")).toStrictEqual([
    { type: "text", text: "Hello, world!" },
  ]);
});
