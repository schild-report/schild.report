import { expose } from "comlink";
import { join, resolve as presolve } from "path";
import { watch } from "rollup";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { get, set } from 'idb-keyval';
import includePaths from 'rollup-plugin-includepaths'
import replace from '@rollup/plugin-replace'

// svelte components möchten svelte importieren. Da wir aber auch components
// ohne node_modules zulassen, müssen wir das Verzeichnis an svelte weiterreichen
const __nodeModules = process.env.PROD
  ? presolve(__dirname, "node_modules/svelte")
  : presolve(__dirname, "../node_modules/svelte");

  
class RollupBuild {
  async build(options, callback) {
    let cache
    if (options.cache) {
      cache = await get(options.source)
      if (cache) {
        callback(false, cache)
        console.log('Komponente wurde im Cache gefunden')
      }
    }
    console.log(`${options.rootdir}/.js`)
    this.input = {
      input: presolve(options.source),
      perf: true,
      treeshake: false,
      plugins: [
         includePaths({
          include: {},
          paths: [`${options.rootdir}/.js`],
          external: [],
          extensions: ['.js']
        }),
        includePaths({
          include: {},
          paths: [`${options.rootdir}/.vorlagen`],
          external: [],
          extensions: ['.svelte']
        }),
        replace({
          "__rootdir":options.rootdir.replace(/\\/g, "/"),
          "__basedir":options.basedir.replace("\\","/"),
        }),
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
            dev: options.debug,
          },
        }),
        resolve({
          preferBuiltins: false,
          browser: true,
        }),
        commonjs(),
      ],
    };
    this.output = {
      file: join(options.dest, "/bundle.js"),
      format: "cjs",
      name: "components",
      exports: "default",
      sourcemap: options.source_maps && "inline",
    };
    this.watch = {
      skipWrite: !options.write,
      exclude: "node_modules/**",
    };
    this.options = {
      ...this.input,
      output: [this.output],
      watch: this.watch,
    };
    try {
      this.watcher?.close();
      this.watcher = watch(this.options);
      this.watcher.on("event", async (event) => {
        if (event.code === "ERROR") {
          console.log(event);
          callback(event, null);
        }
        if (event.code === "BUNDLE_END") {
          const { output } = await event.result.generate(this.output);
          console.log("Komponenten erfolgreich kompiliert");
          const [compiled_module] = output;
          if (this.options.sourcemap) {
            compiled_module.code += `\n//# sourceMappingURL=${compiled_module.map.toUrl()}\n`;
          }
          if (cache?.code === compiled_module.code) {
            return
          } else { console.log('Build weicht vom Cache ab, neu rendern')}
          if (options.cache) { set(options.source, compiled_module) }
          callback(false, compiled_module);
        }
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

expose(new RollupBuild());
