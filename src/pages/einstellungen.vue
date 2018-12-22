<template>
  <q-page padding class="row">
    <datenbank></datenbank>
    <q-card inline style="width: 300px; margin: 5px">
      <q-card-title>
        Versionsinformationen
      </q-card-title>
      <q-card-separator />
      <q-card-main>
        Version: {{VERSION.buildVersion}}
        <br>ID: {{VERSION.gitHash}}
      </q-card-main>
    </q-card>
  </q-page>
</template>

<script>
import datenbank from './../components/datenbank.vue'
import { VERSION } from '../../src-electron/main-process/version'

export default {
  name: 'Einstellungen',
  components: { datenbank },
  data () { return { VERSION } }
}
</script>
