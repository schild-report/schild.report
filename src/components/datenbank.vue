<template>
  <q-card inline style="width: 300px; margin: 5px">
    <q-card-title>
      Verbindungsdaten zur Datenbank
    </q-card-title>
    <q-card-separator />
    <q-card-main>
      <q-input
        stack-label="Server"
        placeholder="Serveradresse, z.B. localhost oder 192.168.178.99"
        v-model="db.connection.host"
        autofocus
      />
    </q-card-main>
    <q-card-main>
      <q-input
        stack-label="Datenbank"
        placeholder="Name der Datenbank, z.B. schild_berufskolleg"
        v-model="db.connection.database"
      />
    </q-card-main>
    <q-card-main>
      <q-input float-label="Benutzername" v-model="db.connection.user"/>
    </q-card-main>
    <q-card-main>
      <q-input
        type="password"
        no-pass-toggle
        float-label="Passwort"
        v-model="db.connection.password"
        @keyup.enter="handleSubmit"
      />
    </q-card-main>
    <q-card-main>
      <q-btn color="primary" @click="handleSubmit">{{checkConnection}}</q-btn>
      <q-icon class="q-display-1" v-if="testing" :color="testing" name="lens" />
    </q-card-main>
  </q-card>
</template>

<script>
const ipc = require('electron-better-ipc')

export default {
  data () {
    return {
      checkConnection: 'Verbindung prüfen …',
      configData: this.$store.state.data.configData,
      db: this.$store.state.data.configData.db || {
        client: 'mysql',
        useNullAsDefault: true,
        connection: { host: '', database: '', user: '', password: '', charset: 'utf8' }
      },
      testing: null
    }
  },
  methods: {
    handleSubmit () {
      ipc.callMain(
        'schildConnect', {
          arg: {
            testing: this.db
          },
          arg2: 'testing'
        })
        .then(res => console.log(res)).catch(e => console.log(e))
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
