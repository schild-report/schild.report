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
  let props

  ipcRenderer.on('editContent', (event, edit) => {
    document.querySelector('#content').setAttribute('contenteditable', edit)
  })
  ipcRenderer.on('setMark', async (event, state) => {
    state ? mark.mark(['undefined', '01.01.1970']) : mark.unmark()
  })
  ipcRenderer.on('setAbschnitt', async (event, abschnitt) => {
    await svelte.$set({ jahr: abschnitt.jahr, abschnitt: abschnitt.abschnitt })
    mark.mark(['undefined', '01.01.1970'])
  })
  ipcRenderer.on('setData', async (event, newData) => {
    await svelte.$set(newData)
    props = newData
    mark.mark(['undefined', '01.01.1970'])
  })

  ipcRenderer.on('updateComponents', (event, newData) => {
    props = props || newData
    delete require.cache[props.componentsPath]
    const Component = require(props.componentsPath)
    svelte = new Component({ target: document.querySelector('svelte'), props })
    console.log('created svelte')
    mark.mark(['undefined', '01.01.1970'])
  })
}
