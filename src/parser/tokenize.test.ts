import tokenize from "./tokenize";

test("tokenize simple plain text", () => {
  expect(tokenize("Hello, world!")).toStrictEqual([
    { type: "text", text: "Hello, world!" },
  ]);
});

test("tokenize simple plain text with lf", () => {
  expect(tokenize("Hello, world!\n")).toStrictEqual([
    { type: "text", text: "Hello, world!\n" },
  ]);
});

test("tokenize simple plain text with simple tag", () => {
  expect(tokenize("[p]Hello, world![p]")).toStrictEqual([
    { type: "tag", tag: [{ type: "id", id: "p" }] },
    { type: "text", text: "Hello, world!" },
    { type: "tag", tag: [{ type: "id", id: "p" }] },
  ]);
});

test("tokenize simple plain text with tag and its attribution", () => {
  expect(tokenize('[p a="b" c]Hello, world![p]')).toStrictEqual([
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
  ]);
});

test("tokenize simple plain text with simple oneline tag", () => {
  expect(tokenize("@p1\nHello, world!\n@p2")).toStrictEqual([
    { type: "tag", tag: [{ type: "id", id: "p1" }] },
    { type: "text", text: "Hello, world!\n" },
    { type: "tag", tag: [{ type: "id", id: "p2" }] },
  ]);
});

test("tokenize simple plain text with simple oneline tag with attribute", () => {
  expect(tokenize('@p1 a="b"\nHello, world!\n@p2')).toStrictEqual([
    {
      type: "tag",
      tag: [
        { type: "id", id: "p1" },
        { type: "id", id: "a" },
        { type: "op", op: "=" },
        { type: "text", text: "b" },
      ],
    },
    { type: "text", text: "Hello, world!\n" },
    { type: "tag", tag: [{ type: "id", id: "p2" }] },
  ]);
});

test("tokenize simple plain text with simple oneline comment", () => {
  expect(tokenize(";comment_a\nHello, world!\n;comment_b")).toStrictEqual([
    { type: "comment", comment: "comment_a" },
    { type: "text", text: "Hello, world!\n" },
    { type: "comment", comment: "comment_b" },
  ]);
});

test("tokenize simple plain text with simple oneline comment", () => {
  expect(tokenize(";comment_a\nHello, world!\n;comment_b")).toStrictEqual([
    { type: "comment", comment: "comment_a" },
    { type: "text", text: "Hello, world!\n" },
    { type: "comment", comment: "comment_b" },
  ]);
});

test("tokenize several single oneline comment lines", () => {
  expect(tokenize(";comment_a\n;comment_b\n;comment_c")).toStrictEqual([
    { type: "comment", comment: "comment_a" },
    { type: "comment", comment: "comment_b" },
    { type: "comment", comment: "comment_c" },
  ]);
});

test("tokenize several simple oneline tags with attributes", () => {
  expect(tokenize('@p1 a="b"\n@p2 c="d"\n@p3 e="f"')).toStrictEqual([
    {
      type: "tag",
      tag: [
        { type: "id", id: "p1" },
        { type: "id", id: "a" },
        { type: "op", op: "=" },
        { type: "text", text: "b" },
      ],
    },
    {
      type: "tag",
      tag: [
        { type: "id", id: "p2" },
        { type: "id", id: "c" },
        { type: "op", op: "=" },
        { type: "text", text: "d" },
      ],
    },
    {
      type: "tag",
      tag: [
        { type: "id", id: "p3" },
        { type: "id", id: "e" },
        { type: "op", op: "=" },
        { type: "text", text: "f" },
      ],
    },
  ]);
});

test("tokenize labeles", () => {
  expect(tokenize("*label_a\n*label_b\n*label_c")).toStrictEqual([
    { type: "label", label: "label_a" },
    { type: "label", label: "label_b" },
    { type: "label", label: "label_c" },
  ]);
});

test("tokenize labeles with comments", () => {
  expect(tokenize("*label_a[tag]")).toStrictEqual([
    { type: "label", label: "label_a" },
    { type: "tag", tag: [{ type: "id", id: "tag" }] },
  ]);
});

test("tokenize character labeles", () => {
  expect(
    tokenize("#chara_a:variant_a\n#chara_b\n#\n#chara_c:variant_b")
  ).toStrictEqual([
    { type: "chara_label", chara: "chara_a", variant: "variant_a" },
    { type: "chara_label", chara: "chara_b", variant: null },
    { type: "chara_label", chara: null, variant: null },
    { type: "chara_label", chara: "chara_c", variant: "variant_b" },
  ]);
});
