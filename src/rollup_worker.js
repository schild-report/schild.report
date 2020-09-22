import { expose } from "comlink";
import { join, resolve as presolve } from "path";
import { watch } from "rollup";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

// svelte components möchten svelte importieren. Da wir aber auch components
// ohne node_modules zulassen, müssen wir das Verzeichnis an svelte weiterreichen
const __nodeModules = process.env.PROD
  ? presolve(__dirname, "node_modules/svelte")
  : presolve(__dirname, "../node_modules/svelte");

class RollupBuild {
  constructor() {
    this.cache = null;
    this.options = null;
    this.inputOptions = null;
    this.outputOptions = null;
    this._ids = [];
    this.watcher = null;
  }

  get ids() {
    return this._ids;
  }
  set_options(options) {
    this.options = options ? options : this.options;
    this.inputOptions = {
      input: this.options.source,
      cache: this.cache,
      perf: true,
      treeshake: false,
      plugins: [
        json({ preferConst: true }),
        svelte({
          onwarn: (warning, handler) => {
            if (warning.code === "css-unused-selector") return;
            handler(warning);
          },
          sveltePath: __nodeModules,
          immutable: false,
          accessors: true,
          dev: this.options.debug,
        }),
        resolve({ preferBuiltins: false, browser: true }),
        commonjs(),
      ],
    };
    this.outputOptions = {
      file: join(this.options.dest, "/bundle.js"),
      format: "cjs",
      name: "components",
      sourcemap: this.options.source_maps && "inline",
    };
  }
  async build(cb) {
    const watchOptions = {
      ...this.inputOptions,
      output: [this.outputOptions],
      watch: {
        skipWrite: !this.options.write,
        exclude: "node_modules/**",
      },
    };
    try {
      this.watcher && this.watcher.close();
      this.watcher = watch(watchOptions);
      this.watcher.on("event", async (event) => {
        if (event.code === "ERROR") {
          console.log(event)
          cb(event)
        }
        if (event.code === "BUNDLE_END") {
          const { output } = await event.result.generate(this.outputOptions);
          console.log("Komponenten erfolgreich kompiliert");
          const [compiled_module] = output;
          if (this.options.source_maps) {
            compiled_module.code += `\n//# sourceMappingURL=${compiled_module.map.toUrl()}\n`;
          }
          cb(compiled_module);
        }
      });
    } catch (error) {
      console.log(error)
      throw error;
    }
  }
}

expose(new RollupBuild());