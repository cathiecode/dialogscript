import { TagReducer } from "../Runner";

const charaPText: TagReducer = {
  tagName: "chara_ptext",
  exec: function (params, runner) {
    runner.mutateState({
      chara: params["chara"] ?? null,
      // TODO: 立ち絵の表情差分を更新する
    });
  },
  params: {
    chara: null,
    variant: null,
  },
};

export default charaPText;
