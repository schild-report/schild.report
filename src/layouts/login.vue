<template>
  <q-card inline class="fixed-center" style="width: 500px">
    <q-card-section>
      Melden Sie sich mit Ihrem Schild-Benutzer an
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-input
        stack-label="Benutzername"
        v-model="user"
        autofocus
      />
    </q-card-section>
    <q-card-section>
      <q-input
        type="password"
        stack-label="Passwort"
        v-model="password"
        @keyup.enter="login"
      />
    </q-card-section>
    <q-card-section>
      <q-btn :color="color" @click="login">{{text}}</q-btn>
    </q-card-section>
  </q-card>
</template>

<script>
const ipc = require('electron-better-ipc')

function crypt (password) {
  const p = Array.from(password)
  return String.fromCodePoint(...p
    .map(c => c.codePointAt(0))
    .map(c => (Math.floor(c / 16) * 32 + 15 - c)))
}
export default {
  name: 'Login',
  data () {
    return {
      user: null,
      password: null,
      text: 'Anmelden',
      color: 'primary'
    }
  },
  methods: {
    login () {
      ipc.callMain('schildGetNutzer', { arg: this.user })
        .then(user => {
          if (user.US_Password === crypt(this.password)) {
            this.$store.commit('data/updateAuth', user)
            this.$router.push('/')
          } else {
            this.color = 'red'
            this.text = 'Anmeldung erfolglos'
          }
        })
    }
  }
}
</script>
