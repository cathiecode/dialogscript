import { TagReducer } from "../Runner";

const bg: TagReducer = {
  tagName: "bg",
  exec: function (params, runner) {
    if (params["storage"] && params["storage"] !== "") {
      runner.mutateState({
        bgImage: {
          storage: params["storage"],
        },
      });
    } else {
      runner.mutateState({
        bgImage: null,
      });
    }
  },
  params: {
    storage: null,
  },
};

export default bg;
