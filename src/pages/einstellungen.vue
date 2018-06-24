<template>
  <q-page padding class="row">
    <q-card inline style="width: 600px; margin: 5px">
      <q-card-title>
        Externe Dokumentensammlungen
      </q-card-title>
      <q-card-separator />
      <q-card-main>
        <q-input
          v-on:keyup.enter="hinzufuegen"
          autofocus
          v-model.trim="remoteRepoAddress"
          float-label="Git Repository hinzufügen"
          placeholder="Github, Gist oder andere Repository Adresse"
        />
        <q-list highlight no-border>
          <q-list-header>Gespeicherte Repositories</q-list-header>
          <q-item v-for="(remoteRepo, index) in remoteRepos" v-bind:key="index">
            <q-item-main :label="remoteRepo.name" :sublabel="remoteRepo.address" />
            <q-item-side right>
              <q-item-tile
                icon="clear"
                color="red"
                v-on:click.native="entfernen(remoteRepo)"
                :style="{ cursor: 'pointer' }"
              />
            </q-item-side>
          </q-item>
        </q-list>
      </q-card-main>
    </q-card>
    <datenbank></datenbank>
    <q-dialog v-model="dialogModel">
      <span slot="title">{{dialogTitle}}</span>
      <span slot="message" v-html="dialogMessage"></span>
    </q-dialog>
  </q-page>
</template>

<script>
const ipc = require('electron-better-ipc')
import datenbank from './../components/datenbank.vue'

export default {
  name: 'Einstellungen',
  components: { datenbank },
  created () {
    this.fetch()
  },
  data () {
    return {
      remoteRepos: [],
      remoteRepoAddress: '',
      dialogModel: false,
      dialogTitle: '',
      dialogMessage: ''
    }
  },
  methods: {
    fetch () {
      ipc.callMain('getRemoteRepos')
        .then(remoteRepos => {
          this.remoteRepos = remoteRepos
        })
        .catch(err => console.log(err))
    },
    save () {
      ipc.callMain('setRemoteRepos', this.remoteRepos)
        .then(res => console.log(res))
        .catch(err => console.log(err))
    },
    hinzufuegen () {
      ipc.callMain('cloneRemoteRepo', this.remoteRepoAddress)
        .then(name => {
          console.log(name)
          this.remoteRepos.push({ address: this.remoteRepoAddress, name: name })
          this.remoteRepoAddress = ''
          this.save()
        })
        .catch(err => {
          console.log(err)
          this.dialogTitle = 'Fehler'
          /* eslint no-control-regex: 0 */
          this.dialogMessage = err.replace(new RegExp('\r?\n', 'g'), '<br />')
          this.dialogModel = true
        })
    },
    entfernen (repo) {
      this.remoteRepos.splice(this.remoteRepos.indexOf(repo), 1)
      this.save()
    }
  }
}
</script>
