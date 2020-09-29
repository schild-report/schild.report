const ipcRenderer = require('electron').ipcRenderer
const Mark = require('mark.js')
const requireFromString = require('require-from-string');

global.R = (lib) => require(lib)
let svelte, props, Component, componentPath, mark, compiled_module

function runMark () {
  mark = new Mark(document.querySelector('body'))
  mark.mark(['undefined', '01.01.1970', 'null'])
}
ipcRenderer.on('props', (event, data) => {
  props = data.svelteProps
  svelte?.$set(props)
  componentPath = data.componentPath
  compiled_module = data.compiled_module
})
ipcRenderer.on('set_dokument', () => {
  try {
    Component = requireFromString(compiled_module.code);
    svelte = new Component({ target: document.querySelector('svelte'), props })
    console.log('Svelte-Dokument erfolgreich geladen.')
    ipcRenderer.sendToHost('dokument_options', {
      kommentar: svelte.kommentar,
      pdf_name: svelte.pdf_name,
      generic_pdf: svelte.generic_pdf
    })
  } catch (error) {
    const { serializeError } = require('serialize-error')
    console.log('Das Svelte-Dokument konnte nicht geladen werden:', error)
    ipcRenderer.sendToHost('error_message', serializeError(error))
  }
  runMark()
})

ipcRenderer.on('open_devtools', (event, data) => {
  global.daten = data
  console.group('Report-Daten')
  console.log('Die für Reports zur Verfügung stehenden Daten sind unter `daten` abgelegt:')
  console.log(global.daten)
  console.groupEnd()
})
ipcRenderer.on('set_edit', (event, edit) => {
  document.querySelector('#content').setAttribute('contenteditable', edit)
})
ipcRenderer.on('set_mark', (event, state) => {
  state ? runMark() : mark.unmark()
})
