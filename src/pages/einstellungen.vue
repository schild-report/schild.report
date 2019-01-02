<template>
  <q-page padding class="row">
    <datenbank></datenbank>
    <q-card inline style="width: 300px; margin: 5px">
      <q-card-title>
        Versionsinformationen
      </q-card-title>
      <q-card-separator />
      <q-card-main>
        Version: {{configData.version.buildVersion}}
        <br>ID: {{configData.version.gitHash.substring(0, 8)}}
      </q-card-main>
    </q-card>
    <q-card inline style="width: 500px; margin: 5px">
      <q-card-title>
        Eigene Datenfelder
      </q-card-title>
      <q-card-separator />
      <q-card-main>
        Die Key/Value-Paare können anschließend in den Reports eingesetzt werden.
        Legen Sie z.B. fest, wo der Report das Logo für ihre Schule findet.
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
  methods: {
    add () {
      this.configData.privateDaten[this.key] = this.value
      this.key = this.value = ''
      this.$store.commit('data/updateConfigData', this.configData)
    },
    remove (key) {
      delete this.configData.privateDaten[key]
      this.$store.commit('data/updateConfigData', this.configData)
      this.$forceUpdate()
    }
  }
}
</script>
