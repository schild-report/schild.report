<template>
  <div>
    <webview src="statics/webview.html" :preload="preload" autosize></webview>
    <q-page-sticky position="top-right" :offset="[18, 18]">
      <q-btn
        round
        contenteditable="false"
        :color="editColor"
        icon="create"
        @click="editContent"
      />
    </q-page-sticky>
  </div>
</template>

<script>
import path from 'path'

export default {
  name: 'Dokument',
  watch: {
    components () {
      this.initiateSvelte()
      this.createSvelte()
    },
    $route (to, from) {
      this.createSvelte()
    }
  },
  data () {
    return {
      preload: 'file://' + path.join(__statics, '/preload.js'),
      webview: null,
      schuelerGewaehlt: null,
      jahr: null,
      abschnitt: null,
      edit: false
    }
  },
  computed: {
    klasse () { return this.$store.state.data.klasse },
    klasseSortiert () { return this.$store.state.data.klasseSortiert },
    selected () { return this.$store.state.data.selected },
    schule () { return this.$store.state.data.schule },
    editColor () {
      return this.edit ? 'green' : 'red'
    },
    componentName () {
      return this.components[this.$route.params.id].bez
    },
    pdfName () {
      const s = this.schuelerGewaehlt[0]
      const d = this.$route.params.id.split('___')[1]
      if (this.schuelerGewaehlt.length > 1) {
        return `${s.AktSchuljahr}_${s.AktAbschnitt}_${s.Klasse}_${d}.pdf`
      } else {
        return `${s.AktSchuljahr}_${s.AktAbschnitt}_${s.Klasse}_${s.Name}_${d}.pdf`
      }
    },
    components () { return this.$store.state.data.components }
  },
  mounted () {
    this.webview = document.querySelector('webview')
    if (this.selected.length > 0) {
      this.jahr = this.selected[0].AktSchuljahr
      this.abschnitt = this.selected[0].AktAbschnitt
      this.schuelerGewaehlt = this.selected
    } else if (!this.klasseSortiert) {
      const schueler = this.klasse
      this.jahr = schueler[0].AktSchuljahr
      this.abschnitt = schueler[0].AktAbschnitt
      this.schuelerGewaehlt = schueler
    } else if (this.klasseSortiert['2'].schueler.length === 0) {
      const schueler = this.klasseSortiert['8'].schueler
      this.jahr = schueler[0].AktSchuljahr
      this.abschnitt = schueler[0].AktAbschnitt
      this.schuelerGewaehlt = schueler
    } else {
      this.jahr = this.schule.Schuljahr
      this.abschnitt = this.schule.SchuljahrAbschnitt
      this.schuelerGewaehlt = this.klasseSortiert['2'].schueler
    }
    this.webview.addEventListener('dom-ready', () => {
      this.webview.openDevTools()
      this.initiateSvelte()
      this.createSvelte()
    })
  },
  methods: {
    editContent () {
      this.edit = !this.edit
      this.webview.send('editContent', this.edit)
    },
    initiateSvelte () {
      this.webview.send('loadComponents', {
        componentsPath: this.$store.state.data.componentsPath + '/bundle.js'
      })
    },
    reloadSvelte () {
      this.webview.reload()
    },
    createSvelte () {
      this.webview.send('updateComponents', {
        component: this.$route.params.id,
        schule: this.schule,
        klasse: this.klasse,
        schueler: this.schuelerGewaehlt,
        jahr: this.jahr,
        abschnitt: this.abschnitt,
        knex: this.$store.state.data.knex
      })
      this.$root.$emit('pdfName', this.pdfName)
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
