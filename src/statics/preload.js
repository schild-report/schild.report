const ipcRenderer = require('electron').ipcRenderer
const Mark = require('mark.js')

global.R = {
  lodash: require('lodash'),
  schild: require('schild'),
  models: require('schild/models/Models'),
  knex: require('knex'),
  objection: require('objection')
}

global.ipc = () => {
  ipcRenderer.send('webviewReady')
  const mark = new Mark(document.querySelector('body'))
  let svelte

  ipcRenderer.on('editContent', (event, edit) => {
    document.querySelector('#content').setAttribute('contenteditable', edit)
  })
  ipcRenderer.on('setAbschnitt', (event, abschnitt) => {
    svelte.set({ jahr: abschnitt.jahr, abschnitt: abschnitt.abschnitt })
  })
  ipcRenderer.on('setData', (event, data) => {
    svelte.set(data)
  })

  ipcRenderer.on('updateComponents', (event, data) => {
    delete require.cache[require.resolve(data.componentsPath)]
    const Component = require(data.componentsPath)
    if (svelte) svelte.destroy()
    svelte = new Component({ target: document.querySelector('svelte'), data })
    mark.mark(['undefined', '01.01.1970'])
  })
}
