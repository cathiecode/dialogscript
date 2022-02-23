import ILoader from "../ILoader";
import IScriptResolvable from "./IScriptResolvable";
import Script from "./IScript";

export default class StackValue implements IScriptResolvable {
  private script: Script<any>;
  private position: number;

  constructor(script: Script<any>, position: number) {
    this.script = script;
    this.position = position;
  }

  async resolveScript<T>(_: ILoader<T>): Promise<Script<T>> {
    return this.script;
  }

  resolvePosition(_: Script<any>) {
    return this.position;
  }

  increment(): number {
    return ++this.position;
  }

  static fromScriptResolvable<T>(
    scriptResolvable: IScriptResolvable,
    script: Script<T>
  ) {
    if (scriptResolvable instanceof StackValue) {
      return scriptResolvable;
    }
    return new StackValue(script, scriptResolvable.resolvePosition(script));
  }
}
