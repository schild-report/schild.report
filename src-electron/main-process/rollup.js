import { join, resolve as presolve } from 'path'
import { rollup } from 'rollup'
import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import * as EventEmitter from 'events'

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
    this.options = options || this.options
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
          }
        }),
        moduleIds(ids => this.emit('moduleIDs', ids)),
        resolve({ customResolveOptions: { moduleDirectory: presolve(__dirname, '../../node_modules') } }),
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
    } catch (error) {
      this.emit('message', error)
    }
  }
}
