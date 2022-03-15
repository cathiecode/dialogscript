import { IScript } from "@dialogscript/core";
import { ITag, ITagCompatibleState, text } from "@dialogscript/tag";
import { IOp } from "@dialogscript/core";
import { RootToken, Tag } from "@dialogscript/tag/src/token";

function tagTokenToOp<T>(token: Tag, tag: ITag<T>): IOp<T> {
  return {
    name: tag.name,
    apply: (state, runner) => tag.exec(token.params, state, runner),
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
