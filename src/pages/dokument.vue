<template>
  <div>
    <webview src="about:blank" :preload="preload"></webview>
    <q-page-sticky position="top-right" :offset="[18, 18]" v-if="$store.state.data.schuelerGewaehlt.length > 0">
      <q-fab
        ref="abschnitte"
        round
        color="blue"
        icon="date_range"
        direction="left"
      >
        <q-fab-action v-for="(a, index) in $store.state.data.schuelerGewaehlt[0].abschnitte" :key="index"
          color="primary"
          icon=""
          @click="setAbschnitt(a)"
        >{{a.Jahr-2000}}/{{a.Abschnitt}}</q-fab-action>
      </q-fab>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 85]">
      <q-btn round color="red" @click="showDataInConsole()"><q-tooltip>Schülerdaten in der Konsole ausgeben</q-tooltip><b>{ }</b></q-btn>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 137]">
      <q-btn
        round
        contenteditable="false"
        :color="editColor"
        icon="create"
        @click="editContent"
      />
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 189]">
      <q-btn
        round
        devTools="false"
        :color="devToolsColor"
        icon="build"
        @click="toggleDevTools"
      />
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 241]">
      <q-btn
        round
        color="orange"
        :icon="mark ? 'report' : 'report_off'"
        @click="toggleMark"
      />
    </q-page-sticky>
    <q-dialog v-model="dialogModelRollupError" v-if="dialogModelRollupError" color="red">
      <q-card>
        <q-card-section class="text-h6">Rollup: {{dialogMessage.code}}</q-card-section>
        <q-card-section>
          <b>{{dialogMessage.message}}</b>:
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogModelSvelteError" v-if="dialogModelSvelteError" color="orange">
      <q-card>
        <q-card-section class="text-h6">Svelte: {{dialogMessage.code}}</q-card-section>
        <q-card-section>
          Fehler in <b>{{dialogMessage.filename}}</b>:
          <br>Von Zeile {{dialogMessage.start.line}} bis {{dialogMessage.end.line}}
          <br><pre>{{dialogMessage.frame}}</pre>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { join } from 'path'
let webview

export default {
  name: 'Dokument',
  watch: {
    $route (to, from) {
      this.runRollup()
      this.updateComponent()
    },
    schueler () {
      webview.send('setData', this.componentArgs)
    },
    message () {
      console.log(this.message)
      if (this.message.frame) {
        this.dialogModelSvelteError = true
      } else {
        this.dialogModelRollupError = true
      }
      this.dialogMessage = this.message
    }
  },
  data () {
    return {
      preload: join('file:///', __statics, '/preload.js'),
      edit: false,
      editColor: 'red',
      devTools: false,
      devToolsColor: 'red',
      mark: true,
      dialogModelRollupError: false,
      dialogModelSvelteError: false,
      dialogMessage: null,
      configData: this.$store.state.data.configData
    }
  },
  computed: {
    schueler () { return this.$store.state.data.klasse },
    message () { return this.$store.state.data.message },
    componentArgs () { return this.$store.getters['data/reportData'] }
  },
  mounted () {
    webview = document.querySelector('webview')
    webview.addEventListener('console-message', (e) => {
      console.log('Guest page logged a message:', e.message)
    })
    const loadPage = () => {
      this.updateComponent()
      webview.removeEventListener('dom-ready', loadPage)
    }
    webview.addEventListener('dom-ready', loadPage)
    webview.addEventListener('ipc-message', (event) => {
      this.runRollup()
    })
  },
  methods: {
    showDataInConsole () { webview.send('showDataInConsole', this.shorterReportData()) },
    shorterReportData () { const { knexConfig, componentsPath, ...rest } = this.componentArgs; return rest },
    runRollup () { webview.send('runRollup', { file: join(this.$route.params.repo, this.$route.params.id), componentArgs: this.componentArgs, debug: this.configData.debug }) },
    setAbschnitt (a) {
      this.aktHalbjahr = { jahr: a.Jahr, abschnitt: a.Abschnitt }
      webview.send('setAbschnitt', this.aktHalbjahr)
      this.$store.commit('data/updateAbschnitt', this.aktHalbjahr)
    },
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
    toggleMark () {
      this.mark = !this.mark
      webview.send('setMark', this.mark)
    },
    updateComponent () {
      webview.loadURL(
        `data:text/html;charset=utf-8;base64,
        PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9InV0Zi04
        Ij48c3R5bGU+QG1lZGlhIHByaW50IHsubm9wcmludCAqIHtkaXNwbGF5Om5vbmU7aGVpZ2h0OjA7
        fX08L3N0eWxlPjwvaGVhZD48Ym9keT48c2NyaXB0PmlwYygpPC9zY3JpcHQ+PGRpdiBpZD0iY29u
        dGVudCIgY29udGVudGVkaXRhYmxlPSJmYWxzZSI+PHN2ZWx0ZT48L3N2ZWx0ZT48L2Rpdj48L2Jv
        ZHk+PC9odG1sPg==
        `
        , { baseURLForDataURL: `file://${this.configData.reports}/${this.$route.params.repo}/` })
    }
  }
}

</script>

<style>
  webview {
    height: -webkit-fill-available;
  }
</style>
