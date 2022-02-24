import { IRunner } from "@dialogscript/core";

export type ITagParams = {
  [key: string]: string | number | boolean | null;
};

export default interface ITag<T> {
  name: string;
  params: { [key: string]: string | number | boolean | null | undefined };
  exec: (
    params: ITagParams,
    state: T,
    runner: IRunner<T>
  ) => Promise<T> | Promise<void> | T | void;
}
