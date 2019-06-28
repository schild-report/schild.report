<template>
  <div class="container" v-if="modules">
    <q-tabs
      v-model="moduleIndex"
      dense
      align="left"
      no-caps
      indicator-color="red"
      class="bg-primary text-white shadow-2"
    >
      <q-tab
        v-for="(module, index) in modules"
        v-bind:key="index"
        :name="index"
        :label="name(module.id)"
      />
    </q-tabs>
    <monaco-editor
      class="editor"
      v-model="code"
      :language="language"
      @change="changed"
      ref="editor"
    ></monaco-editor>
  </div>
</template>

<script>
import MonacoEditor from 'vue-monaco'
const { ipcRenderer: ipc } = require('electron-better-ipc')
import { basename, extname } from 'path'
import { writeFile } from 'fs'
import { debounce } from 'quasar'

const languages = { html: 'html', js: 'javascript', json: 'json' }

export default {
  name: 'editor',
  components: { MonacoEditor },
  watch: {
    modules () {
      this.code = this.modules[0].originalCode
      this.moduleIndex = 0
    },
    moduleIndex () {
      this.code = this.modules[this.moduleIndex].originalCode
      this.language = this.getLanguage(this.modules[this.moduleIndex].id)
    }
  },
  mounted () {
    window.addEventListener('resize', this.resize)
    ipc.callMain('getBundle').then(bundle => { this.bundle = bundle })
    ipc.answerMain('bundleRollup', bundle => {
      this.bundle = bundle
      console.log('Bundle übertragen')
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resize)
  },
  data () {
    return {
      moduleIndex: 0,
      code: this.modules ? this.modules[0].originalCode : 'Kein Dokument geladen',
      language: 'html',
      bundle: {}
    }
  },
  computed: {
    modules () { return this.bundle.cache && this.bundle.cache.modules.filter(m => !m.id.includes('node_modules') && !m.id.includes('commonjsHelpers')).reverse() }
  },
  methods: {
    name (id) { return basename(id) },
    getLanguage (id) { return languages[extname(id).substring(1)] },
    resize: debounce(function () { this.$refs.editor.getMonaco().layout() }, 300),
    changed: debounce(function (value) {
      writeFile(this.modules[this.moduleIndex].id, value, error => {
        if (error) throw error
      })
    }, 500)
  }
}
</script>

<style>
.container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.editor {
  height: 100%;
  width: 100%;
}
</style>
