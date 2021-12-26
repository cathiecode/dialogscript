import { TagReducer } from "../Runner";

const charaNew: TagReducer = {
  tagName: "chara_new",
  exec: function (params, runner) {
    if (!params["name"]) {
      throw new Error("chara_new: name was not specified");
    }

    const fgImages = new Map();
    let fgImageState;
    if (params["storage"]) {
      fgImageState = {
        x: null,
        y: null,
        storage: params["storage"],
        partsLayers: new Map(),
      };
      fgImages.set("default", fgImageState);
    } else {
      fgImageState = null;
    }

    runner.addChara({
      id: params["name"],
      name: params["jname"] ?? params["name"],
      aliases: [],
      fgImages,
      fgImageState,
    });
  },
  params: {
    name: null,
    jname: null,
    storage: null,
  },
};

export default charaNew;
