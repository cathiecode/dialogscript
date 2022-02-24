import { RootToken, Tag, Text, Comment, Label, Token } from "./token";

import StringReader from "./StringReader";
import { TokenizeError } from "./error";

function tokenizeText(reader: StringReader): Text | undefined {
  let text = "";
  let next;
  let isEscaping = false;

  while (!(next = reader.lookNext()).done) {
    if (isEscaping) {
      text += reader.consume().value.character;
      isEscaping = false;
      continue;
    }

    if (["[", "@", ";", "#", "*"].includes(next.value)) {
      break;
    }

    if (next.value === "\\") {
      reader.consume().value.character;
      isEscaping = true;
      continue;
    }

    text += reader.consume().value.character;
  }

  if (text === "") {
    return undefined;
  } else {
    return {
      type: "Text",
      contents: text,
    };
  }
}

function tokenizeQuotedText(reader: StringReader): string | undefined {
  let text = "";
  let next;
  let isEscaping = false;

  if (!['"', "'"].includes(reader.lookNext().value)) {
    return undefined;
  }

  let closeQuote = reader.consume().value.character;

  while (!(next = reader.lookNext()).done) {
    if (isEscaping) {
      text += reader.consume().value.character;
      isEscaping = false;
      continue;
    }

    if (next.value === closeQuote) {
      reader.consume();
      break;
    }

    if (next.value === "\\") {
      reader.consume().value.character;
      isEscaping = true;
      continue;
    }

    text += reader.consume().value.character;
  }

  return text;
}

function consumeSpace(reader: StringReader): void {
  let next: string | IteratorResult<string, string>;

  while (!(next = reader.lookNext()).done) {
    if ([" ", "\t"].includes(next.value)) {
      reader.consume();
    } else {
      break;
    }
  }
}

function consumeSpaceAndLineFeed(reader: StringReader): void {
  let next: string | IteratorResult<string, string>;

  while (!(next = reader.lookNext()).done) {
    if ([" ", "\t", "\n"].includes(next.value)) {
      reader.consume();
    } else {
      break;
    }
  }
}

function isIdCharacter(character: string): boolean {
  return /[0-9a-zA-Z-_$]/.test(character); // FIXME: Unicode対応など
}

function tokenizeId(reader: StringReader): string | undefined {
  let next: IteratorResult<string, string>;

  let id = "";

  while (!(next = reader.lookNext()).done) {
    if (isIdCharacter(next.value)) {
      id += reader.consume().value.character;
    } else {
      break;
    }
  }

  if (id.length !== 0) {
    return id;
  } else {
    return undefined;
  }
}

function isNumberString(character: string): boolean {
  return /[0-9]/.test(character); // FIXME: Unicode対応など
}

function tokenizeNumber(reader: StringReader): number | undefined {
  let next: IteratorResult<string, string>;

  let numberString = "";

  while (!(next = reader.lookNext()).done) {
    if (isNumberString(next.value)) {
      numberString += reader.consume().value.character;
    } else {
      break;
    }
  }

  if (numberString.length !== 0) {
    return Number(numberString);
  } else {
    return undefined;
  }
}

function tokenizeTagParam(reader: StringReader): {
  name: string;
  value: string | number | boolean;
} {
  const name = tokenizeId(reader);
  if (!name) {
    throw new TokenizeError(
      `Expected Id but got ${reader.consume().value.character}`,
      reader.row,
      reader.column
    );
  }

  consumeSpaceAndLineFeed(reader);

  if (reader.lookNext().value !== "=") {
    return {
      name: name,
      value: true,
    };
  }

  reader.consume(); // consume "="

  consumeSpaceAndLineFeed(reader);

  const text = tokenizeQuotedText(reader);
  const number = tokenizeNumber(reader);
  const id = tokenizeId(reader);

  if (text !== undefined) {
    return {
      name: name,
      value: text,
    };
  } else if (number !== undefined) {
    return {
      name: name,
      value: number,
    };
  } else if (id !== undefined) {
    return {
      name: name,
      value: id,
    };
  } else {
    throw new TokenizeError(
      `Expected Quoted text or number but got ${
        reader.consume().value.character
      }`,
      reader.row,
      reader.column
    );
  }
}

// FIXME: consumeSpaceなだけのバリエーション。統合してもいいかも。
function tokenizeSingleLineTagParam(reader: StringReader): {
  name: string;
  value: string | number | boolean;
} {
  const name = tokenizeId(reader);
  if (!name) {
    throw new TokenizeError(
      `Expected Id but got ${reader.consume().value.character}`,
      reader.row,
      reader.column
    );
  }

  consumeSpace(reader);

  if (reader.lookNext().value !== "=") {
    return {
      name: name,
      value: true,
    };
  }

  reader.consume(); // consume "="

  consumeSpace(reader);

  const text = tokenizeQuotedText(reader);
  const number = tokenizeNumber(reader);
  const id = tokenizeId(reader);

  if (text !== undefined) {
    return {
      name: name,
      value: text,
    };
  } else if (number !== undefined) {
    return {
      name: name,
      value: number,
    };
  } else if (id !== undefined) {
    return {
      name: name,
      value: id,
    };
  } else {
    throw new TokenizeError(
      `Expected Quoted text or number but got ${
        reader.consume().value.character
      }`,
      reader.row,
      reader.column
    );
  }
}

function tokenizeTag(reader: StringReader): Tag | undefined {
  if (reader.lookNext().value !== "[") {
    return undefined;
  }

  reader.consume(); // consume [

  consumeSpaceAndLineFeed(reader);
  const id = tokenizeId(reader);

  if (!id) {
    throw new TokenizeError(
      `Expected Id but got ${reader.consume().value.character}`,
      reader.row,
      reader.column
    );
  }

  const params: { [name: string]: string | number | boolean } = {};

  while (true) {
    consumeSpaceAndLineFeed(reader);
    const next = reader.lookNext();
    if (next.done) {
      throw new TokenizeError(
        "Expected Id but got EOF",
        reader.row,
        reader.column
      );
    }

    if (next.value === "]") {
      reader.consume();
      break;
    }

    consumeSpaceAndLineFeed(reader);

    const param = tokenizeTagParam(reader);
    params[param.name] = param.value;
  }

  return {
    type: "Tag",
    tagName: id,
    params: params,
  };
}

// FIXME: tokenizeTagと統合
function tokenizeSingleLineTag(reader: StringReader): Tag | undefined {
  if (reader.column !== 0) {
    return undefined;
  }

  if (reader.lookNext().value !== "@") {
    return undefined;
  }

  reader.consume(); // consume @

  consumeSpace(reader);
  const id = tokenizeId(reader);

  if (!id) {
    throw new TokenizeError(
      `Expected Id but got ${reader.consume().value.character}`,
      reader.row,
      reader.column
    );
  }

  const params: { [name: string]: string | number | boolean } = {};

  while (true) {
    consumeSpace(reader);
    const next = reader.lookNext();

    if (next.done) {
      break;
    }

    if (next.value === "\n") {
      reader.consume();
      break;
    }

    consumeSpace(reader);

    const param = tokenizeSingleLineTagParam(reader);
    params[param.name] = param.value;
  }

  return {
    type: "Tag",
    tagName: id,
    params: params,
  };
}

function tokenizeComment(reader: StringReader): Comment | undefined {
  if (reader.lookNext().value !== ";") {
    return undefined;
  }

  reader.consume(); // consume ;

  let comment = "";
  while (!reader.lookNext().done) {
    const char = reader.consume().value.character;

    if (char === "\n") {
      break;
    }

    comment += char;
  }

  return {
    type: "Comment",
    contents: comment,
  };
}

function tokenizeCharaLabel(reader: StringReader): Tag | undefined {
  if (reader.lookNext().value !== "#") {
    return undefined;
  }

  reader.consume(); // consume #

  let label = "";
  while (!reader.lookNext().done) {
    const char = reader.consume().value.character;

    if (char === "\n") {
      break;
    }

    label += char;
  }

  return {
    type: "Tag",
    tagName: "setSpeaker",
    params: { name: label },
  };
}

function tokenizeLabel(reader: StringReader): Label | undefined {
  if (reader.lookNext().value !== "*") {
    return undefined;
  }

  reader.consume(); // consume *

  const label = tokenizeId(reader);

  if (!label) {
    throw new TokenizeError(
      `Expected Id but got: ${reader.lookNext().value}`,
      reader.row,
      reader.column
    );
  }

  if (reader.lookNext().value === "\n") {
    reader.consume();
  }

  return {
    type: "Label",
    label: label,
  };
}

function tokenizeCharacterAsText(reader: StringReader): Text | undefined {
  if (reader.lookNext().done) {
    return undefined;
  }

  return {
    type: "Text",
    contents: reader.consume().value.character,
  };
}

function parse(input: string): RootToken[] {
  const tokens: RootToken[] = [];

  const reader = new StringReader(input);

  while (true) {
    const { row, column } = reader;
    const token =
      tokenizeTag(reader) ||
      tokenizeText(reader) ||
      tokenizeCharaLabel(reader) ||
      tokenizeComment(reader) ||
      tokenizeSingleLineTag(reader) ||
      tokenizeLabel(reader) ||
      tokenizeCharacterAsText(reader);

    if (!token) {
      break;
    }

    tokens.push({ row, column, ...token });
  }

  if (!reader.done && !reader.consume().done) {
    console.log(reader.consume().value.character);
    throw new TokenizeError("Tokenizer logic error", reader.row, reader.column);
  }

  return tokens;
}

export default parse;
export { default as text } from "./tags/text";
export { default as setSpeaker } from "./tags/setSpeaker";
export { TokenizeError } from "./error";
export { default as ITag, ITagParams } from "./ITag";
export { default as ITagCompatibleState } from "./ITagCompatibleState";
