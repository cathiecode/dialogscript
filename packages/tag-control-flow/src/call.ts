import { ScriptResolvable } from "@dialogscript/core";
import { ITagParams } from "@dialogscript/tag";
import { IRunner } from "@dialogscript/core";

const call = {
  name: "call",
  params: { script: undefined, label: undefined },
  exec: <T>(params: ITagParams, _state: T, runner: IRunner<T>) => {
    runner.push(
      new ScriptResolvable(
        params["script"] as string,
        params["label"] as string
      )
    );
  },
};

export default call;
