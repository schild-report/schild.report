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
    <q-expansion-item
        expand-separator
        dense
        icon="warning"
        label="Erweiterte Einstellungen"
    >
      <q-card-section>
        <q-input
          type="text"
          label="Zeitzone"
          hint="['local', 'Z' oder als Offset +HH:MM / -HH:MM]"
          v-model="db.connection.timezone"
        />
      </q-card-section>
      <q-card-section>
        <q-checkbox
          label="Daten als String"
          v-model="db.connection.dateStrings"
        />
      </q-card-section>
      <q-card-section>
        <q-input
          type="text"
          label="Zeichensatz"
          hint="['utf8']"
          v-model="db.connection.charset"
        />
      </q-card-section>
    </q-expansion-item>
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
    async handleSubmit () {
      await ipc.callMain('schildConnect', this.db)
      if (this.testing !== 'green') {
        try {
          const res = await ipc.callMain('schildTestConnection')
          if (!res) throw new Error('Die Verbindung konnte nicht hergestellt werden.')
          else this.testing = 'green'
          this.checkConnection = 'Verbindungsdaten speichern'
          this.configData.db = this.db
          this.$store.commit('data/updateConfigData', this.configData)
          try {
            const schule = await ipc.callMain('schildGetSchule')
            this.$store.commit('data/updateSchule', schule)
            this.$router.push('/')
          } catch (err) {
            console.log('DB-Einstellungen konnten nicht gespeichert werden:' + err)
          }
        } catch (error) {
          console.log(error)
          this.testing = 'red'
          this.checkConnection = 'Fehlerhafte Verbindungsdaten'
        }
      } else this.$emit('input', this.db)
    }
  }
}
</script>
