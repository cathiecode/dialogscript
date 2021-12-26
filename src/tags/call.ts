import { TagReducer } from "../Runner";

const call: TagReducer = {
  tagName: "call",
  exec: function (params, runner) {
    if (params["storage"] && params["storage"] !== "") {
      runner.push();
      runner.jump(params["storage"]);
      runner.pause();
    } else {
      throw new Error("call: Jump destination was not specified.");
    }
  },
  params: {
    storage: "",
  },
};

export default call;
