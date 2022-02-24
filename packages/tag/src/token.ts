export type Text = {
  type: "Text";
  contents: string;
};

export type Tag = {
  type: "Tag";
  tagName: string;
  params: { [name: string]: string | number | boolean };
};

export type Comment = {
  type: "Comment";
  contents: string;
};

export type Label = {
  type: "Label";
  label: string;
};

export type Token = Text | Tag | Comment | Label;

export type RootToken = Token & {
  row: number;
  column: number;
};
