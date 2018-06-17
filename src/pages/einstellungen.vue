<template>
  <q-page padding class="row">
    <q-card inline style="width: 600px">
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
    <datenbank v-model="db"></datenbank>
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
      db: null,
      remoteRepoAddress: ''
    }
  },
  watch: {
    db: function () {
      ipc.callMain('setDB', this.db)
        .then(res => this.$router.push('/'))
        .catch(err => console.log('DB-Einstellungen konnten nicht gespeichert werden:' + err))
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
          this.remoteRepos.push({ address: this.remoteRepoAddress, name: name })
          this.remoteRepoAddress = ''
          this.save()
        })
        .catch(err => console.log(err))
    },
    entfernen (repo) {
      this.remoteRepos.splice(this.remoteRepos.indexOf(repo), 1)
      this.save()
    }
  }
}
</script>
