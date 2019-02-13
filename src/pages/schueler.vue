<template>
  <q-page padding v-if="schueler">
    <div class="text-h6 text-weight-medium">
      <span class="text-secondary cursor-pointer" color="secondary" v-on:click="$root.$emit('sucheSchueler', { klasse: true, id: schueler.Klasse })">{{schueler.Klasse}}</span> > {{schueler.Vorname}} {{schueler.Name}} ({{schueler.Geschlecht === 3 ? "&#x2642;" : "&#x2640;"}} {{alter}})
    </div>
    <q-separator/>
    <div class="q-pa-md row items-start q-gutter-md">
      <q-card v-if="tabelle.length > 0" style="margin: 5px">
        <q-card-section><div class="text-h6">
          Leistungsübersicht
        </div></q-card-section>
        <q-separator />
        <q-card-section>
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
        </q-card-section>
      </q-card>
      <q-card style="width: 300px; margin: 5px">
        <q-card-section><div class="text-h6">
          {{schueler.AktSchuljahr}}/{{schueler.AktAbschnitt}}
        </div></q-card-section>
        <q-separator />
        <q-card-section>
          <q-img :src="schuelerfoto" style="max-width: 250px">
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                Kein Foto vorhanden
              </div>
            </template>
          </q-img>
        </q-card-section>
        <q-card-section>
          <b>{{schueler.Vorname}} {{schueler.Name}}</b>
          <br>{{schueler.Strasse}}
          <br>{{schueler.PLZ}} {{schueler.OrtAbk}}
          <p></p>
          <br>{{schueler.Telefon}}
          <br>{{schueler.EMail}}
          <br>{{(new Date(schueler.Geburtsdatum).toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric', timezone: 'Europe/Berlin'}))}}
        </q-card-section>
      </q-card>
      <q-card v-if="schueler.vermerke.length > 0" style="width: 300px; margin: 5px">
        <q-card-section><div class="text-h6">
          Vermerke
        </div></q-card-section>
        <q-separator />
        <q-card-section>
          <q-list v-for="(v, index) in schueler.vermerke" :key="index">
            <q-item>
              <q-item-section>
                <q-item-label>{{v.Bemerkung}}</q-item-label>
                <q-item-label caption>{{`${(new Date(v.Datum).toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric'}))} | ${v.GeaendertVon||v.AngelegtVon}`}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <q-card v-if="abschlussInfo.some(a => a)" style="width: 300px; margin: 5px">
        <q-card-section><div class="text-h6">
          Abschluss
        </div></q-card-section>
        <q-separator />
        <q-card-section v-for="abschluss in abschlussInfo" :key="abschluss">
          <div v-if="abschluss">{{abschluss}}</div>
        </q-card-section>
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
  computed: {
    tabelle () { return Object.entries(this.faecher()).map(e => { return { name: e[0], ...e[1] } }) },
    columns () {
      if (this.tabelle.length === 0) return
      let a = [
        { name: 'Fach', field: 'name', label: 'Abschnitt', align: 'left' }
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
    schueler () { return this.$store.state.data.selected[0] },
    schuelerfoto () { return this.$store.state.data.schuelerfoto ? `data:image/jpg;base64,${this.$store.state.data.schuelerfoto}` : null },
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
    faecher () {
      let faecher = {}
      this.schueler.abschnitte.forEach((abschnitt, i) => {
        abschnitt.noten.forEach(note => {
          if (faecher[note.fach.FachKrz]) {
            faecher[note.fach.FachKrz].data.noten[i] = note
          } else {
            faecher[note.fach.FachKrz] = { data: { noten: new Array(this.schueler.abschnitte.length), fach: note.fach } }
            faecher[note.fach.FachKrz].data.noten[i] = note
          }
        })
      })
      return faecher
    }
  }
}
</script>
