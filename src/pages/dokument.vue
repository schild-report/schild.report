<template>
  <div>
    <webview src="statics/webview.html" :preload="preload" autosize></webview>
    <q-page-sticky position="top-right" :offset="[18, 70]">
      <q-btn
        round
        contenteditable="false"
        :color="editColor"
        icon="create"
        @click="editContent"
      />
    </q-page-sticky>
  </div>
</template>

<script>
import path from 'path'

export default {
  name: 'Dokument',
  watch: {
    components () {
      this.initiateSvelte()
      this.createSvelte()
    },
    $route (to, from) {
      this.createSvelte()
    }
  },
  data () {
    return {
      preload: 'file://' + path.join(__statics, '/preload.js'),
      webview: null,
      edit: false
    }
  },
  computed: {
    editColor () {
      return this.edit ? 'green' : 'red'
    },
    componentName () {
      return this.components[this.$route.params.id].bez
    },
    components () { return this.$store.state.data.components }
  },
  mounted () {
    this.webview = document.querySelector('webview')
    this.webview.addEventListener('dom-ready', () => {
      this.webview.openDevTools()
      this.initiateSvelte()
      this.createSvelte()
    })
  },
  methods: {
    editContent () {
      this.edit = !this.edit
      this.webview.send('editContent', this.edit)
    },
    initiateSvelte () {
      this.webview.send('loadComponents', {
        componentsPath: this.$store.state.data.componentsPath + '/bundle.js'
      })
    },
    createSvelte () {
      this.webview.send('updateComponents', {
        component: this.$route.params.id,
        knex: this.$store.state.data.knex,
        reportData: this.$store.getters['data/reportData']
      })
    }
  }
}
</script>

<style>
  webview {
    display: block;
    border: none;
    height: 100vh;
    width: 100vw;
    display: inline-flex !important;
  }
</style>
