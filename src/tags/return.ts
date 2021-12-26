import { TagReducer } from "../Runner";

const _return: TagReducer = {
  tagName: "return",
  exec: function (_params, runner) {
    runner.pop();
  },
  params: {},
};

export default _return;
