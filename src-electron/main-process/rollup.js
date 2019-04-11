import { join, resolve as presolve } from 'path'
import { rollup } from 'rollup'
import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import * as EventEmitter from 'events'

// svelte components möchten svelte importieren. Da wir aber auch components
// ohne node_modules zulassen, müssen wir das Verzeichnis an svelte weiterreichen
const __nodeModules = process.env.PROD
  ? presolve(__dirname, 'node_modules/svelte')
  : presolve(__dirname, '../../node_modules/svelte')

function moduleIds (event) {
  return {
    name: 'rollup-plugin-module-ids',
    buildEnd () {
      event(this.moduleIds)
      return null
    }
  }
}

export default class rollupBuild extends EventEmitter {
  constructor () {
    super()
    this.cache = null
    this.options = null
  }

  async build (options) {
    this.options = options ? { ...options, dirty: true } : this.options
    const inputOptions = {
      input: this.options.source,
      cache: this.cache,
      perf: true,
      treeshake: false,
      plugins: [
        json({ preferConst: true }),
        svelte({
          onwarn: (warning, handler) => {
            if (warning.code === 'css-unused-selector') return
            this.emit('message', warning)
            handler(warning)
          },
          sveltePath: __nodeModules,
          // accessors: true,
          immutable: true,
          dev: !!this.options.debug
        }),
        moduleIds(ids => this.emit('moduleIDs', ids)),
        resolve({ preferBuiltins: false, browser: true }),
        commonjs()
      ]
    }
    const outputOptions = {
      file: join(this.options.dest, '/bundle.js'),
      format: 'cjs',
      name: 'components',
      sourcemap: true
    }
    try {
      const bundle = await rollup(inputOptions)
      this.cache = bundle.cache
      await bundle.write(outputOptions)
      console.log('Komponenten erfolgreich kompiliert')
      console.log(bundle.getTimings())
      if (this.options.dirty) {
        this.emit('bundle', bundle)
        delete this.options.dirty
      }
    } catch (error) {
      this.emit('message', error)
      throw error
    }
  }
}
