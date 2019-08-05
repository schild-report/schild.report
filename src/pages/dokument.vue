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
        <q-tooltip>Abschnitt auswählen</q-tooltip>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 85]">
      <q-btn round
        color="blue"
        @click="showDataInConsole()"
      ><q-tooltip>Schülerdaten in der Konsole ausgeben</q-tooltip><b>{ }</b></q-btn>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 137]">
      <q-btn
        round
        contenteditable="false"
        :color="edit ? 'blue-10' : 'blue'"
        icon="create"
        @click="editContent"
      ><q-tooltip>Bearbeitungsmodus {{edit ? 'de' : ''}}aktivieren</q-tooltip></q-btn>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 189]">
      <q-btn
        round
        :color="mark ? 'blue-10' : 'blue'"
        :icon="mark ? 'report_off' : 'report'"
        @click="toggleMark"
      ><q-tooltip>Fehlermarkierungen {{mark ? 'de' : ''}}aktivieren</q-tooltip></q-btn>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[24, 241]" v-if="comment">
      <q-btn
        round
        :color="zeigeComment ? 'blue-10' : 'blue'"
        icon="comment"
        @click="zeigeComment = !zeigeComment"
      ><q-tooltip>Report-Kommentare {{comment ? 'nicht' : ''}} anzeigen</q-tooltip></q-btn>
    </q-page-sticky>
    <q-dialog :value="zeigeComment" position="bottom" seamless>
      <q-card style="width: 700px; max-width: 80vw;" class="bg-blue-2">
        <q-card-section>
          <span v-html="markdownComment()"></span>
        </q-card-section>
      </q-card>
    </q-dialog>
    <errorDialog v-if="dialogError"></errorDialog>
  </div>
</template>

<script>
import { join } from 'path'
import snarkdown from 'snarkdown'
import errorDialog from './../components/error-dialog.vue'
let webview

export default {
  components: { errorDialog },
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
      mark: true,
      dialogError: false,
      comment: false,
      zeigeComment: false,
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
    webview.addEventListener('ipc-message', (event) => {
      switch (event.channel) {
        case 'buildSvelte': this.buildSvelte(); break
        case 'clearDialog': this.dialogError = false; break
        case 'errorMessage': this.$store.commit('data/updateMessage', event.args[0]); console.log(event.args[0]); break
        case 'svelteComment': this.comment = event.args[0]; break
      }
    })
  },
  methods: {
    markdownComment () { return snarkdown(this.comment || '') },
    showDataInConsole () {
      webview.openDevTools()
      webview.send('showDataInConsole', this.shorterReportData())
      console.log(this.configData)
    },
    shorterReportData () { const { knexConfig, ...rest } = this.svelteProps; return rest },
    buildSvelte () {
      this.dialogError = false
      this.comment = false
      webview.send('buildSvelte', {
        file: join(this.$route.params.repo, this.$route.params.id),
        componentPath: join(this.configData.userData, 'bundle.js'),
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
      webview.send('editContent', this.edit)
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
