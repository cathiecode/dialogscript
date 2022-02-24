import IRunner from "./IRunner";

import ILoader from "./ILoader";
import IOp from "./values/IOp";
import IScriptResolvable from "./values/IScriptResolvable";

import Script from "./values/IScript";
import StackValue from "./values/StackValue";
import { EventEmitter } from "eventemitter3";

export default class Runner<T> extends EventEmitter implements IRunner<T> {
  protected state: T;
  protected paused: boolean = true;
  protected continuing: boolean = false;

  protected script: Script<T> | undefined;

  // NOTE: scriptIdとscriptPositionをスタックに統合できそう
  protected stack: IScriptResolvable[];

  protected loader: ILoader<T>;

  constructor(script: IScriptResolvable, state: T, loader: ILoader<T>) {
    super();
    this.state = state;
    this.stack = [script];
    this.loader = loader;
  }

  async continue(): Promise<T> {
    if (this.continuing) {
      return this.state;
    }
    this.emit("willContinue");
    this.continuing = true;
    this.paused = false;

    if (this.stack.length === 0) {
      throw new Error("fell_into_end_of_script");
    }

    while (!this.paused) {
      await this.step();
    }

    this.continuing = false;
    this.emit("didContinue");
    return this.state;
  }

  async execTag(tag: IOp<T>): Promise<void> {
    this.emit("willExecTag", tag);
    const tagResult = await tag.apply(this.state, this);
    if (tagResult) {
      this.setState(tagResult);
    }
    this.emit("didExecTag", tag);
  }

  async step() {
    const execStackPosition = this.stack.length - 1;
    const execStack = this.stack[this.stack.length - 1];

    if (!execStack) {
      this.pause();
      return;
    }

    // OPTIMIZE: Scriptが変わってないときにloadしない
    this.script = await execStack.resolveScript(this.loader);

    const execScriptPosition = execStack.resolvePosition(this.script);

    // console.log(`${(await execStack.resolveScript(this.loader)).id}:${execScriptPosition} (${this.script.tags[execScriptPosition]?.name})`);

    if (execScriptPosition >= this.script.tags.length) {
      this.stack.pop();
      return;
    }

    const tag = this.script.tags[execScriptPosition];

    if (!tag) {
      throw new Error("somehow_position_is_messed");
    }

    await this.execTag(tag);

    // FIXME: pタグが壊れる可能性
    const newStack = StackValue.fromScriptResolvable(execStack, this.script);
    newStack.increment();
    this.stack[execStackPosition] = newStack;
  }

  pause(): void {
    this.paused = true;
  }

  getState(): T {
    return this.state;
  }
  setState(newState: T): void {
    this.emit("willNewState", newState);
    this.state = newState;
    this.emit("didNewState", newState);
  }

  push(to: IScriptResolvable): void {
    this.stack.push(to);
  }

  pop(): IScriptResolvable | undefined {
    const stack = this.stack.pop();

    if (!stack) {
      throw new Error("stack_was_empty");
    }
    return stack;
  }

  getStack(): IScriptResolvable[] {
    return this.stack;
  }

  // NOTE: experimental feature: iterable runner
  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  async next() {
    if (!this.paused) {
      return {
        value: this.state,
        done: true,
      };
    }
    await this.continue();
    return {
      value: this.state,
      done: false,
    };
  }
}
