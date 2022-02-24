import { ITagParams } from "../ITag";
import ITagCompatibleState from "../ITagCompatibleState";

const text = {
  name: "text",
  params: { contents: "" },
  exec: <T extends ITagCompatibleState>(params: ITagParams, state: T): T => ({
    ...state,
    text: state.text + params["contents"],
  }),
};

export default text;
