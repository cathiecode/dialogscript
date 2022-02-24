import { ITagParams } from "@dialogscript/tag";
import { IRunner } from "@dialogscript/core";

const returnTag = {
  name: "return",
  params: { script: undefined, label: undefined },
  exec: <T>(_params: ITagParams, _state: T, runner: IRunner<T>) => {
    runner.pop();
  },
};

export default returnTag;
