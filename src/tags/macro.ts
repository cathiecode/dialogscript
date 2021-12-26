import { TagReducer } from "../Runner";

const macro: TagReducer = {
  tagName: "macro",
  exec: function (params, runner) {
    if (!params["name"]) {
      throw new Error("Parameter error: name was not specified");
    }
    runner.startMacroRecording(params["name"]);
  },
  params: {
    name: null,
  },
};

export default macro;
