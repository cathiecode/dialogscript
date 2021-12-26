type TokenizerContext = {
  cursor: number;
};

type TextToken = {
  type: "text";
  text: string;
};

type TagToken = {
  type: "tag";
  // eslint-disable-next-line no-use-before-define
  tag: Array<Token>;
};

type IdToken = {
  type: "id";
  id: string;
};

type OpToken = {
  type: "op";
  op: "=";
};

type CommentToken = {
  type: "comment";
  comment: string;
};

type LabelToken = {
  type: "label";
  label: string;
};

type CharaLabelToken = {
  type: "chara_label";
  chara: string | null;
  variant: string | null;
};

type Token =
  | TextToken
  | TagToken
  | IdToken
  | OpToken
  | CommentToken
  | LabelToken
  | CharaLabelToken;

type RootToken =
  | TextToken
  | TagToken
  | CommentToken
  | LabelToken
  | CharaLabelToken;

const tokenizeText = (str: string, context: TokenizerContext): RootToken => {
  const quote = closeToken(str[context.cursor] ?? "");
  context.cursor++;

  let text = "";

  let isEscaped = false;

  for (context.cursor; context.cursor < str.length; context.cursor++) {
    const char = str[context.cursor];

    if (isEscaped) {
      text += char;
      isEscaped = false;
      continue;
    }

    if (char === quote) {
      return { type: "text", text };
    }

    switch (char) {
      case "\\":
        isEscaped = true;
        break;
      default:
        text += char;
        break;
    }
  }

  throw new Error("Unexcepted EOF");
};

const closeToken = (start: string) => {
  return {
    '"': '"',
    "'": "'",
    "[": "]",
    "{": "}",
    "<": ">",
    "(": ")",
    "`": "`",
    "@": "\n",
    ";": "\n",
    "": "\n",
  }[start];
};

const tokenizeIdentifier = (
  str: string,
  context: TokenizerContext
): IdToken => {
  let id = "";

  for (context.cursor; context.cursor < str.length; context.cursor++) {
    const char = str[context.cursor];

    if (
      char === " " ||
      char === "=" ||
      char === '"' ||
      char === "[" ||
      char === "]" ||
      char === "\n"
    ) {
      context.cursor--;
      break;
    } else {
      id += char;
    }
  }

  return { type: "id", id };
};

const tokenizeTag = (str: string, context: TokenizerContext): TagToken => {
  const leftQuote = str[context.cursor];
  context.cursor++;

  const token = [];

  for (context.cursor; context.cursor < str.length; context.cursor++) {
    const char = str[context.cursor];
    if (
      (leftQuote === "[" && char === "]") ||
      (leftQuote === "@" && char === "\n")
    ) {
      return { type: "tag", tag: token };
    }
    switch (char) {
      case '"':
        token.push(tokenizeText(str, context));
        break;
      case "=":
        token.push({ type: "op", op: "=" } as OpToken);
        break;
      case " ":
        break;
      case "\n":
        break;
      default:
        token.push(tokenizeIdentifier(str, context));
        break;
    }
  }

  if (leftQuote === "@") {
    return { type: "tag", tag: token };
  }

  throw new Error("Unexcepted EOF");
};

const tokenizeOnelineComment = (
  str: string,
  context: TokenizerContext
): CommentToken => {
  context.cursor += 1;

  let comment = "";
  for (context.cursor; context.cursor < str.length; context.cursor++) {
    const char = str[context.cursor];
    if (char === "\n") {
      break;
    }
    comment += char;
  }
  return { type: "comment", comment };
};

const tokenizeLabel = (str: string, context: TokenizerContext): LabelToken => {
  context.cursor += 1;
  const { id } = tokenizeIdentifier(str, context);

  if (str[context.cursor + 1] === "\n") {
    context.cursor++;
  }

  return { type: "label", label: id };
};

const tokenizeCharaLabel = (
  str: string,
  context: TokenizerContext
): CharaLabelToken => {
  context.cursor += 1;

  let buffer = "";

  for (context.cursor; context.cursor < str.length; context.cursor++) {
    const char = str[context.cursor];
    if (char === "\n") {
      break;
    }
    buffer += char;
  }

  const [chara, variant, ...extra] = buffer.split(":");

  if (extra.length !== 0) {
    throw new Error("Chara label argument should be less than two");
  }

  return {
    type: "chara_label",
    chara: chara === "" ? null : chara ?? null,
    variant: variant ?? null,
  };
};

const tokenize = (str: string, context = { cursor: 0 }): RootToken[] => {
  const token = [];
  let onGoingText = "";
  let isFirstCharOfLine = true;

  for (context.cursor; context.cursor < str.length; context.cursor++) {
    try {
      const char = str[context.cursor];

      const commitText = () => {
        if (onGoingText !== "") {
          token.push({ type: "text", text: onGoingText } as TextToken);
          onGoingText = "";
        }
      };

      switch (char) {
        case "[":
          commitText();
          token.push(tokenizeTag(str, context));
          break;
        case ";":
          if (isFirstCharOfLine) {
            commitText();
            token.push(tokenizeOnelineComment(str, context));
          } else {
            onGoingText += char;
          }
          break;
        case "@":
          if (isFirstCharOfLine) {
            commitText();
            token.push(tokenizeTag(str, context));
          } else {
            onGoingText += char;
          }
          break;
        case "*":
          if (isFirstCharOfLine) {
            commitText();
            token.push(tokenizeLabel(str, context));
          } else {
            onGoingText += char;
          }
          break;
        case "#":
          if (isFirstCharOfLine) {
            commitText();
            token.push(tokenizeCharaLabel(str, context));
          }
          break;
        default:
          onGoingText += char;
          break;
      }
      if (str[context.cursor] === "\n") {
        isFirstCharOfLine = true;
      } else {
        isFirstCharOfLine = false;
      }
    } catch (e) {
      console.error(`Next error thrown in position ${context.cursor}.`);
      throw e;
    }
  }

  if (onGoingText !== "") {
    token.push({ type: "text", text: onGoingText } as TextToken);
  }

  return token;
};

export default tokenize;
export { RootToken, Token };
export { CharaLabelToken };
