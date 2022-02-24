import { IScriptResolvable, Runner } from "@dialogscript/core";
import { ITag, ITagCompatibleState } from "@dialogscript/tag";
import TagLoader from "./TagLoader";

class TagRunner<T extends ITagCompatibleState> extends Runner<T> {
  constructor(
    script: IScriptResolvable,
    initialState: T,
    fetch: () => Promise<string>,
    tags: ITag<T>[]
  ) {
    super(script, initialState, new TagLoader(fetch, tags));
  }
}

export default TagRunner;
export { default as TagLoader } from "./TagLoader";
