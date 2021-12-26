import Runner from "./Runner";
import { KagIr } from "./parser/tokenToTaggedIr";
import { debug } from "./log";

type StoragePosition = {
  id: string;
  count: number;
};

interface ScriptLoader {
  loadScript: (scriptId: string) => Promise<KagIr>;
}

class KagIrRunner extends Runner {
  private position: StoragePosition | null = null;
  private callStack: StoragePosition[] = [];
  private script: KagIr = [];

  private loader: ScriptLoader;
  private isLoading = false;

  private macro: Map<string, KagIr> = new Map();
  private isMacroRecording = false;
  private recordingMacro: KagIr = [];
  private recordingMacroId: string | null = null;

  constructor(loader: ScriptLoader) {
    super();
    this.loader = loader;
  }

  async run(id: string) {
    await this._jump(id, 0);
  }

  continue() {
    if (!this.position) {
      debug("Runner continue requested but position is null so do nothing");
      return;
    }
    debug("Runner continuing from", this.position.id, this.position.count);
    if (this.isLoading) {
      debug("... but loading runner detected so do nothing");
      return;
    }

    this.paused = false;

    while (!this.paused) {
      const tag = this.script[this.position.count];

      if (tag) {
        if (this.isMacroRecording) {
          if (tag.tag === "endmacro") {
            this.finishMacroRecording();
            this.position.count++;
          } else {
            debug(".", this.position.id, this.position.count, "Tag:", tag.tag);
            this.recordingMacro.push(tag);
          }
        } else {
          debug(".", this.position.id, this.position.count, "Tag:", tag.tag);
          if (this.macro.has(tag.tag)) {
            this.execMacro(tag.tag);
          } else {
            this.execTag(tag);
          }
        }
      } else {
        break;
      }
      this.position.count++;
    }

    if (!this.paused) {
      debug(". fall into EOF");
      if (this.callStack.length > 0) {
        debug("Running done; but fall backing to stack");
        this.pop();
      }
    } else {
      debug(". paused. quitting");
    }
  }

  jump(to: string): void {
    const [id, count] = to.split(":");

    if (!id) {
      throw new Error("Jump tag parse error: No file name");
    }

    this._jump(to, Number(count ?? 0));
  }

  push(): void {
    if (!this.position) {
      throw new Error("Pushing call stack requested but position was null");
    }
    debug("Push call stack", this.position);
    this.callStack.push({ ...this.position });
  }

  pop(): void {
    if (this.callStack.length < 1) {
      throw new Error("Call stack was empty.");
    }
    const returnTo = this.callStack.pop();
    if (!returnTo) {
      throw new Error("Call stack was empty.");
    }

    debug("Pop call stack", returnTo);

    // FIXME: ここの呼び出しが非同期なの問題じゃない？
    this._jump(returnTo.id, returnTo.count + 1);
  }

  startMacroRecording(id: string): void {
    if (this.isMacroRecording) {
      throw new Error("Nested macro recording error");
    }
    debug("Macro recording starting");
    this.isMacroRecording = true;
    this.recordingMacroId = id;
    this.recordingMacro = [];
  }
  finishMacroRecording(): void {
    if (!this.isMacroRecording) {
      throw new Error(
        "Macro recording finished but macro recording was not progressing"
      );
    }
    if (!this.recordingMacroId) {
      throw new Error(
        "Internal error: Macro recording finished but id was invalid"
      );
    }
    debug("Macro recording finished");
    this.isMacroRecording = false;
    this.macro.set(this.recordingMacroId, this.recordingMacro);
  }

  private execMacro(macro: string): void {
    const script = this.macro.get(macro);
    if (!script) {
      throw new Error("Internal error: specified macro was undefined");
    }

    this.push();
    this.script = script;
    this.position = {
      id: `_macro_${macro}`,
      count: 0,
    };
  }

  private _jump(id: string, count: number) {
    this.isLoading = true;
    return this.__jump(id, count);
  }
  private async __jump(id: string, count: number) {
    this.script = await this.loader.loadScript(id);
    this.isLoading = false;
    this.position = {
      id: id,
      count: count,
    };
    this.continue();
  }
}

export default KagIrRunner;
export { ScriptLoader };
