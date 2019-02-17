<template>
  <div>
    <webview src="about:blank" :preload="preload"></webview>
    <q-page-sticky position="top-right" :offset="[18, 18]" v-if="schuelerGewaehlt.length > 0">
      <q-fab
        ref="abschnitte"
        round
        color="blue"
        icon="date_range"
        direction="left"
      >
        <q-fab-action v-for="(a, index) in schuelerGewaehlt[0].abschnitte" :key="index"
          :color="svelteProps.jahr === a.Jahr && svelteProps.abschnitt === a.Abschnitt ? 'green' : 'primary'"
          icon=""
          @click="setAbschnitt(a)"
        >{{a.Jahr-2000}}/{{a.Abschnitt}}</q-fab-action>
      </q-fab>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 85]">
      <q-btn round color="red" @click="showDataInConsole()"><q-tooltip>Schülerdaten in der Konsole ausgeben</q-tooltip><b>{ }</b></q-btn>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 137]">
      <q-btn
        round
        contenteditable="false"
        :color="editColor"
        icon="create"
        @click="editContent"
      />
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 189]">
      <q-btn
        round
        :color="devToolsColor"
        icon="build"
        @click="toggleDevTools"
      />
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 241]">
      <q-btn
        round
        color="orange"
        :icon="mark ? 'report' : 'report_off'"
        @click="toggleMark"
      />
    </q-page-sticky>
    <q-dialog v-model="dialogError" bottom>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="text-h6">{{message.message}}</q-card-section>
        <q-card-section v-if="message.filename">
          Fehler in <b>{{message.filename}}</b>
          <br>Von Zeile {{message.start.line}} bis {{message.end.line}}
          <br><pre>{{message.frame}}</pre>
        </q-card-section>
        <q-card-section>
          <pre>{{message.stack}}</pre>
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
    $route (to, from) { this.createSvelteEnv() },
    klasseSortiert () { webview.send('setSvelteProps', this.svelteProps) },
    message () { this.dialogError = true }
  },
  data () {
    return {
      preload: join('file:///', __statics, '/preload.js'),
      edit: false,
      editColor: 'red',
      devToolsColor: 'red',
      mark: true,
      dialogError: false,
      configData: this.$store.state.data.configData
    }
  },
  computed: {
    klasseSortiert () { return this.$store.getters['data/klasseSortiert'] },
    schuelerGewaehlt () { return this.$store.getters['data/schuelerGewaehlt'] },
    message () { return this.$store.state.data.message },
    svelteProps () { return this.$store.getters['data/reportData'] }
  },
  mounted () {
    webview = document.querySelector('webview')
    const loadPage = () => {
      this.createSvelteEnv()
      webview.removeEventListener('dom-ready', loadPage)
    }
    webview.addEventListener('dom-ready', loadPage)
    webview.addEventListener('console-message', (e) => {
      console.log('%cSvelte:', 'color: blue', e.message)
    })
    webview.addEventListener('devtools-opened', () => { this.devToolsColor = 'green' })
    webview.addEventListener('devtools-closed', () => { this.devToolsColor = 'red' })
    webview.addEventListener('ipc-message', (event) => {
      switch (event.channel) {
        case 'buildSvelte': this.buildSvelte(); break
        case 'clearDialog': this.dialogError = false; break
        case 'errorMessage': this.$store.commit('data/updateMessage', event.args[0]); console.log(event.args[0])
      }
    })
  },
  methods: {
    showDataInConsole () {
      webview.openDevTools()
      webview.send('showDataInConsole', this.shorterReportData())
    },
    shorterReportData () { const { knexConfig, ...rest } = this.svelteProps; return rest },
    buildSvelte () {
      this.dialogError = false
      webview.send('buildSvelte', {
        file: join(this.$route.params.repo, this.$route.params.id),
        componentPath: this.configData.userData + '/bundle.js',
        svelteProps: this.svelteProps,
        debug: this.configData.debug
      })
    },
    setAbschnitt (a) {
      this.aktHalbjahr = { jahr: a.Jahr, abschnitt: a.Abschnitt }
      webview.send('setSveltePropsAbschnitt', this.aktHalbjahr)
      this.$store.commit('data/updateAbschnitt', this.aktHalbjahr)
    },
    editContent () {
      this.edit = !this.edit
      this.editColor = this.edit ? 'green' : 'red'
      webview.send('editContent', this.edit)
    },
    toggleDevTools () {
      const is = webview.isDevToolsOpened()
      is ? webview.closeDevTools() : webview.openDevTools()
    },
    toggleMark () {
      this.mark = !this.mark
      webview.send('setMark', this.mark)
    },
    createSvelteEnv () {
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
  webview { height: -webkit-fill-available; }
</style>
