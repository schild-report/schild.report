<template>
  <q-page padding>
    <div v-if="klasse" class="content">
      <div class="row">
        <div class="col">
          <div class="q-display-1">{{klasse.Klasse}}, <span v-if="klasse.fachklasse">{{klasse.fachklasse.Bezeichnung || ''}}</span></div>
        </div>
        <div class="col" v-if="klasse.jahrgang">
          <div class="q-title">{{klasse.jahrgang.ASDBezeichnung}}</div>
          <div class="q-subheading">{{klasse.KlassenlehrerKrz}}</div>
        </div>
      </div>
      <div v-for="(tabelle, index) in klasseSortiert" :key="index">
        <div v-if="tabelle.schueler.length > 0">
          <h5 :class="'text-'+tabelle.status"></h5>
          <q-table
            :title="tabelle.titel"
            :data="tabelle.schueler"
            :columns="columns"
            :pagination.sync="pagination"
            row-key="ID"
            dense
            hide-bottom
            selection="multiple"
            :selected.sync="selected"
            >
            <q-tr slot="body" slot-scope="props" :props="props" @click.native="rowClick(props.row)" class="cursor-pointer">
              <q-td auto-width>
                <q-checkbox color="primary" v-model="props.selected" />
              </q-td>
              <q-td v-for="col in props.cols" :key="col.name" :props="props">
                <div v-if="['Name', 'Vorname', 'Telefon'].some(c => c === col.name)">{{col.value}}</div>
                <div v-if="col.name === 'Index'">
                  {{props.row.__index+1}}
                </div>
                <div v-if="col.name === 'Adresse'">
                  {{props.row.Strasse}}, {{props.row.PLZ}} {{props.row.OrtAbk}}
                </div>
                <div v-if="col.name === 'Geburtstag'">
                  {{new Date(props.row.Geburtsdatum).toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric'})}} <q-icon name="label" :class="props.row.volljaehrig ? 'text-positive' : 'text-negative'"/>
                </div>
                <div v-if="col.name === 'Info'">
                  <div v-if="props.row.vermerke.length > 0">
                    <q-icon name="info">
                      <q-tooltip>
                        <div v-for="(v, index) in props.row.vermerke" :key="index">
                          {{index+1}}: {{v.Bemerkung}} ({{new Date(v.Datum).toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric'})}} | {{v.GeaendertVon||v.AngelegtVon}})
                        </div>
                      </q-tooltip>
                    </q-icon>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </q-table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
const ipc = require('electron-better-ipc')

export default {
  name: 'Klasse',
  data () {
    return {
      error: null,
      selected: this.$store.state.data.selected,
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 100
      },
      columns: [
        { name: 'Index', field: 'Index', label: '', align: 'left' },
        { name: 'Name', field: 'Name', label: 'Name', align: 'left' },
        { name: 'Vorname', field: 'Vorname', label: 'Vorname', align: 'left' },
        { name: 'Adresse', field: 'adresse', label: 'Adresse', align: 'left' },
        { name: 'Telefon', field: 'Telefon', label: 'Telefon', align: 'left' },
        { name: 'Geburtstag', field: 'geburtstag', label: 'Geburtstag', align: 'left' },
        { name: 'Info', field: 'Info', label: 'Info', align: 'left' }
      ]
    }
  },
  computed: {
    klasse () { return this.$store.state.data.klasse },
    klasseSortiert () { return this.$store.state.data.klasseSortiert }
  },
  created () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.updateKlasse()
  },
  watch: {
    // call again the method if the route changes
    '$route': 'updateKlasse',
    selected: 'updateSelected'
  },
  methods: {
    updateKlasse () {
      if (this.klasse && this.$route.params.id === this.klasse.Klasse) return
      this.$q.loading.show()
      this.selected = []
      this.error = null
      ipc.callMain('schildGetKlasse', { arg: this.$route.params.id })
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
          else if (fertig > 0) selection = fertig
          else selection = klasse
          this.$store.commit('data/updateSchuelerGewaehlt', selection)

          this.$q.loading.hide()
        })
        .catch((error) => {
          this.error = error.toString()
          this.$q.loading.hide()
        })

      this.$root.$emit('setzeKlassenLinks', {
        schuelerLink: this.$route.path
      })
    },
    updateSelected () {
      this.$store.commit('data/updateSelected', this.selected)
      this.$store.commit('data/updateSchuelerGewaehlt', this.selected)
    },
    rowClick (row) {
      this.$router.push('/schueler/' + row.ID)
    }
  }
}
</script>
