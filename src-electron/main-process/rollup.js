import { rollup } from 'rollup'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import json from 'rollup-plugin-json'
import { join } from 'path'

let inputOptions, outputOptions

export const rollupSetup = (options) => {
  const source = options.source
  const dest = options.dest
  console.log(source)

  inputOptions = {
    input: source,
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

  outputOptions = {
    file: join(dest, '/bundle.js'),
    format: 'cjs',
    name: 'components'
  }
}

export const rollupBuild = async () => {
  try {
    const bundle = await rollup(inputOptions)
    await bundle.write(outputOptions)
    console.log('Komponenten erfolgreich kompiliert')
    return bundle.modules.map(m => m.id)
  } catch (err) {
    console.log(err)
    throw err
  }
}
