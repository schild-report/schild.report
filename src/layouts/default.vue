<template>
  <q-layout view="hHh LpR lFf">
    <q-layout-header>
      <q-toolbar color="primary">
        <q-btn flat @click="goto('/')"><q-icon name="home" class="q-px-md"/>{{schule.Bezeichnung2}}</q-btn>
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

    <q-layout-drawer
      v-model="dokumentenauswahlZeigen"
      content-class="bg-grey-2"
    >
      <template v-if="dokumentenauswahlZeigen">
        <div class="q-pa-md"><b>Dokumentenauswahl
          <div class="float-right" @click="$ipcRenderer.send('pullDokumente')" :style="{ cursor: 'pointer' }"><q-icon name="refresh" /></div></b>
        </div>

        <q-list
          no-border
          link
          dense
          inset-delimiter
          v-for="(dokumente, repo) in repos"
          :key="repo"
        >
          <q-list-header style="line-height: 1.15em">{{repo}}</q-list-header>
            <q-item @click.native="openDokument(dokument[0])" v-for="dokument in dokumente" :key="dokument[0]">
              {{ dokument[1].bez || dokument[0].split('___')[1] }}
            </q-item>
        </q-list>
      </template>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
      <q-page-sticky position="top-right" :offset="[18, 18]" v-if="dokumentenauswahlZeigen">
        <q-btn
          round
          color="red"
          @click="opened = true"
        ><b>{ }</b></q-btn>
      </q-page-sticky>
      <q-modal
        v-model="opened"
        content-css="padding: 30px"
        >
        <div v-json-content="reportData()" v-if="opened"></div>
      </q-modal>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import _ from 'lodash'
import * as fs from 'fs'
import VueJsonContent from 'vue-json-content'
import Vue from 'vue'

Vue.use(VueJsonContent)

const ipcRenderer = require('electron').ipcRenderer
const app = require('electron').remote.require('electron').app
const sortierfolge = [2, 6, 3, 8, 9, 0, 1]

function statusFeedback (status) {
  switch (status) {
    case 0: return {color: 'blue', icon: 'person_add'}
    case 1: return {color: 'light', icon: 'hourglass_full'}
    case 2: return {color: 'green', icon: 'done'}
    case 3: return {color: 'teal', icon: 'pause'}
    case 6: return {color: 'info', icon: 'swap_horiz'}
    case 8: return {color: 'warning', icon: 'done_all'}
    case 9: return {color: 'negative', icon: 'clear'}
    default: return {color: '', icon: ''}
  }
}

export default {
  name: 'LayoutDefault',
  created () {
    this.$root.$on('setzeKlassenLinks', states => {
      this.schuelerLink = states.schuelerLink
    })
    ipcRenderer.on('recompile', (event, arg) => {
      this.$store.dispatch('data/updateComponents', this.componentsPath)
    })
  },
  data () {
    return {
      terms: '',
      schuelerLink: null,
      pdfLink: null,
      opened: false
    }
  },
  computed: {
    components () { return this.$store.state.data.components },
    componentsPath () { return this.$store.state.data.componentsPath },
    klasse () { return this.$store.state.data.klasse },
    schueler () { return this.klasse[0] },
    schule () { return this.$store.state.data.schule || '' },
    pdfLinkZeigen () { return ['dokument'].includes(this.$route.name) },
    dokumentenauswahlZeigen () { return ['dokument', 'klasse', 'schueler'].includes(this.$route.name) },
    zurueckZu () {
      return this.schueler
        ? `Zurück zu ${this.schueler.Vorname} ${this.schueler.Name}, ${this.schueler.Klasse}`
        : `Zurück zur ${this.klasse.Klasse}`
    },
    repos () {
      return _(this.components)
        .toPairs()
        .groupBy(c => c[0].split('___')[0])
        .value()
    }
  },
  methods: {
    openURL,
    reportData () {
      return this.$store.getters['data/reportData']
    },
    search (terms, done) {
      this.$schild.suche(terms).then((response) => {
        let completions = _
          .sortBy(response, e => sortierfolge.indexOf(e.status))
          .map(d => {
            var status = statusFeedback(d.status)
            return {
              label: d.value,
              searchlink: (status.icon ? '/schueler/' : '/klasse/') + d.id,
              icon: status.icon || 'group',
              stamp: String(d.jahr || ''),
              leftColor: status.color
            }
          })
        done(completions)
      },
      (error) => {
        // Toast.create('Es gab einen Fehler bei der Suchanfrage (' + error + '/')
        console.log(error)
        done([])
      })
    },
    selected (item) { this.goto(item.searchlink) },
    goto (dest) { this.$router.push(dest) },
    openDokument (key) { this.$router.push('/dokument/' + key) },
    pdfName () {
      const s = this.schueler
      const d = this.$route.params.id.split('___')[1]
      // if (this.schuelerGewaehlt.length > 1) {
      return `${s.AktSchuljahr}_${s.AktAbschnitt}_${s.Klasse}_${d}.pdf`
      // } else {
      //   return `${s.AktSchuljahr}_${s.AktAbschnitt}_${s.Klasse}_${s.Name}_${d}.pdf`
      // }
    },
    openPdf (options = {}) {
      const webview = document.querySelector('webview')
      options = {
        // pageSize: options.pageSize || 'A4',
        // landscape: options.landscape || false,
        marginsType: options.marginsType || 1,
        printBackground: options.printBackground || true,
        pdfName: this.pdfName
      }
      webview.printToPDF({ ...options }, (error, data) => {
        if (error) throw error
        fs.writeFile(`${app.getPath('userData')}/print.pdf`, data, error => {
          if (error) throw error
        })
        ipcRenderer.send('view-pdf')
      })
    }
  }
}
</script>
