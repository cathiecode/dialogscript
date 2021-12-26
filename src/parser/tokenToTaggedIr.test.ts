import tokenToTaggedIr from "./tokenToTaggedIr";

test("parse simple plain text tag", () => {
  expect(
    tokenToTaggedIr([{ type: "text", text: "Hello, world!" }])
  ).toStrictEqual([{ tag: "text", params: { text: "Hello, world!" } }]);
});

test("parse simple plain text tag with simple tag", () => {
  expect(
    tokenToTaggedIr([
      { type: "tag", tag: [{ type: "id", id: "p" }] },
      { type: "text", text: "Hello, world!" },
      { type: "tag", tag: [{ type: "id", id: "p" }] },
    ])
  ).toStrictEqual([
    { tag: "p", params: {} },
    { tag: "text", params: { text: "Hello, world!" } },
    { tag: "p", params: {} },
  ]);
});

test("parse simple plain text tag with simple tag and its attribution", () => {
  expect(
    tokenToTaggedIr([
      {
        type: "tag",
        tag: [
          { type: "id", id: "p" },
          { type: "id", id: "a" },
          { type: "op", op: "=" },
          { type: "text", text: "b" },
          { type: "id", id: "c" },
        ],
      },
      { type: "text", text: "Hello, world!" },
      { type: "tag", tag: [{ type: "id", id: "p" }] },
    ])
  ).toStrictEqual([
    { tag: "p", params: { a: "b", c: "c" } },
    { tag: "text", params: { text: "Hello, world!" } },
    { tag: "p", params: {} },
  ]);
});
