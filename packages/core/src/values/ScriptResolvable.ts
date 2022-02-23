import ILoader from "../ILoader";
import IScriptResolvable from "./IScriptResolvable";
import Script from "./IScript";

export default class ScriptResolvable implements IScriptResolvable {
  scriptId: string;
  position: number | undefined;
  label: string | undefined;

  constructor(scriptId: string, labelOrPosition?: string | number) {
    this.scriptId = scriptId;

    if (typeof labelOrPosition === "string") {
      this.label = labelOrPosition;
    } else if (typeof labelOrPosition === "number") {
      this.position = labelOrPosition;
    }
  }

  async resolveScript<T>(loader: ILoader<T>): Promise<Script<T>> {
    return await loader.load(this.scriptId);
  }

  resolvePosition(script: Script<any>): number {
    if (this.position) {
      return this.position;
    }

    if (this.label) {
      const labeled_position = script.labels[this.label];
      if (labeled_position === undefined) {
        throw new Error("no_such_label");
      }
      return labeled_position;
    }

    return 0;
  }

  static fromString(string: string) {
    const idAndLabelMatch = string.match(
      /^(?<scriptId>[^:]+)(:(?<label>.*))?$/
    );
    if (idAndLabelMatch && idAndLabelMatch.groups) {
      const scriptId = idAndLabelMatch.groups["scriptId"];
      const label = idAndLabelMatch.groups["label"];

      if (!scriptId) {
        throw new Error("script_id_was_not_specified");
      }

      if (label) {
        return new ScriptResolvable(scriptId, label);
      } else {
        return new ScriptResolvable(scriptId, 0);
      }
    }

    throw new Error("failed_to_parse_script_resolvable_string_" + string);
  }
}
