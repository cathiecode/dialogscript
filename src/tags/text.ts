import { TagReducer } from "../Runner";

const text: TagReducer = {
  tagName: "text",
  exec: function (params, runner) {
    runner.mutateState({
      message: params["text"]
        ? runner.getState().message + params["text"]
        : runner.getState().message,
    });
  },
  params: {
    text: null,
  },
};

export default text;
