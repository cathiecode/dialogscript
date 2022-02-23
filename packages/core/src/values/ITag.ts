import IRunner from "../IRunner";

export default interface ITag<T> {
  name?: string;
  apply(state: T, runner: IRunner<T>): Promise<T> | Promise<void> | T | void;
}
