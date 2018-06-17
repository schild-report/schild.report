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
  let components

  ipcRenderer.on('loadComponents', (event, args) => {
    delete require.cache[require.resolve(args.componentsPath)]
    console.log('Plugins laden: ' + args.componentsPath)
    components = require(args.componentsPath)
  })

  ipcRenderer.on('editContent', (event, edit) => {
    document.querySelector('#content').setAttribute('contenteditable', edit)
  })
  ipcRenderer.on('updateComponents', (event, args) => {
    if (svelte) svelte.destroy()
    svelte = new components[args.component](
      {
        target: document.querySelector('svelte'),
        data: {
          schule: args.schule,
          klasse: args.klasse,
          schueler: args.schueler,
          jahr: args.jahr,
          abschnitt: args.abschnitt,
          knex: args.knex
        }
      }
    )
    mark.mark(['undefined', '01.01.1970'])
  })
}
