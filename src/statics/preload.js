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
  const mark = new Mark(document.querySelector('body'))
  let svelte

  ipcRenderer.on('editContent', (event, edit) => {
    document.querySelector('#content').setAttribute('contenteditable', edit)
  })
  ipcRenderer.on('setAbschnitt', (event, abschnitt) => {
    svelte.set({ jahr: abschnitt.jahr, abschnitt: abschnitt.abschnitt })
  })

  ipcRenderer.on('updateComponents', (event, args) => {
    delete require.cache[require.resolve(args.componentsPath)]
    const Component = require(args.componentsPath)
    if (svelte) svelte.destroy()
    svelte = new Component(
      {
        target: document.querySelector('svelte'),
        data: {
          ...args.reportData,
          knex: args.knex
        }
      }
    )
    mark.mark(['undefined', '01.01.1970'])
  })
}
