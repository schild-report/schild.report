<template>
  <q-layout view="hHh LpR lFf">
    <q-header>
      <q-toolbar color="primary">
          <q-item dark><q-item-section>
            <q-item-label caption><b>{{schule.Bezeichnung1}}</b></q-item-label>
            <q-item-label caption>{{schule.Bezeichnung2}}</q-item-label>
          </q-item-section></q-item>
        <q-select
          use-input
          color="white"
          dark
          dense
          v-model="terms"
          hide-dropdown-icon
          autofocus
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
        <template v-if="schueler.length > 0 && $route.name === 'dokument'">
          <q-btn class="q-mx-sm" @click="$router.push(klasse.Klasse ? '/klasse' : '/schueler')" color="white" text-color="black" unelevated>{{zurueckZu}}</q-btn>
          <q-btn @click="openPdf" unelevated vert color="red">PDF erstellen</q-btn>
        </template>
        <q-space/>
        <q-btn flat @click="$route.name === 'einstellungen' ? $router.go(-1) : $router.push('/app/einstellungen')" :icon="$route.name === 'einstellungen' ? 'arrow_back' : 'settings'"></q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer :value="['dokument', 'klasse', 'schueler'].includes($route.name)" content-class="bg-grey-2">
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
    Mousetrap.bind(['e'], () => {
      ipc.callMain('openEditor')
      return false
    })
    Mousetrap.bind(['command+d', 'ctrl+d'], () => {
      remote.clipboard.writeText(JSON.stringify(this.schueler))
      console.log('Daten in die Zwischenablage kopiert.')
      return false
    })
  },
  data () {
    return {
      terms: null,
      options: [],
      // pdfpath
      configData: this.$store.state.data.configData
    }
  },
  computed: {
    klasse () { return this.$store.state.data.klasse },
    schueler () { return this.$store.state.data.schueler },
    repos () { return this.$store.state.data.repos },
    schule () { return this.$store.state.data.schule },
    svelteProps () { return this.$store.getters['data/reportData'] },
    zurueckZu () {
      return this.klasse.Klasse
        ? `Zurück zur ${this.klasse.Klasse}`
        : `Zurück zu ${this.schueler[0].Vorname} ${this.schueler[0].Name} ${this.schueler[0].Klasse || ''}`
    }
  },
  methods: {
    search (terms, update, abort) {
      if (terms === '') {
        update(() => {
          this.options = []
        })
        return
      }
      update(async () => {
        const response = await ipc.callMain('schildSuche', { arg: terms })
        this.options = response
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
      })
    },
    selected (item) { this.updateDaten(item.searchlink) },
    updateDaten (o) {
      this.terms = null
      this.options = []
      this.$store.commit('data/updateSelected', [])
      this.$store.commit('data/updateAbschnitt', {})
      o.klasse ? this.updateKlasse(o.id) : this.updateSchueler(o.id)
      if (this.$route.name !== 'dokument') this.$router.push(o.klasse ? '/klasse' : '/schueler')
    },
    async updateSchueler (id) {
      this.$store.commit('data/updateKlasse', {})
      const schueler = await ipc.callMain('schildGetSchueler', id)
      this.$store.commit('data/updateSchueler', [schueler])
      if (this.$route.name !== 'dokument') this.updateSchuelerfoto(id)
    },
    async updateSchuelerfoto (id) {
      let schuelerfoto
      try {
        schuelerfoto = await ipc.callMain('schildGetSchuelerfoto', id)
      } catch (error) {
        console.log(error)
        schuelerfoto = ''
      }
      this.$store.commit('data/updateSchuelerfoto', schuelerfoto)
    },
    async updateKlasse (id) {
      const klasse = await ipc.callMain('schildGetKlasse', id)
      this.$store.commit('data/updateKlasse', klasse)
      this.$store.commit('data/updateSchueler', klasse.schueler)
    },
    openPdf (options = {}) {
      console.log('öffne PDF')
      const webview = document.querySelector('webview')
      const s = this.schueler[0]
      const schuelerName = this.schueler.length === 1 ? `${s.Name}_` : ''
      const d = parse(this.$route.params.id).name
      const jahr = this.svelteProps.jahr
      const abschnitt = this.svelteProps.abschnitt
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
