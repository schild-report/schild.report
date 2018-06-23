<template>
  <div padding class="fixed-center">
    <datenbank v-model="db"></datenbank>
  </div>
</template>

<script>
const ipc = require('electron-better-ipc')
import datenbank from './../components/datenbank.vue'

export default {
  components: { datenbank },
  name: 'Datenbank',
  watch: {
    db: function () {
      ipc.callMain('setDB', this.db)
        .then(res => {
          this.$store.dispatch('data/updateSchild', this.db)
          this.$router.push('/')
        })
        .catch(err => console.log('DB-Einstellungen konnten nicht gespeichert werden:' + err))
    }
  },
  data () { return { db: null } }
}
</script>
