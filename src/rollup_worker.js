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
  set_options(options) {
    this.temp = options ? options : this.temp;
    this.input = {
      input: this.temp.source,
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
          dev: this.temp.debug
        }),
        resolve({ preferBuiltins: false, browser: true }),
        commonjs()
      ]
    }
    this.output = {
        file: join(this.temp.dest, "/bundle.js"),
        format: "cjs",
        name: "components",
        sourcemap: this.temp.source_maps && "inline",
    }
    this.watch = {
        skipWrite: !this.temp.write,
        exclude: "node_modules/**",
    }
    this.options = {
      ...this.input,
      output: [this.output],
      watch: this.watch
    }
  }
  async build(callback) {
    try {
      this.watcher && this.watcher.close();
      this.watcher = watch(this.options);
      this.watcher.on("event", async (event) => {
        if (event.code === "ERROR") {
          console.log(event)
          callback(event, null)
        }
        if (event.code === "BUNDLE_END") {
          const { output } = await event.result.generate(this.output);
          console.log("Komponenten erfolgreich kompiliert");
          const [compiled_module] = output;
          if (this.options.sourcemap) {
            compiled_module.code += `\n//# sourceMappingURL=${compiled_module.map.toUrl()}\n`;
          }
          callback(null, compiled_module);
        }
      });
    } catch (error) {
      console.log(error)
      throw error;
    }
  }
}

expose(new RollupBuild());