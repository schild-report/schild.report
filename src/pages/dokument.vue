<template>
  <div>
    <webview src="about:blank" :preload="preload" autosize disablewebsecurity></webview>
    <q-page-sticky position="top-right" :offset="[18, 70]">
      <q-btn
        round
        contenteditable="false"
        :color="editColor"
        icon="create"
        @click="editContent"
      />
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 122]">
      <q-btn
        round
        devTools="false"
        :color="devToolsColor"
        icon="build"
        @click="toggleDevTools"
      />
    </q-page-sticky>
    <q-dialog v-model="dialogModel" v-if="dialogModel">
      <span slot="title">{{dialogMessage.pluginCode}}</span>
      <div slot="body">
        Fehler in <b>{{dialogMessage.filename}}</b>:
        <br>
        Von Zeile {{dialogMessage.start.line}} bis {{dialogMessage.end.line}}
        <br>
        <pre>{{dialogMessage.frame}}</pre>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import path from 'path'
const ipc = require('electron-better-ipc')
let webview

export default {
  name: 'Dokument',
  watch: {
    $route (to, from) { this.updateComponent() }
  },
  data () {
    return {
      preload: 'file://' + path.join(__statics, '/preload.js'),
      edit: false,
      editColor: 'red',
      devTools: false,
      devToolsColor: 'red',
      load: false,
      dialogModel: false,
      dialogMessage: ''
    }
  },
  mounted () {
    webview = document.querySelector('webview')
    ipc.answerMain('hmr', () => {
      this.createSvelte()
      this.$q.loading.hide()
    })
    ipc.answerMain('message', async (message) => {
      this.$q.loading.hide()
      this.dialogModel = true
      this.dialogMessage = message
    })
    const loadPage = () => {
      console.log('loadPage')
      this.updateComponent()
      webview.removeEventListener('dom-ready', loadPage)
    }
    webview.addEventListener('dom-ready', loadPage)
  },
  methods: {
    editContent () {
      this.edit = !this.edit
      this.editColor = this.edit ? 'green' : 'red'
      webview.send('editContent', this.edit)
    },
    toggleDevTools () {
      const is = webview.isDevToolsOpened()
      this.devTools = !is
      this.devToolsColor = !is ? 'green' : 'red'
      is ? webview.closeDevTools() : webview.openDevTools()
    },
    createSvelte () {
      webview.send('updateComponents', {
        componentsPath: this.$store.state.data.componentsPath + '/bundle.js',
        knex: this.$store.state.data.knex,
        reportData: this.$store.getters['data/reportData']
      })
      console.log('svelte created', Date())
    },
    updateComponent () {
      this.$q.loading.show()
      const sendIPC = async () => {
        console.log('sendIPC')
        await ipc.callMain('compileDokumente', `${this.$route.params.repo}/${this.$route.params.id}`)
        webview.removeEventListener('dom-ready', sendIPC)
      }
      console.log('updateComponent')
      webview.loadURL(
        `data:text/html;charset=utf-8;base64,
        PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9InV0Zi04
        Ij48c3R5bGU+QG1lZGlhIHByaW50IHsubm9wcmludCAqIHtkaXNwbGF5Om5vbmU7aGVpZ2h0OjA7
        fX08L3N0eWxlPjwvaGVhZD48Ym9keT48c2NyaXB0PmlwYygpPC9zY3JpcHQ+PGRpdiBpZD0iY29u
        dGVudCIgY29udGVudGVkaXRhYmxlPSJmYWxzZSI+PHN2ZWx0ZT48L3N2ZWx0ZT48L2Rpdj48L2Jv
        ZHk+PC9odG1sPg==`, { baseURLForDataURL: `file://${this.$store.state.data.documentSource}/${this.$route.params.repo}/` })
      console.log(`baseURL für Dokument: file://${this.$store.state.data.documentSource}/${this.$route.params.repo}`)
      webview.addEventListener('dom-ready', sendIPC)
    }
  }
}
</script>

<style>
  webview {
    display: block;
    border: none;
    height: 100vh;
    width: 100vw;
    display: inline-flex !important;
  }
</style>
