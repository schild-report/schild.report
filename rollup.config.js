import svelte from "rollup-plugin-svelte";
import externals from 'rollup-plugin-node-externals'

const production = process.env.NODE_ENV !== "development";

export default [
  {
    input: ["src/schild_worker.js", "src/repo_worker.js", "src/rollup_worker.js",
            "src/preload.js",
            "src/main.js",
            "src/index.js"
           ],
    output: [
      {
        sourcemap: true,
        dir: "build",
        format: "cjs",
      }
    ],
    plugins: [
      svelte({
        dev: !production,
        css: css => {
          css.write("build/bundle.css");
        },
      }),
      externals({deps: true})
    ],
    external: ['svelte/internal', 'svelte/store'],
    onwarn (warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
  }
];
