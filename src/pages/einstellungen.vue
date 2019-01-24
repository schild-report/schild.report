<template>
  <q-page padding class="row">
    <datenbank></datenbank>
    <q-card inline style="width: 300px; margin: 5px">
      <q-card-title>Versionsinformationen</q-card-title>
      <q-card-separator />
      <q-card-main>
        Version: {{configData.version.buildVersion}}
        <br>ID: {{configData.version.gitHash.substring(0, 8)}}
      </q-card-main>
    </q-card>
    <q-card inline style="width: 500px; margin: 5px">
      <q-card-title>Eigene Datenfelder</q-card-title>
      <q-card-separator />
      <q-card-main>
        Die Key/Value-Paare können anschließend in den Reports eingesetzt werden.
        Legen Sie z.B. fest, wo der Report das Logo für ihre Schule findet.
        Diese Werte können anschließend im Report unter <code>{privat.IhrKey}</code>
        abgerufen werden.
        <div class="row no-wrap">
          <q-input class="col" v-model="key" stack-label="Key" />
          <q-input class="col" v-model="value" stack-label="Value" @keyup.enter="add"/>
        </div>
        <q-list dense no-border>
          <q-item v-for="(value, key, id) in configData.privateDaten" :key="id">
            <q-item-main :label="`${key}: ${value}`" />
            <q-item-side right>
              <q-item-tile icon="delete" color="red" class="cursor-pointer" @click.native="remove(key)"/>
            </q-item-side>
          </q-item>
        </q-list>
      </q-card-main>
    </q-card>
    <q-card inline style="width: 500px; margin: 5px" v-if="configData.debug">
      <q-card-title>Sonstige Einstellungen</q-card-title>
      <q-card-separator />
      <q-card-main>
        <q-item tag="label">
          <q-item-side>
            <q-checkbox v-model="toggleDebug" />
          </q-item-side>
          <q-item-main>
            <q-item-tile label>Svelte Debug</q-item-tile>
            <q-item-tile sublabel>Den Debug-Modus in Svelte aktivieren. Diese
            Einstellung velangsamt die Kompilierung der Dokumente, kann aber
            dafür genutzt werden, um z.B. Informationen über die verwendenen
            Komponentnen zu bekommen oder <code>{@debug}</code> Anweisungen
            im Code zu verteilen. Z.b. kann man damit <code>{@debug
            schueler}</code> setzen, das in der Konsole dann jede Veränderung
            von <code>schueler</code> ausgibt.</q-item-tile>
          </q-item-main>
        </q-item>
        <q-card-separator />
        <q-input v-model="configData.reports" stack-label="Reportverzeichnis" @keyup.enter="updateConfigData"/>
        <q-input v-model="configData.userData" stack-label="Datenverzeichnis" @keyup.enter="updateConfigData"/>
      </q-card-main>
    </q-card>
  </q-page>
</template>

<script>
import datenbank from './../components/datenbank.vue'

export default {
  name: 'Einstellungen',
  components: { datenbank },
  data () {
    return {
      key: '',
      value: '',
      configData: this.$store.state.data.configData
    }
  },
  computed: {
    toggleDebug: {
      get () { return this.$store.state.data.configData.debug || false },
      set (state) { this.$store.commit('data/updateConfigData', { ...this.configData, debug: state }) }
    }
  },
  methods: {
    updateConfigData () {
      this.$store.commit('data/updateConfigData', this.configData)
    },
    add () {
      this.configData.privateDaten[this.key] = this.value
      this.key = this.value = ''
      this.updateConfigData()
    },
    remove (key) {
      delete this.configData.privateDaten[key]
      this.updateConfigData()
      this.$forceUpdate()
    }
  }
}
</script>
