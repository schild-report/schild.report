import svelte from "rollup-plugin-svelte";
import externals from "rollup-plugin-node-externals";
import css from 'rollup-plugin-css-only'
import VERSION from './src/version.mjs'

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
        format: "cjs"
      },
    ],
    plugins: [
      svelte({
        compilerOptions: {
          dev: VERSION.production
        }
      }),
      externals({ deps: true }),
      css({ output: 'bundle.css' })
    ],
    onwarn(warning, warn) {
      if (warning.code === "CIRCULAR_DEPENDENCY") return;
      warn(warning);
    },
  },
];
