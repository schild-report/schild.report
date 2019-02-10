<template>
  <q-layout view="hHh LpR lFf">
    <q-header>
      <q-toolbar color="primary">
          <q-item dark><q-item-section>
            <q-item-label caption>{{schule.Bezeichnung1}}</q-item-label>
            <q-item-label caption>{{schule.Bezeichnung2}}</q-item-label>
          </q-item-section></q-item>
        <q-select
          use-input
          color="white"
          dark
          dense
          v-model="terms"
          dropdown-icon=""
          input-debounce="0"
          label="Name oder Klasse eingeben"
          :options="options"
          @filter="search"
          @input="selected"
          style="width: 450px"
        >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
            >
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" :color="scope.opt.color"/>
              </q-item-section>
              <q-item-section>
                <q-item-label v-html="scope.opt.label" />
                <q-item-label caption v-if="scope.opt.caption">{{scope.opt.caption}}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-btn class="q-mx-sm" @click="goto(schuelerLink)" color="white" text-color="black" unelevated v-if="['dokument'].includes($route.name)">{{zurueckZu}}</q-btn>
        <q-btn @click="openPdf" unelevated vert v-if="'dokument' === $route.name" color="red">PDF erstellen</q-btn>
        <q-space/>
        <q-btn flat @click="$router.go(-1)" v-if="$route.name === 'einstellungen'" icon="arrow_back"></q-btn>
        <q-btn flat @click="goto('/app/einstellungen')" v-if="$route.name !== 'einstellungen'" icon="settings"></q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer :value="dokumentenauswahlZeigen" content-class="bg-grey-2">
      <div class="q-pa-md" v-if="Object.keys(repos).length === 0">
        <b>Fügen Sie Ihrem Reportordner Reports hinzu, um Dokumente erstellen zu können.</b>
        <br>Dazu können Sie z.B. den Demo-Ordner verwenden, der sich hier: https://github.com/schild-report/demo befindet.
      </div>
      <q-list
        no-border
        link
        dense
        inset-delimiter
        v-for="(dokumente, repo) in repos"
        :key="repo"
      >
         <q-item-label header>{{repo}}</q-item-label>
          <q-item
            :active="repo === $route.params.repo && dokument === $route.params.id"
            :to="`/dokument/${repo}/${dokument}`"
            v-for="(dokument) in dokumente" :key="dokument"
          >
            <q-item-section>{{dokument.slice(0, -5)}}</q-item-section>
          </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { writeFile, existsSync, mkdirSync } from 'fs'
import { parse, join, dirname } from 'path'
import { shell, remote } from 'electron'
import Mousetrap from 'mousetrap'

const ipc = require('electron-better-ipc')
const sortierfolge = [1, 0, 9, 8, 3, 6, 2]

function statusFeedback (status) {
  switch (status) {
    case 0: return { color: 'blue', icon: 'person_add' }
    case 1: return { color: 'light', icon: 'hourglass_full' }
    case 2: return { color: 'green', icon: 'done' }
    case 3: return { color: 'teal', icon: 'pause' }
    case 6: return { color: 'info', icon: 'swap_horiz' }
    case 8: return { color: 'warning', icon: 'done_all' }
    case 9: return { color: 'negative', icon: 'clear' }
    default: return { color: '', icon: '' }
  }
}

function ensureDirectoryExistence (filePath) {
  const dir = dirname(filePath)
  if (existsSync(dir)) {
    return true
  }
  ensureDirectoryExistence(dir)
  mkdirSync(dir)
}

export default {
  name: 'Layout',
  created () {
    this.$root.$on('sucheSchueler', states => {
      this.updateDaten(states)
    })
  },
  mounted () {
    Mousetrap.bind(['command+d', 'ctrl+d'], () => {
      const { knexConfig, componentsPath, ...rest } = this.reportData
      remote.clipboard.writeText(JSON.stringify(rest))
      console.log('Daten in die Zwischenablage kopiert.')
      return false
    })
  },
  data () {
    return {
      terms: null,
      pdfLink: null,
      error: null,
      configData: this.$store.state.data.configData,
      reportData: this.$store.getters['data/reportData'],
      options: []
    }
  },
  computed: {
    klasse () { return this.$store.state.data.klasse },
    repos () { return this.$store.state.data.repos || {} },
    schueler () { return this.klasse[0] },
    schule () { return this.$store.state.data.schule || '' },
    dokumentenauswahlZeigen () { return ['dokument', 'klasse', 'schueler'].includes(this.$route.name) },
    zurueckZu () {
      return this.schueler
        ? `Zurück zu ${this.schueler.Vorname} ${this.schueler.Name}, ${this.schueler.Klasse}`
        : `Zurück zur ${this.klasse.Klasse}`
    },
    schuelerLink () { return this.schueler ? '/schueler' : '/klasse' }
  },
  methods: {
    search (terms, update, abort) {
      if (terms.length < 2) {
        abort()
        return
      }
      if (terms === '') {
        update(() => {
          this.options = []
        })
        return
      }
      update(() => {
        ipc.callMain('schildSuche', { arg: terms })
          .then(response => {
            const completions = response
              .map(d => {
                const status = statusFeedback(d.status)
                return {
                  label: d.value,
                  searchlink: { klasse: (!status.icon), id: d.id },
                  icon: status.icon || 'group',
                  caption: d.jahr ? String(d.jahr) : null,
                  color: status.color,
                  status: d.status
                }
              })
              .sort((a, b) => (sortierfolge.indexOf(a.status) || a.label) < (sortierfolge.indexOf(b.status) || b.label) ? 1 : -1)
            this.options = completions
          })
      })
    },
    selected (item) { this.updateDaten(item.searchlink) },
    updateDaten (o) {
      this.terms = null
      this.options = []
      o.klasse ? this.updateKlasse(o.id) : this.updateSchueler(o.id)
      if (!['dokument'].includes(this.$route.name)) this.$router.push(o.klasse ? '/klasse' : '/schueler')
    },
    updateSchueler (id) {
      if (this.schueler && id === this.schueler.ID) return
      this.getSchueler(id)
      this.getSchuelerfoto(id)
      this.$store.commit('data/updateSelected', [])
      this.$store.commit('data/updateKlasseSortiert', null)
    },
    getSchueler (id) {
      this.error = null
      ipc.callMain('schildGetSchueler', { arg: id })
        .then(response => {
          this.$store.commit('data/updateKlasse', [response])
          this.$store.commit('data/updateSchuelerGewaehlt', [response])
        })
        .catch(error => {
          this.error = error.toString()
        })
    },
    getSchuelerfoto (id) {
      ipc.callMain('schildGetSchuelerfoto', { arg: id })
        .then(response => {
          this.$store.commit('data/updateSchuelerfoto', response)
        })
        .catch((error) => {
          this.$store.commit('data/updateSchuelerfoto', '')
          this.error = error.toString()
        })
    },
    updateKlasse (id) {
      if (this.klasse && id === this.klasse.Klasse) return
      this.$store.commit('data/updateSelected', [])
      this.error = null
      ipc.callMain('schildGetKlasse', { arg: id })
        .then((response) => {
          const klasse = response
          const inaktiv = [], aktiv = [], fertig = [], neu = []
          klasse.schueler.forEach((s) => {
            if (s.Status === 2 && s.Geloescht === '-' && s.Gesperrt === '-') aktiv.push(s)
            else if (s.Status === 8 && s.Geloescht === '-' && s.Gesperrt === '-') fertig.push(s)
            else if (s.Status === 0 && s.Geloescht === '-' && s.Gesperrt === '-') neu.push(s)
            else inaktiv.push(s)
          })
          // const gruppen = [inaktiv, aktiv, fertig, neu]
          // gruppen.forEach(e => _(e).sortBy(s => s.Vorname).sortBy(s => s.Name))
          this.$store.commit('data/updateKlasseSortiert', {
            '2': { titel: 'Aktive Schüler', schueler: aktiv, status: 'positive' },
            '8': { titel: 'Ausbildung beendet', schueler: fertig, status: 'positive' },
            '0': { titel: 'Neue Schüler', schueler: neu, status: 'blue' },
            'x': { titel: 'Inaktive Schüler', schueler: inaktiv, status: 'negative' }
          })
          this.$store.commit('data/updateKlasse', klasse)
          let selection
          if (aktiv.length > 0) selection = aktiv
          else if (fertig.length > 0) selection = fertig
          else if (neu.length > 0) selection = neu
          else selection = klasse.schueler
          this.$store.commit('data/updateSchuelerGewaehlt', selection)
        })
        .catch((error) => {
          this.error = error.toString()
        })
    },
    goto (dest) { this.$router.push(dest) },
    openPdf (options = {}) {
      console.log('öffne PDF')
      const webview = document.querySelector('webview')
      const s = this.schueler || this.klasse.schueler[0]
      const schuelerName = this.schueler ? `${this.schueler.Name}_` : ''
      const d = parse(this.$route.params.id).name
      const jahr = this.$store.state.data.abschnitt.jahr || s.AktSchuljahr
      const abschnitt = this.$store.state.data.abschnitt.abschnitt || s.AktAbschnitt
      const pdfName = `${jahr}_${abschnitt}_${s.Klasse}_${schuelerName}${d}.pdf`
      const pdfPath = join(this.configData.pdf, jahr.toString(), pdfName)
      options = {
        marginsType: options.marginsType || 1,
        printBackground: options.printBackground || true
      }
      webview.printToPDF({ ...options }, (error, data) => {
        if (error) throw error
        ensureDirectoryExistence(pdfPath)
        writeFile(pdfPath, data, error => {
          if (error) throw error
        })
        shell.openItem(pdfPath)
      })
    }
  }
}
</script>
