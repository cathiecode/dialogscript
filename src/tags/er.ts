import { TagReducer } from "../Runner";

const er: TagReducer = {
  tagName: "er",
  exec: function (_params, runner) {
    runner.mutateState({
      message: "",
    });
  },
  params: {},
};

export default er;
