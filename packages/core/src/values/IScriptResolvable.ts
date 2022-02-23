import ILoader from "../ILoader";
import Script from "./IScript";

export default interface IScriptResolvable {
  resolveScript<T>(loader: ILoader<T>): Promise<Script<T>>;
  resolvePosition<T>(script: Script<T>): number;
}
