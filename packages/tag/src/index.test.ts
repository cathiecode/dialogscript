import parse from ".";

test("parse simple plain text", () => {
  expect(parse("Hello, world!")).toStrictEqual([
    { type: "Text", contents: "Hello, world!", row: 0, column: 0 },
  ]);
});

test("parse simple plain text with escaping", () => {
  expect(parse("Hello, \\\\world!")).toStrictEqual([
    { type: "Text", contents: "Hello, \\world!", row: 0, column: 0 },
  ]);
});

test("parse simple plain text with no attribute tag", () => {
  expect(parse("Hello[test], world!")).toStrictEqual([
    { row: 0, column: 0, type: "Text", contents: "Hello" },
    { row: 0, column: 5, type: "Tag", tagName: "test", params: {} },
    { row: 0, column: 11, type: "Text", contents: ", world!" },
  ]);
});

test("parse simple plain text with attribute tag", () => {
  expect(parse('Hello[test a="b" c], world!')).toStrictEqual([
    { row: 0, column: 0, type: "Text", contents: "Hello" },
    {
      row: 0,
      column: 5,
      type: "Tag",
      tagName: "test",
      params: { a: "b", c: true },
    },
    { row: 0, column: 19, type: "Text", contents: ", world!" },
  ]);
});

test("parse simple plain text with attribute tag which has escape", () => {
  expect(parse('Hello[test a="\\b" c], world!')).toStrictEqual([
    { row: 0, column: 0, type: "Text", contents: "Hello" },
    {
      row: 0,
      column: 5,
      type: "Tag",
      tagName: "test",
      params: { a: "b", c: true },
    },
    { row: 0, column: 20, type: "Text", contents: ", world!" },
  ]);
});

test("parse simple plain text with id specified param", () => {
  expect(() => parse("Hello[test a=b c], world!")).toThrow();
});

test("parse throws simple plain text with id specified param", () => {
  expect(() => parse("Hello[test a=b c], world!")).toThrow();
});

test("parse throws simple plain text with attribute with missing right side", () => {
  expect(() => parse("Hello[test a= c], world!")).toThrow();
});

test("parse throws simple plain text with attribute with missing right side", () => {
  expect(() => parse("Hello[test a= c], world!")).toThrow();
});

test("parse throws simple plain text tag with empty id tag", () => {
  expect(() => parse("Hello[], world!")).toThrow();
});

test("parse throws simple plain text with attribute with invalid string", () => {
  expect(() => parse('Hello[test ""], world!')).toThrow();
});

test("parse throws simple plain text with attribute with missing right side", () => {
  expect(() => parse('Hello[test a="b"')).toThrow();
});

test("parse throws line that has @ only", () => {
  expect(() => parse("@")).toThrow();
});

test("parse throws when single line tag parameter starts with unknown character", () => {
  expect(() => parse("@test_tag ?")).toThrow();
});

test("parse throws when single line tag parameter value was unknown character", () => {
  expect(() => parse("@test_tag param=?")).toThrow();
});

test("parse character label", () => {
  expect(parse("#test1:test2\n")).toStrictEqual([
    {
      row: 0,
      column: 0,
      type: "Tag",
      tagName: "setSpeaker",
      params: {
        name: "test1",
        face: "test2",
      },
    },
  ]);
});

test("parse throws when character label has too many segments", () => {
  expect(() => parse("#test1:test2:wrong_section\n")).toThrow();
});

test("parse label", () => {
  expect(parse("*test\n")).toStrictEqual([
    {
      row: 0,
      column: 0,
      type: "Label",
      label: "test",
    },
  ]);
});

test("parse throws when empty label", () => {
  expect(() => parse("*")).toThrow();
});

test("parse does not throws when line ends with @", () => {
  expect(parse("Hello@\n")).toStrictEqual([
    {
      row: 0,
      column: 0,
      type: "Text",
      contents: "Hello",
    },
    {
      row: 0,
      column: 5,
      type: "Text",
      contents: "@",
    },
    {
      row: 0,
      column: 6,
      type: "Text",
      contents: "\n",
    },
  ]);
});

test("parse single line tag", () => {
  expect(parse('@test a="b" c d=3')).toStrictEqual([
    {
      row: 0,
      column: 0,
      type: "Tag",
      tagName: "test",
      params: { a: "b", c: true, d: 3 },
    },
  ]);
});

test("parse double single line tag", () => {
  expect(parse('@test a="b" c d=3\n@test')).toStrictEqual([
    {
      row: 0,
      column: 0,
      type: "Tag",
      tagName: "test",
      params: { a: "b", c: true, d: 3 },
    },
    {
      row: 1,
      column: 0,
      type: "Tag",
      tagName: "test",
      params: {},
    },
  ]);
});

test("parse comment", () => {
  expect(parse("text1;comment\ntext2")).toStrictEqual([
    {
      row: 0,
      column: 0,
      type: "Text",
      contents: "text1",
    },
    {
      row: 0,
      column: 5,
      type: "Comment",
      contents: "comment",
    },
    {
      row: 1,
      column: 0,
      type: "Text",
      contents: "text2",
    },
  ]);
});
