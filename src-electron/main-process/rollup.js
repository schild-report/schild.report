import * as rollup from 'rollup'
import globImport from 'rollup-plugin-glob-import'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import replace from 'rollup-plugin-replace'
import copy from 'rollup-plugin-cpy'
import json from 'rollup-plugin-json'
import path from 'path'

let inputOptions, outputOptions, watchOptions

export const rollupSetup = (options) => {
  const statics = options.statics
  const source = options.source
  const dest = options.dest
  const is = options.is

  inputOptions = {
    input: path.join(source, '/plugin-loader.js'),
    plugins: [
      json({ preferConst: true }),
      resolve({
        customResolveOptions: {
          moduleDirectory: 'node_modules'
        }
      }),
      commonjs(),
      globImport({
        format: 'default',
        intercept (sources, importer, importee) {
          return sources.filter(s => !path.basename(s, '.html').startsWith('_'))
        },
        rename (name, id) {
          return `${path.basename(path.dirname(id))}___${path.basename(id, '.html')}`
        }
      }),
      svelte({
        parser: 'v2',
        onwarn: (warning, handler) => {
          if (warning.code === 'css-unused-selector') return
          console.log(warning.code)
          // handler(warning)
        }
      }),
      replace({
        daten: id => is.development ? `plugins/${path.basename(path.dirname(id))}/daten` : `${dest}/${path.basename(path.dirname(id))}/daten`
      }),
      copy({
        files: '*/daten/*',
        dest: is.development ? `${statics}/plugins` : dest,
        options: {
          parents: true,
          cwd: source,
          verbose: true
        }
      })
    ]
  }

  outputOptions = {
    file: is.development ? path.join(statics, '/plugins/bundle.js') : path.join(dest, '/bundle.js'),
    format: 'cjs',
    name: 'components'
  }

  watchOptions = Object.assign(
    {
      output: [outputOptions],
      watch: {
      }
    },
    inputOptions
  )
}

export const rollupBuild = () => {
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

export const rollupWatch = () => {
  const watcher = rollup.watch(watchOptions).on('event', event => {
    // event.code: START, BUNDLE_START, BUNDLE_END, END, ERROR, FATAL
    console.log(new Date().toLocaleDateString('de-DE', { hour: 'numeric', minute: 'numeric', second: 'numeric' }))
    console.log(event)
  })
  return watcher
}
