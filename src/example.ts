import StorageKagIrLoader from "./StorageKagIrLoader";
import KagIrRunner from "./KagIrRunner";
import { error } from "./log";
import defaultTagReducers from "./tags";
import path = require("path");
import { RunnerState } from "./Runner";

const runner = new KagIrRunner(
  new StorageKagIrLoader(path.join(process.cwd(), "scenario"))
);

runner.appendTagReducers(defaultTagReducers);

let currentText = "";

runner
  .run("prologue.ks")
  .then(() => {
    runner.on("stateDidMutate", (state: RunnerState) => {
      const chara = state.chara?.trim();
      const plainText = state.message.trim();
      if (plainText === "") {
        return;
      }
      if (currentText !== plainText) {
        currentText = plainText;
        console.log(`${chara ? `<${chara}> ` : ""}${currentText}`);
      }
    });
    process.stdin.on("data", () => {
      runner.continue();
    });
  })
  .catch((e) => {
    error("Uncaught error below occured; quitting.");
    error(e);
  });
