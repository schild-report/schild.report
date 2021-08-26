import { join, resolve } from "path";
import { existsSync } from "fs";
import { expose } from "comlink";
import { get, set } from 'idb-keyval';
import { watch } from "rollup";
import svelte from "rollup-plugin-svelte";

// svelte components möchten svelte importieren. Da wir aber auch components
// ohne node_modules zulassen, müssen wir das Verzeichnis an svelte weiterreichen
const __nodeModules = process.env.PROD
  ? resolve(__dirname, "node_modules/svelte")
  : resolve(__dirname, "../node_modules/svelte");

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
    const input = resolve(options.source)
    this.input = {
      input,
      treeshake: false,
      plugins: [
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
      ],
    };
    // lade dynamisch node resolve, json und commonjs plugins für rollup, wenn
    // eine package.json vorliegt. Es ist davon auszugehen, dass Bibliotheken
    // geholt werden müssen.
    if (existsSync(resolve(input, 'package.json'))) {
      console.log('package.json vorhanden, lade Plugins nach…')
      const { default: rollup_resolve } = await import("@rollup/plugin-node-resolve");
      const { default: commonjs } = await import("@rollup/plugin-commonjs");
      const { default: json } = await import("@rollup/plugin-json");
      this.input.plugins.push(
        json({ preferConst: true }),
        rollup_resolve({
          preferBuiltins: false,
          browser: true,
        }),
        commonjs()
      )
    }
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
