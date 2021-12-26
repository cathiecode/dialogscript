import EventEmitter from "eventemitter3";

import { error } from "./log";

type TagParams = { [key: string | number]: string };

type TagParamsSpec = { [key: string | number]: string | null };

type Storage = string;

interface Tag {
  tag: string;
  params: TagParams;
}

interface ImageState {
  storage: Storage;
}

interface FGImageState extends ImageState {
  x: number | null;
  y: number | null;
  partsLayers: Map<string, Storage>;
}

type BGImageState = ImageState;

interface FGImage {
  storage: Storage;
  partsLayers: Map<string, Map<string, Storage>>;
}

interface Character {
  id: string;
  name: string;
  aliases: string[];
  fgImages: Map<string, FGImage>;
  fgImageState: FGImageState | null;
}

interface RunnerState {
  chara: string | null;
  message: string;
  bgImage: BGImageState | null;
  fgImages: FGImageState[];
  characters: Map<string, Character>;
}

interface TagReducer {
  tagName: string;
  exec: (option: TagParams, runner: Runner) => void;
  params: TagParamsSpec;
}

abstract class Runner extends EventEmitter {
  private state: Readonly<RunnerState> = {
    chara: "",
    message: "",
    bgImage: null,
    fgImages: [],
    characters: new Map(),
  };

  protected paused = false;

  private ignoreUndefinedTag = true;

  abstract continue(): void;

  abstract jump(to: string): void;

  abstract push(): void;

  abstract pop(): void;

  abstract startMacroRecording(id: string): void;

  abstract finishMacroRecording(): void;

  private tagReducers = new Map<string, TagReducer>();

  appendTagReducers(tagReducers: Map<string, TagReducer>) {
    this.tagReducers = new Map([...this.tagReducers, ...tagReducers]);
  }

  addTagReducer(tagReducer: TagReducer) {
    this.tagReducers.set(tagReducer.tagName, tagReducer);
  }

  execTag(tag: Tag): void {
    this.emit("beforExecTag", tag);
    const tagReducer = this.tagReducers.get(tag.tag);
    if (tagReducer) {
      tagReducer.exec(tag.params, this);
    } else {
      error("Tag not found:", tag.tag);
      if (this.ignoreUndefinedTag) {
        error("NoSuchTagError supressed because ignoring undefined tags.");
      } else {
        throw new Error("NoSuchTagError");
      }
    }
    this.emit("afterExecTag", tag);
  }

  pause(): void {
    this.paused = true;
    this.emit("paused");
  }

  getState(): Readonly<RunnerState> {
    return this.state;
  }

  mutateState(newState: Partial<RunnerState>) {
    this.emit("stateWillMutate", newState);
    this.state = { ...this.state, ...newState };
    this.emit("stateDidMutate", this.state);
  }

  addChara(character: Character) {
    this.mutateState({
      characters: new Map([
        ...this.getState().characters,
        [character.id, character],
      ]),
    });
  }

  addCharaVariant(id: string, variantId: string, storage: Storage) {
    let chara = this.getState().characters.get(id);
    if (!chara) {
      throw new Error(`addCharaVariant: NoSuchCharacter(${id})`);
    }
    chara = {
      ...chara,
      fgImages: new Map([
        ...chara.fgImages,
        [variantId, { storage, partsLayers: new Map() }],
      ]),
    };
    this.mutateState({
      characters: new Map([...this.getState().characters, [id, chara]]),
    });
  }
}

export default Runner;
export { RunnerState, TagReducer, TagParams, TagParamsSpec, Tag };
