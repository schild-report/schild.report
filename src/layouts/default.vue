<template>
  <q-layout view="hHh LpR lFf">
    <q-layout-header>
      <q-toolbar color="primary">
        <q-btn
          flat round dense
          icon="home"
          @click="goto('/')"
        />
        <q-toolbar-title shrink>
          {{schule.Bezeichnung1}}
          <span slot="subtitle">
            {{schule.Bezeichnung2}}
          </span>
        </q-toolbar-title>
        <q-search
          v-model="terms"
          placeholder="Name oder Klasse eingeben"
          align="left"
          color="none"
          autofocus
          inverted
          class="col-3"
          >
          <q-autocomplete
            @search="search"
            @selected="selected"
            :max-results="30"
          />
        </q-search>
        <q-btn @click="goto(schuelerLink)" dark v-if="pdfLinkZeigen">{{zurueckZu}}</q-btn>
        <q-btn @click="openPdf" inverted v-if="pdfLinkZeigen" color="red">PDF erstellen</q-btn>
        <q-toolbar-title></q-toolbar-title>
        <q-btn flat @click="goto('/app/einstellungen')" icon="settings"></q-btn>
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer v-model="dokumentenauswahlZeigen" content-class="bg-grey-2">
      <template v-if="dokumentenauswahlZeigen">
        <div class="q-pa-md"><b>Dokumentenauswahl</b></div>
        <q-list
          no-border
          link
          dense
          inset-delimiter
          v-for="(dokumente, repo) in repos"
          :key="repo"
        >
          <q-list-header style="line-height: 1.15em">{{repo}}</q-list-header>
            <q-item
              :class="repo === $route.params.repo && dokument === $route.params.id ? 'bg-light':''"
              @click.native="goto(`/dokument/${repo}/${dokument}`)"
              v-for="(dokument) in dokumente" :key="dokument"
            >
              {{ dokument.slice(0, -5) }}
            </q-item>
        </q-list>
      </template>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-page-sticky position="top-right" :offset="[18, 85]" v-if="dokumentenauswahlZeigen">
      <q-btn round color="red" @click="opened = true"><b>{ }</b></q-btn>
    </q-page-sticky>
    <q-modal v-model="opened" content-css="padding: 30px">
      <div v-json-content="reportData" v-if="opened"></div>
    </q-modal>
  </q-layout>
</template>

<script>
import _ from 'lodash'
import { writeFile, existsSync, mkdirSync } from 'fs'
import { parse, join, dirname } from 'path'
import VueJsonContent from 'vue-json-content'
import Vue from 'vue'
import { shell } from 'electron'

Vue.use(VueJsonContent)

const ipc = require('electron-better-ipc')
const { api } = require('electron-util')
const sortierfolge = [2, 6, 3, 8, 9, 0, 1]

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
    ipc.callMain('repos')
  },
  data () {
    return {
      terms: '',
      pdfLink: null,
      opened: false,
      error: null,
      reportData: this.$store.getters['data/reportData']
    }
  },
  computed: {
    klasse () { return this.$store.state.data.klasse },
    repos () { return this.$store.state.data.repos },
    schueler () { return this.klasse[0] },
    schule () { return this.$store.state.data.schule || '' },
    pdfLinkZeigen () { return ['dokument'].includes(this.$route.name) },
    dokumentenauswahlZeigen () { return ['dokument', 'klasse', 'schueler'].includes(this.$route.name) },
    zurueckZu () {
      return this.schueler
        ? `Zurück zu ${this.schueler.Vorname} ${this.schueler.Name}, ${this.schueler.Klasse}`
        : `Zurück zur ${this.klasse.Klasse}`
    },
    schuelerLink () { return this.schueler ? '/schueler' : '/klasse' }
  },
  methods: {
    search (terms, done) {
      ipc.callMain('schildSuche', { arg: terms })
        .then(response => {
          let completions = _
            .sortBy(response, e => sortierfolge.indexOf(e.status))
            .map(d => {
              var status = statusFeedback(d.status)
              return {
                label: d.value,
                searchlink: { klasse: (!status.icon), id: d.id },
                icon: status.icon || 'group',
                stamp: String(d.jahr || ''),
                leftColor: status.color
              }
            })
          done(completions)
        },
        (error) => {
          console.log(error)
          done([])
        })
    },
    selected (item, keyboard) { if (!keyboard) this.updateDaten(item.searchlink) },
    updateDaten (o) {
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
      const d = parse(this.$route.params.id).name
      const jahr = this.$store.state.data.abschnitt.jahr || s.AktSchuljahr
      const abschnitt = this.$store.state.data.abschnitt.abschnitt || s.AktAbschnitt
      const dir = join(api.app.getPath('documents'), api.app.getName(), 'pdf', jahr.toString())
      const pdfName = `${jahr}_${abschnitt}_${s.Klasse}_${d}.pdf`
      const pdfPath = join(dir, pdfName)
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
