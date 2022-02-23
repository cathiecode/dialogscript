import IScriptResolvable from "./values/IScriptResolvable";

export default interface IRunner<T> {
  getState(): T;
  setState(newState: Partial<T>): void;
  getStack(): IScriptResolvable[];

  pause(): void;
  pop(): IScriptResolvable | undefined;
  push(to: IScriptResolvable): void;
}
