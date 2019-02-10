<template>
  <q-page padding class="row">
    <datenbank></datenbank>
    <q-card style="width: 300px; margin: 5px">
      <q-card-section><div class="text-h6">
        Versionsinformationen
      </div></q-card-section>
      <q-separator />
      <q-card-section>
        Version: {{configData.version.buildVersion}}
      </q-card-section>
      <q-card-section>
        ID: {{configData.version.gitHash.substring(0, 8)}}
      </q-card-section>
    </q-card>
    <q-card style="width: 500px; margin: 5px">
      <q-card-section><div class="text-h6">
        Eigene Datenfelder
      </div></q-card-section>
      <q-separator />
      <q-card-section>
        Die Key/Value-Paare können anschließend in den Reports eingesetzt werden.
        Legen Sie z.B. fest, wo der Report das Logo für ihre Schule findet.
        Diese Werte können anschließend im Report unter <code>{privat.IhrKey}</code>
        abgerufen werden.
        <div class="row no-wrap">
          <q-input class="col q-pr-sm" v-model="key" label="Key" />
          <q-input class="col q-pl-sm" v-model="value" label="Value" @keyup.enter="add"/>
        </div>
        <q-list dense no-border>
          <q-item v-for="(value, key, id) in configData.privateDaten" :key="id">
            <q-item-section class="col-3">{{`${key}:`}}</q-item-section>
            <q-item-section>{{`${value}`}}</q-item-section>
            <q-item-section avatar><q-avatar icon="delete" text-color="red" class="cursor-pointer" @click.native="remove(key)"/></q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <q-card inline style="width: 500px; margin: 5px" v-if="configData.debug">
      <q-card-section><div class="text-h6">Sonstige Einstellungen</div></q-card-section>
      <q-separator />
      <q-card-section>
        <q-item>
          <q-item-section side top><q-checkbox v-model="toggleDebug" /></q-item-section>
          <q-item-section>Svelte Debug</q-item-section>
        </q-item>
        Den Debug-Modus in Svelte aktivieren. Diese
        Einstellung velangsamt die Kompilierung der Dokumente, kann aber
        dafür genutzt werden, um z.B. Informationen über die verwendenen
        Komponentnen zu bekommen oder <code>{@debug}</code> Anweisungen
        im Code zu verteilen. Z.b. kann man damit <code>{@debug
        schueler}</code> setzen, das in der Konsole dann jede Veränderung
        von <code>schueler</code> ausgibt.
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input v-model="configData.reports" label="Reportverzeichnis" @keyup.enter="updateConfigData"/>
        <q-input v-model="configData.pdf" label="PDF-Verzeichnis" @keyup.enter="updateConfigData"/>
        <q-input v-model="configData.userData" label="Datenverzeichnis" @keyup.enter="updateConfigData"/>
      </q-card-section>
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
