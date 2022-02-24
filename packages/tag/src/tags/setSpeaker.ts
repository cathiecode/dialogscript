import ITag, { ITagParams } from "../ITag";
import ITagCompatibleState from "../ITagCompatibleState";

const setSpeaker = {
  name: "setSpeaker",
  params: { name: "" },
  exec: <T extends ITagCompatibleState>(params: ITagParams, state: T): T => ({
    ...state,
    speaker: params["name"],
  }),
} as ITag<ITagCompatibleState>;

export default setSpeaker;
