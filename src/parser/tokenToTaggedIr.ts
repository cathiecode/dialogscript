import { Tag, TagParams } from "../Runner";
import { CharaLabelToken, RootToken, Token } from "./tokenize";

type KagIr = Tag[];

const parseTagAttribute = (
  tokens: Token[],
  context: { cursor: number }
): { key: string; value: string } => {
  const attribute = tokens[context.cursor++];
  if (!attribute) {
    throw new Error("Expected: ID but got: nothing");
  }

  if (attribute.type !== "id") {
    console.error(tokens);
    throw new Error(`Expected: ID but got: ${attribute.type}`);
  }

  const eqOrNextAttribute = tokens[context.cursor];

  if (
    !eqOrNextAttribute ||
    eqOrNextAttribute.type !== "op" ||
    eqOrNextAttribute.op !== "="
  ) {
    return {
      key: attribute.id,
      value: attribute.id,
    };
  }

  context.cursor++;

  const mayRightValue = tokens[context.cursor++];

  if (
    !mayRightValue ||
    !(mayRightValue.type === "text" || mayRightValue.type === "id")
  ) {
    throw new Error(`Expected: Text or ID but got: ${mayRightValue?.type}`);
  }

  if (mayRightValue.type === "text") {
    return {
      key: attribute.id,
      value: mayRightValue.text,
    };
  } else {
    // IDの場合
    return {
      key: attribute.id,
      value: mayRightValue.id,
    };
  }
};

const parseTag = (tokens: Token[]): Tag => {
  const tagName = tokens[0];

  if (!tagName || tagName.type !== "id") {
    throw new Error("Parse Error: No tag name");
  }

  const context = {
    cursor: 1,
  };

  const params: TagParams = {};

  while (tokens.length - context.cursor > 0) {
    const { key, value } = parseTagAttribute(tokens, context);

    params[key] = value;
  }

  return {
    tag: tagName.id,
    params: params,
  };
};

const charaLabelToCharaPText = (label: CharaLabelToken): Tag => {
  if (label.chara) {
    if (label.variant) {
      return {
        tag: "chara_ptext",
        params: {
          chara: label.chara,
          variant: label.variant,
        },
      };
    } else {
      return {
        tag: "chara_ptext",
        params: {
          chara: label.chara,
        },
      };
    }
  } else {
    return {
      tag: "chara_ptext",
      params: {},
    };
  }
};

const tokenToTaggedIr = (tokens: RootToken[]): KagIr => {
  return tokens
    .map((token) => {
      switch (token.type) {
        case "text":
          return {
            tag: "text",
            params: {
              text: token.text,
            },
          };
        case "tag":
          return parseTag(token.tag);
        case "chara_label":
          return charaLabelToCharaPText(token);
        case "comment":
          return null;
        default:
          return null;
      }
    })
    .filter((tag): tag is NonNullable<typeof tag> => tag != null);
};

export default tokenToTaggedIr;
export { KagIr };
