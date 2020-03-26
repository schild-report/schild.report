import { expose } from "comlink";
import { join, resolve as presolve, dirname } from 'path'
import CheapWatch from 'cheap-watch'
import { rollup } from 'rollup'
import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss'

// svelte components möchten svelte importieren. Da wir aber auch components
// ohne node_modules zulassen, müssen wir das Verzeichnis an svelte weiterreichen
const __nodeModules = process.env.PROD
  ? presolve(__dirname, 'node_modules/svelte')
  : presolve(__dirname, '../node_modules/svelte')

function moduleIds (event) {
  return {
    name: 'rollup-plugin-module-ids',
    buildEnd () {
      event(this.moduleIds)
      return null
    }
  }
}

export default class RollupBuild {
  constructor () {
    this.cache = null
    this.options = null
    this.inputOptions = null
    this.outputOptions = null
    this._ids = []
    this.watcher = []
  }

  get ids () {
    return this._ids
  }
  set_options (options) {
    this.options = options ? options : this.options
    this.inputOptions = {
      input: this.options.source,
      cache: this.cache,
      perf: true,
      treeshake: false,
      plugins: [
        json({ preferConst: true }),
        svelte({
          onwarn: (warning, handler) => {
            if (warning.code === 'css-unused-selector') return
            handler(warning)
          },
          sveltePath: __nodeModules,
          immutable: false,
          accessors: true,
          dev: !!this.options.debug
        }),
        this.options.plugin && postcss(),
        moduleIds(ids => this._ids = Array.from(ids)),
        resolve({ preferBuiltins: false, browser: true }),
        commonjs()
      ]
    }
    this.outputOptions = {
      file: join(this.options.dest, '/bundle.js'),
      format: 'cjs',
      name: 'components',
      sourcemap: true
    }
  }
  async build () {
    try {
      const bundle = await rollup(this.inputOptions)
      this.cache = bundle.cache
      await bundle.write(this.outputOptions)
      console.log('Komponenten erfolgreich kompiliert')
      // console.log(bundle.getTimings())
    } catch (error) {
      throw error
    }
  }
  watch (cb) {
    while (this.watcher.length) { this.watcher.pop().close() }
    Array.from(this._ids).forEach(async (moduleID) => {
      if (!moduleID.includes('node_modules')) {
        const emitter = new CheapWatch({
          dir: dirname(moduleID),
          debounce: 30,
          filter: ({ path, stats }) => moduleID.endsWith(path)
        })
        console.log('Beobachte: ' + moduleID)
        try {
          await emitter.init()
          emitter.on('+', async ({ path, stats, isNew }) => {
            if (!isNew) {
              console.log('Änderungen bei: ' + path)
              cb()
            }
          })
        } catch (e) {
          console.log(e)
        }
        this.watcher.push(emitter)
      }
    })
  }
}

expose(new RollupBuild())