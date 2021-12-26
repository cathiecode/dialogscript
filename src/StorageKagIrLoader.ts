import { error, debug, info } from "./log";
import { readFile } from "fs";
import { ScriptLoader } from "./KagIrRunner";
import tokenize from "./parser/tokenize";
import tokenToTaggedIr, { KagIr } from "./parser/tokenToTaggedIr";
import path = require("path");
import calcRoughObjectSize from "./utils/calcRoughObjectSize";
import Cache from "./utils/cache";

/*const StorageKagIrLoader: (baseName: string) => ScriptLoader = (baseName) => ({
  loadScript: (scriptId: string) =>

});*/

class StorageKagIrLoader implements ScriptLoader {
  private baseName: string;

  private cache: Cache<string, KagIr> = new Cache();

  constructor(baseName: string) {
    this.baseName = baseName;
  }

  loadScript(scriptId: string): Promise<KagIr> {
    return this.cache.cacheOrLoad(
      scriptId,
      () =>
        new Promise((resolve, reject) => {
          info("Start loading script:", scriptId);
          readFile(path.join(this.baseName, scriptId), (err, data) => {
            if (err) {
              error("Script file loading failed", scriptId);
              return reject(err);
            }

            debug("Start tokenizing");
            const tokens = tokenize(data.toString());

            debug("Start build IR");
            const tagIr = tokenToTaggedIr(tokens);

            info("Loading script done");
            info(
              "Rough scenario size is",
              () => calcRoughObjectSize(tagIr) / 1000,
              "KiB /",
              tagIr.length,
              "tags"
            );
            return resolve(tagIr);
          });
        })
    );
  }
}

export default StorageKagIrLoader;
