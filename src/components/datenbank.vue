<template>
  <q-card inline style="width: 300px; margin: 5px">
    <q-card-section>
      <div class="text-h6">Datenbank</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-input
        label="Server"
        placeholder="z.B. localhost oder 192.168.178.99"
        v-model="db.connection.host"
        :autofocus="autofocus"
        @keyup.enter="handleSubmit"
      />
    </q-card-section>
    <q-card-section>
      <q-input
        label="Datenbank"
        placeholder="Name der Datenbank, z.B. schild_berufskolleg"
        v-model="db.connection.database"
        @keyup.enter="handleSubmit"
      />
    </q-card-section>
    <q-card-section>
      <q-input label="Benutzername"
        v-model="db.connection.user"
        @keyup.enter="handleSubmit"
      />
    </q-card-section>
    <q-card-section>
      <q-input
        type="password"
        no-pass-toggle
        label="Passwort"
        v-model="db.connection.password"
        @keyup.enter="handleSubmit"
      />
    </q-card-section>
    <q-card-section>
      <q-btn color="primary" @click="handleSubmit">{{checkConnection}}</q-btn>
      <q-icon class="q-display-1" v-if="testing" :color="testing" name="lens" />
    </q-card-section>
  </q-card>
</template>

<script>
const ipc = require('electron-better-ipc')

export default {
  data () {
    return {
      autofocus: this.$route.name === 'datenbank',
      checkConnection: 'Verbindung prüfen …',
      configData: this.$store.state.data.configData,
      testing: null,
      db: this.$store.state.data.configData.db || {
        client: 'mysql',
        useNullAsDefault: true,
        connection: { host: '', database: '', user: '', password: '', charset: 'utf8' }
      }
    }
  },
  methods: {
    handleSubmit () {
      ipc.callMain(
        'schildConnect', this.db)
        .catch(e => console.log(e))
      if (this.testing !== 'green') {
        ipc.callMain('schildTestConnection')
          .then(res => {
            if (!res) throw new Error('Die Verbindung konnte nicht hergestellt werden.')
            else this.testing = 'green'
            this.checkConnection = 'Verbindungsdaten speichern'
            this.configData.db = this.db
            this.$store.commit('data/updateConfigData', this.configData)
            ipc.callMain('schildGetSchule')
              .then(schule => this.$store.commit('data/updateSchule', schule))
              .then(res => this.$router.push('/'))
              .catch(err => console.log('DB-Einstellungen konnten nicht gespeichert werden:' + err))
          })
          .catch(error => {
            console.log(error)
            this.testing = 'red'
            this.checkConnection = 'Fehlerhafte Verbindungsdaten'
          })
      } else this.$emit('input', this.db)
    }
  }
}
</script>
