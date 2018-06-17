<template>
  <q-card inline class="fixed-center" style="width: 500px">
    <q-card-title>
      Melden Sie sich mit Ihrem Schild-Benutzer an
    </q-card-title>
    <q-card-separator />
    <q-card-main>
      <q-input
        stack-label="Benutzername"
        v-model="user"
      />
    </q-card-main>
    <q-card-main>
      <q-input
        type="password"
        stack-label="Passwort"
        v-model="password"
      />
    </q-card-main>
    <q-card-main>
      <q-btn :color="color" @click="login">{{text}}</q-btn>
    </q-card-main>
  </q-card>
</template>

<script>
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
      this.$schild.getNutzer(this.user)
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
