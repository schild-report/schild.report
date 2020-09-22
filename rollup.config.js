import svelte from "rollup-plugin-svelte";
import externals from "rollup-plugin-node-externals";
import { VERSION } from './src/version'

export default [
  {
    input: [
      "src/schild_worker.js",
      "src/repo_worker.js",
      "src/rollup_worker.js",
      "src/preload.js",
      "src/main.js",
      "src/index.js",
    ],
    output: [
      {
        sourcemap: VERSION.production,
        dir: "build",
        format: "cjs",
      },
    ],
    plugins: [
      svelte({
        dev: VERSION.production,
        accessors: true,
        css: (css) => {
          css.write("bundle.css");
        },
      }),
      externals({ deps: true }),
    ],
    external: [
      "svelte/internal",
      "svelte/store",
      "@rollup/plugin-commonjs",
      "@rollup/plugin-json",
      "@rollup/plugin-node-resolve",
      "bulma",
      "cheap-watch",
      "comlink",
      "electron-store",
      "electron-util",
      "knex",
      "mark.js",
      "mysql",
      "objection",
      "pg",
      "rollup",
      "rollup-plugin-postcss",
      "rollup-plugin-svelte",
      "schild",
      "serialize-error",
      "snarkdown",
      "svelte",
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
];
