import { TagReducer } from "../Runner";
import w from "./w";
import text from "./text";
import call from "./call";
import bg from "./bg";
import cm from "./cm";
import macro from "./macro";
import _return from "./return";
import charaNew from "./chara_new";
import charaFace from "./chara_face";
import charaHideAll from "./chara_hide_all";
import er from "./er";
import charaPText from "./chara_ptext";

const defaultTagReducers: Map<string, TagReducer> = new Map();

[
  w,
  er,
  text,
  call,
  bg,
  cm,
  macro,
  _return,
  charaNew,
  charaFace,
  charaPText,
  charaHideAll,
].forEach((tagReducer) => {
  defaultTagReducers.set(tagReducer.tagName, tagReducer);
});

export default defaultTagReducers;
