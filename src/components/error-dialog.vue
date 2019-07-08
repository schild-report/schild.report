<template>
  <q-dialog :value="true" position="bottom" seamless>
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="text-h6">{{message.message}}</q-card-section>
      <q-card-section v-if="messageExtra">
        Möglicher Fehler: {{messageExtra}}
      </q-card-section>
      <q-card-section v-if="message.filename">
        Fehler in <b>{{message.filename}}</b>
        <br>Von Zeile {{message.start.line}} bis {{message.end.line}}
        <br><pre>{{message.frame}}</pre>
      </q-card-section>
      <q-expansion-item
        expand-separator
        label="Stack anzeigen"
      >
        <q-card-section>
          <pre>{{message.stack}}</pre>
        </q-card-section>
      </q-expansion-item>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ErrorDialog',
  computed: {
    message () { return this.$store.state.data.message },
    messageExtra () {
      const fehler = {
        'Vorname': 'Klassenlehrer fehlt bei einem Schüler',
        'Lernentw': 'Sind alle notwendigen Memos eingetragen? KO?',
        'FachKrz': 'Ein Fach wurde nicht gefunden, z.B. das 3. Abifach, Kolloquium etc.'
      }
      const key = Object.keys(fehler).find(f => this.message.message.includes(f))
      return fehler[key]
    }
  }
}
</script>
