import * as rollup from 'rollup'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import json from 'rollup-plugin-json'
import path from 'path'

let inputOptions, outputOptions

export const rollupSetup = (options) => {
  const statics = options.statics
  const source = options.source
  const dest = options.dest
  const is = options.is
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
    file: is.development ? path.join(statics, '/plugins/bundle.js') : path.join(dest, '/bundle.js'),
    format: 'cjs',
    name: 'components'
  }
}

export const rollupBuild = async () => {
  return rollup
    .rollup(inputOptions)
    .then(bundle => {
      return bundle.write(outputOptions)
    })
    .then(() => {
      console.log('Komponenten erfolgreich kompiliert')
    })
    .catch(err => {
      throw err
    })
}

export const rollupWatch = async () => {
  const watchOptions = {
    ...inputOptions,
    output: [outputOptions]
  }
  const watcher = rollup.watch(watchOptions).on('event', event => {
    // event.code: START, BUNDLE_START, BUNDLE_END, END, ERROR, FATAL
    console.log(new Date().toLocaleDateString('de-DE', { hour: 'numeric', minute: 'numeric', second: 'numeric' }))
    console.log(event)
  })
  return watcher
}
