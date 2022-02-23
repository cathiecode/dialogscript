import Script from "./values/IScript";

export default interface ILoader<T> {
  load(scriptId: string): Promise<Script<T>>;
}
