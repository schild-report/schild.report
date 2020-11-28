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

  function bugfu (options) {
    if (!options.debug) return null;
    return {
      name: 'Debugger', // this name will show up in warnings and errors
      resolveId ( source ) {
        console.log('Das ist source: ', source)
        return null; // other ids should be handled as usually
      },
      load ( id ) {
        console.log('Das ist die ID: ', id)
        return null; // other ids should be handled as usually
      },
      moduleParsed(moduleInfo) {
        try {
          console.log('Imported Ids: ', moduleInfo.importedIds)
        } catch (e) { console.log('Missgeschick')}
        return null
      }
    };
  }

class RollupBuild {
  async build(options, callback) {
    this.input = {
      input: presolve(options.source),
      perf: true,
      treeshake: false,
      plugins: [
        bugfu(options),
        json({ preferConst: true }),
        svelte({
          emitCss: false,
          onwarn: (warning, handler) => {
            if (warning.code === "css-unused-selector") return;
            handler(warning);
          },
          compilerOptions: {
            sveltePath: __nodeModules,
            immutable: false,
            accessors: true,
            dev: options.debug
          }
        }),
        resolve({
          preferBuiltins: false,
          browser: true,
          customResolveOptions: {
            basedir: options.basedir
          }
        }),
        commonjs(),
      ]
    }
    this.output = {
        file: join(options.dest, "/bundle.js"),
        format: "cjs",
        name: "components",
        exports: "default",
        sourcemap: options.source_maps && "inline",
    }
    this.watch = {
        skipWrite: !options.write,
        exclude: "node_modules/**",
    }
    this.options = {
      ...this.input,
      output: [this.output],
      watch: this.watch
    }
    try {
      this.watcher?.close();
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