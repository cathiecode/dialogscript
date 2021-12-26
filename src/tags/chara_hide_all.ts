import { TagReducer } from "../Runner";

const charaHideAll: TagReducer = {
  tagName: "chara_hide_all",
  exec: function (_params, runner) {
    runner.mutateState({
      fgImages: [],
    });
  },
  params: {},
};

export default charaHideAll;
