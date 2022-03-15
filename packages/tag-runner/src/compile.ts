import { IScript } from "@dialogscript/core";
import { ITag, ITagCompatibleState, ITagParams, text } from "@dialogscript/tag";
import { IOp } from "@dialogscript/core";
import { RootToken, Tag } from "@dialogscript/tag/src/token";

function assertTagToken<T>(token: Tag, tag: ITag<T>): ITagParams {
  const assertedParams = { ...token.params };
  Object.entries(tag.params).forEach(([name, defaultValue]) => {
    if (defaultValue === undefined) {
      return;
    }
    // TODO: {type: "string"} like API
    if (defaultValue === null) {
      if (token.params[name] === undefined) {
        throw new Error(
          `Tag parameter assertion failed: ${name} of ${tag.name} requires <any> but got undefined.`
        );
      } else {
        return;
      }
    }
    if (token.params[name] === undefined) {
      assertedParams[name] = defaultValue;
      return;
    }
    if (typeof defaultValue !== typeof token.params[name]) {
      throw new Error(
        `Tag parameter assertion failed: ${name} of ${
          tag.name
        } requires ${typeof defaultValue} but got ${typeof token.params[name]}.`
      );
    }
  });

  return assertedParams;
}

function tagTokenToOp<T>(token: Tag, tag: ITag<T>): IOp<T> {
  return {
    name: tag.name,
    apply: (state, runner) =>
      tag.exec(assertTagToken(token, tag), state, runner),
  };
}

export default function compile<T extends ITagCompatibleState>(
  tokens: RootToken[],
  tags: Map<string, ITag<T>>
): IScript<T> {
  const ops: IOp<T>[] = [];
  const labels: { [label: string]: number } = {};

  tokens.forEach((token) => {
    switch (token.type) {
      case "Text":
        ops.push(
          tagTokenToOp(
            {
              type: "Tag",
              tagName: "text",
              params: { contents: token.contents },
            },
            text as ITag<T>
          )
        );
        break;
      case "Tag":
        const tag = tags.get(token.tagName);
        if (!tag) {
          throw new Error(`No such tag: ${token.tagName}`);
        }
        ops.push(tagTokenToOp(token, tag));
        break;
      case "Label":
        labels[token.label] = ops.length;
        break;
      default:
    }
  });

  return {
    tags: ops,
    labels: labels,
  };
}
