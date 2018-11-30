import { join } from 'path'
import { rollup } from 'rollup'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import json from 'rollup-plugin-json'

let cache

export const rollupBuild = async (options) => {
  const inputOptions = {
    input: options.source,
    cache,
    perf: true,
    treeshake: false,
    plugins: [
      json({ preferConst: true }),
      resolve(),
      commonjs(),
      svelte({
        parser: 'v2',
        onwarn: (warning, handler) => {
          if (warning.code === 'css-unused-selector') return
          console.log(warning.code)
        }
      })
    ]
  }
  const outputOptions = {
    file: join(options.dest, '/bundle.js'),
    format: 'cjs',
    name: 'components',
    sourcemap: true
  }
  try {
    const bundle = await rollup(inputOptions)
    cache = bundle.cache
    await bundle.write(outputOptions)
    console.log('Komponenten erfolgreich kompiliert')
    console.log(bundle.getTimings())
    return bundle.modules.map(m => m.id)
  } catch (err) {
    console.log(err)
    throw err
  }
}
