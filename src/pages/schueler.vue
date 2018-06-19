<template>
  <q-page padding class="row">
    <div v-if="schueler" class="content">
      <div class="q-display-1">
        <router-link class="text-secondary" :style="{ textDecoration: 'none' }" color="secondary" v-bind:to="'/klasse/' + schueler.Klasse">{{schueler.Klasse}}</router-link> > {{schueler.Vorname}} {{schueler.Name}} ({{schueler.Geschlecht === 3 ? "&#x2642;" : "&#x2640;"}} {{alter}})
      </div>
      <q-card inline v-if="tabelle.length > 0">
        <q-card-title>Leistungsübersicht</q-card-title>
        <q-card-separator />
        <q-card-main>
          <q-table
              :data="tabelle"
              :columns="columns"
              row-key="name"
              :pagination.sync="pagination"
              dense
              hide-bottom
              :style="{boxShadow: 'none'}"
            >
            <q-tr slot="body" slot-scope="props" :props="props">
              <q-td v-for="(col, i) in props.cols" :key="col.name" :props="props">
                <div :class="['4-', '5+', '5', '5-', '6'].some(n => n === col.value) ? 'bg-red' : ''" :style="{display: 'inline'}">{{col.value}}</div>
                <div v-if="props.row.data && props.row.data.noten[i] && props.row.data.noten[i].Lernentw" :style="{display: 'inline'}"><q-icon name="info" class="text-primary" />
                  <q-tooltip>{{props.row.data.noten[i].Lernentw}}</q-tooltip>
                </div>
                <q-tooltip v-if="col === props.cols[0]">
                  {{props.row.data.fach.Bezeichnung}}<br>{{props.row.data.fach.Bezeichnung != props.row.data.fach.Zeugnisbez ? props.row.data.fach.Zeugnisbez : ''}}
                </q-tooltip>
              </q-td>
            </q-tr>
          </q-table>
        </q-card-main>
      </q-card>
      <q-card inline style="width: 300px">
        <q-card-title>{{schueler.AktSchuljahr}}/{{schueler.AktAbschnitt}}</q-card-title>
        <q-card-separator />
        <q-card-main>
          <img v-if="schuelerfoto" :src="schuelerfoto">
          <div v-else><i>Kein Foto vorhanden</i></div>
        </q-card-main>
        <q-card-main>
          <b>{{schueler.Vorname}} {{schueler.Name}}</b>
          <br>{{schueler.Strasse}}
          <br>{{schueler.PLZ}} {{schueler.OrtAbk}}
          <p></p>
          <br>{{schueler.Telefon}}
          <br>{{schueler.EMail}}
        </q-card-main>
      </q-card>
      <q-card inline v-if="schueler.vermerke.length > 0" style="width: 300px">
        <q-card-title>Vermerke</q-card-title>
        <q-card-separator />
        <q-card-main>
          <q-list v-for="(v, index) in schueler.vermerke" :key="index">
            <q-item>
              <q-item-main
                :label="v.Bemerkung"
                :sublabel="`${(new Date(v.Datum).toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric'}))} | ${v.GeaendertVon||v.AngelegtVon}`" />
            </q-item>
          </q-list>
        </q-card-main>
      </q-card>
      <q-card inline v-if="abschlussInfo.some(a => a)" style="width: 300px">
        <q-card-title>Abschluss</q-card-title>
        <q-card-separator />
        <q-card-main v-for="abschluss in abschlussInfo" :key="abschluss">
          <div v-if="abschluss">{{abschluss}}</div>
        </q-card-main>
      </q-card>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'Schueler',
  data () {
    return {
      error: null,
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 100
      }
    }
  },
  created () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.updateSchueler()
  },
  watch: {
    // call again the method if the route changes
    '$route': 'updateSchueler'
  },
  computed: {
    tabelle () {
      return Object.entries(this.faecher()).map(e => { return {name: e[0], ...e[1]} })
    },
    columns () {
      if (this.tabelle.length === 0) return
      let a = [
        {name: 'Fach', field: 'name', label: 'Abschnitt', align: 'left'}
      ]
      this.tabelle.find(e => e).data.noten.forEach((hj, i) => {
        a.push({
          name: this.schueler.abschnitte[i].ID,
          field: row => row.data.noten[i] ? row.data.noten[i].NotenKrz : '',
          label: `${this.schueler.abschnitte[i].Jahr}/${this.schueler.abschnitte[i].Abschnitt}`,
          align: 'center'
        })
      })
      return a
    },
    schueler () {
      return this.$store.state.data.klasse[0]
    },
    schuelerfoto () {
      const foto = this.$store.state.data.schuelerfoto
      return `data:image/jpg;base64,${foto}`
    },
    fehlstunden () {
      return ['Fehlstunden', 'unentschuldigt']
    },
    alter () {
      const geburtstag = +new Date(this.schueler.Geburtsdatum)
      return ~~((Date.now() - geburtstag) / (31557600000))
    },
    abschlussInfo () {
      const abschluesse = [this.schueler.bk_abschluss, this.schueler.fhr_abschluss, this.schueler.abi_abschluss]
      const pruefungen = ['Berufsabschlussprüfung', 'FHR-Prüfung', 'Abiturprüfung']
      return abschluesse.map((abschluss, i) => {
        if (abschluss) {
          return `${this.schueler.schueler_in} ${(abschluss.Zulassung === '+' || abschluss.Zugelassen === '+') ? '' : 'nicht'} für die ${pruefungen[i]} zugelassen`
        }
      }).filter(e => e)
    }
  },
  methods: {
    updateSchueler () {
      if (this.schueler && this.$route.params.id === this.schueler.ID) return
      this.getSchueler()
      this.getSchuelerfoto()
      this.$store.commit('data/updateSelected', [])
      this.$store.commit('data/updateKlasseSortiert', null)
      this.$root.$emit('setzeKlassenLinks', {
        schuelerLink: this.$route.path
      })
    },
    faecher () {
      let faecher = {}
      this.schueler.abschnitte.forEach((abschnitt, i) => {
        abschnitt.noten.forEach(note => {
          if (faecher[note.fach.FachKrz]) {
            faecher[note.fach.FachKrz].data.noten[i] = note
          } else {
            faecher[note.fach.FachKrz] = {data: {noten: new Array(this.schueler.abschnitte.length), fach: note.fach}}
            faecher[note.fach.FachKrz].data.noten[i] = note
          }
        })
      })
      return faecher
    },
    getSchueler () {
      this.error = null
      this.$q.loading.show()
      this.$schild.getSchueler(this.$route.params.id)
        .then((response) => {
          this.$q.loading.hide()
          this.$store.commit('data/updateKlasse', [response.toJSON()])
          this.$store.commit('data/updateSchuelerGewaehlt', [response.toJSON()])
        })
        .catch((error) => {
          this.error = error.toString()
          this.$q.loading.hide()
        })
    },
    getSchuelerfoto () {
      this.$schild.getSchuelerfoto(this.$route.params.id)
        .then((response) => {
          this.$store.commit('data/updateSchuelerfoto', response)
        })
        .catch((error) => {
          this.error = error.toString()
        })
    }
  }
}
</script>
