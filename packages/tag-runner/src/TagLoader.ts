import { ILoader, IScript } from "@dialogscript/core";
import parse, { ITag, ITagCompatibleState } from "@dialogscript/tag";
import compile from "./compile";

export default class TagLoader<T extends ITagCompatibleState>
  implements ILoader<T>
{
  fetcher: (scriptId: string) => Promise<string>;
  tags: Map<string, ITag<T>>;

  constructor(fetcher: (scriptId: string) => Promise<string>, tags: ITag<T>[]) {
    this.fetcher = fetcher;
    this.tags = new Map(tags.map((tag) => [tag.name, tag]));
  }

  async load(scriptId: string): Promise<IScript<T>> {
    const scriptText = await this.fetcher(scriptId);

    const tokens = parse(scriptText);

    return compile(tokens, this.tags);
  }
}
