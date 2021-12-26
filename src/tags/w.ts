import { TagReducer } from "../Runner";

const w: TagReducer = {
  tagName: "w",
  exec: function (_params, runner) {
    runner.pause();
  },
  params: {},
};

export default w;
