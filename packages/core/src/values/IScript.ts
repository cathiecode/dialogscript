import ITag from "./IOp";

interface IScript<T> {
  id?: string;
  tags: ITag<T>[];
  labels: { [label: string]: number };
}

export default IScript;
