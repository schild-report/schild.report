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
  let data

  ipcRenderer.on('editContent', (event, edit) => {
    document.querySelector('#content').setAttribute('contenteditable', edit)
  })
  ipcRenderer.on('setAbschnitt', (event, abschnitt) => {
    svelte.set({ jahr: abschnitt.jahr, abschnitt: abschnitt.abschnitt })
  })
  ipcRenderer.on('setData', (event, newData) => {
    svelte.set(newData)
    data = newData
  })

  ipcRenderer.on('updateComponents', (event, newData) => {
    data = data || newData
    delete require.cache[data.componentsPath]
    const Component = require(data.componentsPath)
    if (svelte) svelte.destroy()
    svelte = new Component({ target: document.querySelector('svelte'), data })
    mark.mark(['undefined', '01.01.1970'])
  })
}
