<template>
  <q-card inline style="width: 300px">
    <q-card-title>
      Verbindungsdaten zur Datenbank
    </q-card-title>
    <q-card-separator />
    <q-card-main>
      <q-input
        stack-label="Server"
        placeholder="Serveradresse, z.B. localhost oder 192.168.178.99"
        v-model="db.host"
      />
    </q-card-main>
    <q-card-main>
      <q-input
        stack-label="Datenbank"
        placeholder="Name der Datenbank, z.B. schild_berufskolleg"
        v-model="db.name"
      />
    </q-card-main>
    <q-card-main>
      <q-input float-label="Benutzername" v-model="db.user"/>
    </q-card-main>
    <q-card-main>
      <q-input float-label="Passwort" v-model="db.password"/>
    </q-card-main>
    <q-card-main>
      <q-btn color="primary" @click="handleSubmit">{{checkConnection}}</q-btn>
      <q-icon class="q-display-1" v-if="testing" :color="testing" name="lens" />
    </q-card-main>
  </q-card>
</template>

<script>
export default {
  data () {
    return {
      checkConnection: 'Verbindung prüfen …',
      testing: null,
      db: {
        host: '',
        name: '',
        user: '',
        password: ''
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$schild.connect({
        testing: {
          client: 'mysql',
          useNullAsDefault: true,
          connection: {
            host: this.db.host,
            database: this.db.name,
            user: this.db.user,
            password: this.db.password,
            charset: 'utf8'
          }
        }
      }, 'testing')
      if (this.testing !== 'green') {
        this.$schild.testConnection()
          .then(res => {
            if (!res) throw new Error('Die Verbindung konnte nicht hergestellt werden.')
            else this.testing = 'green'
            this.checkConnection = 'Verbindungsdaten speichern'
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
