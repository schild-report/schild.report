const ipcRenderer = require('electron').ipcRenderer
const Mark = require('mark.js')

// informiere den Main-Thread, wer der webview ist
ipcRenderer.send('webview')

const libraries = {
  lodash: 'lodash',
  schild: 'schild',
  knex: 'knex'
}

global.R = (lib) => require(libraries[lib])
const mark = new Mark(document.querySelector('body'))
let svelte, props, Component, componentPath

function createSvelte () {
  svelte && svelte.$destroy()
  try {
    svelte = new Component({ target: document.querySelector('svelte'), props })
    console.log('Svelte-Dokument erfolgreich geladen.')
    ipcRenderer.sendToHost('clearDialog')
  } catch (error) {
    const serializeError = require('serialize-error')
    console.log('Das Svelte-Dokument konnte nicht geladen werden:', error)
    ipcRenderer.sendToHost('errorMessage', serializeError(error))
  }
  runMark()
}
function runMark () {
  mark.mark(['undefined', '01.01.1970'])
}

ipcRenderer.on('buildSvelte', (event, data) => {
  props = data.svelteProps
  componentPath = data.componentPath
  ipcRenderer.send('runRollup', { file: data.file, debug: data.debug })
})
ipcRenderer.on('loadSvelte', () => {
  // delete require.cache[componentPath]
  Component = require(componentPath)
  createSvelte()
})
ipcRenderer.on('setSveltePropsAbschnitt', (event, abschnitt) => {
  props.jahr = abschnitt.jahr
  props.abschnitt = abschnitt.abschnitt
  createSvelte()
  console.log(`Neuen Abschnitt gewählt: ${abschnitt.jahr}/${abschnitt.abschnitt}`)
})
ipcRenderer.on('setSvelteProps', (event, newData) => {
  props = newData
  createSvelte()
  console.log('Datensatz geändert')
})
ipcRenderer.on('showDataInConsole', (event, data) => {
  global.daten = data
  console.log('Die für Reports zur Verfügung stehenden Daten sind unter `daten` abegelegt:', global.daten)
})
ipcRenderer.on('editContent', (event, edit) => {
  document.querySelector('#content').setAttribute('contenteditable', edit)
})
ipcRenderer.on('setMark', (event, state) => {
  state ? runMark() : mark.unmark()
})

global.ipc = () => {
  // Host mitteilen, dass wir die Daten für den rollup-start haben wollen
  ipcRenderer.sendToHost('buildSvelte')
}
