import { TagReducer } from "../Runner";

const cm: TagReducer = {
  tagName: "cm",
  exec: function (_params, runner) {
    runner.mutateState({
      chara: "",
      message: "",
      fgImages: [],
      bgImage: null,
    });
  },
  params: {},
};

export default cm;
