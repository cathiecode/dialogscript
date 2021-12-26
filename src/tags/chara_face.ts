import { TagReducer } from "../Runner";

const charaFace: TagReducer = {
  tagName: "chara_face",
  exec: function (params, runner) {
    if (!params["name"]) {
      throw new Error("chara_face: name not specified");
    }
    if (!params["face"]) {
      throw new Error("chara_face: face not specified");
    }
    if (!params["storage"]) {
      throw new Error("chara_face: storage not specified");
    }

    runner.addCharaVariant(params["name"], params["face"], params["storage"]);
  },
  params: {
    name: null,
    face: null,
    storage: null,
  },
};

export default charaFace;
