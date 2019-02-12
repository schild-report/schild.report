import { app, BrowserWindow } from 'electron'
import { VERSION } from './version'
console.log(VERSION)
if (process.argv.some(a => a === '-v')) app.exit()

import ipc from 'electron-better-ipc'
import { join, basename, dirname } from 'path'
import { lstatSync, readdirSync } from 'fs'
import configFile from './configstore'
import RollupBuild from './rollup'
import { is } from 'electron-util'
import schild from 'schild'
import CheapWatch from 'cheap-watch'
import { mkDirByPathSync } from './mkdir'

let configData = configFile.store
configData['passAuth'] = process.argv.some(a => a === '--no-login') || is.development
configData['debug'] = process.argv.some(a => a === '--debug') || is.development
configData['version'] = VERSION
console.log('Verzeichnisse anlegen oder verwenden …')
mkDirByPathSync(configData.reports)

let mainWindow
let watcher = []
const rollup = new RollupBuild()
rollup.on('message', message => {
  ipc.callRenderer(mainWindow, 'messageRollup', {
    ...message,
    code: message.code,
    stack: message.stack,
    message: message.message
  })
})
rollup.on('moduleIDs', moduleIDs => {
  while (watcher.length) { watcher.pop().close() }
  Array.from(moduleIDs).forEach(async (moduleID) => {
    if (!moduleID.includes('node_modules')) {
      const emitter = new CheapWatch({
        dir: dirname(moduleID),
        debounce: 50,
        filter: ({ path, stats }) => moduleID.endsWith(path)
      })
      console.log('Beobachte: ' + moduleID)
      try {
        await emitter.init()
        emitter.on('+', async ({ path, stats, isNew }) => {
          if (!isNew) {
            console.log('Änderungen bei: ' + path)
            await runRollup()
          }
        })
      } catch (e) {
        console.log(e)
      }
      watcher.push(emitter)
    }
  })
})

if (process.env.PROD) {
  global.__statics = join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

function createWindow () {
  mainWindow = new BrowserWindow({
    ...configData.windowBounds.main,
    show: false,
    useContentSize: true,
    title: `${app.getName()} ${VERSION['buildVersion']}`,
    icon: join(__dirname, '../icons/linux-256x256.png')
  })

  mainWindow.loadURL(process.env.APP_URL)
  if (is.development || process.argv.some(a => a === '--devtools')) mainWindow.openDevTools()

  mainWindow.on('close', (e) => {
    if (!configData.close) {
      e.preventDefault()
      ipc.callRenderer(mainWindow, 'getConfigData')
        .then(data => {
          data.windowBounds.main = mainWindow.getBounds()
          configFile.set(data)
          console.log('Konfigurationsdaten gespeichert.')
          configData.close = true
          mainWindow.close()
        })
    }
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    scanSource()
    const fileWatcher = new CheapWatch({
      dir: configData.reports,
      filter: ({ path, stats }) => stats.isDirectory() ? !path.includes('/') : path.endsWith('.html')
    })
    fileWatcher.init()
      .then(() => {
        fileWatcher.on('+', ({ path, stats, isNew }) => { if (isNew) scanSource() })
        fileWatcher.on('-', ({ path, stats }) => { scanSource() })
      })
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const scanSource = async () => {
  const isDirectory = (source) => lstatSync(source).isDirectory()
  const getDirectories = (source) =>
    readdirSync(source).map(name => join(source, name)).filter(isDirectory)
  const obj = getDirectories(configData.reports)
    .reduce((o, element) => ({ ...o,
      [basename(element)]: readdirSync(element).filter(fn => fn.slice(-5) === '.html' && fn.charAt(0) !== '_')
    }), {})
  ipc.callRenderer(mainWindow, 'updateRepos', obj)
}

ipc.answerRenderer('repos', async () => scanSource())
let webview

ipc.on('webview', async (event) => { webview = event.sender })

const runRollup = async (args) => {
  const options = args && args.file ? {
    source: join(configData.reports, args.file),
    dest: join(configData.userData),
    debug: args.debug
  } : null
  try {
    await rollup.build(options)
    webview.send('updateComponents')
  } catch (err) {
    console.log(err)
  }
}
ipc.on('runRollup', async (event, args) => {
  console.log('Rollup starten für', args.file, '…')
  runRollup(args)
})
ipc.answerRenderer('getConfig', async () => {
  return configData
})
ipc.answerRenderer('schildConnect', async data => {
  return schild.connect(data.arg, data.arg2)
})
ipc.answerRenderer('schildTestConnection', async () => {
  return schild.testConnection()
})
ipc.answerRenderer('schildSuche', async data => {
  // suche returns array
  return schild.suche(data.arg)
})
ipc.answerRenderer('schildGetKlasse', async data => {
  return (await schild.getKlasse(data.arg)).toJSON()
})
ipc.answerRenderer('schildGetSchule', async () => {
  return (await schild.getSchule()).toJSON()
})
ipc.answerRenderer('schildGetSchueler', async data => {
  const schueler = await schild.getSchueler(data.arg)
  return schueler.toJSON()
})
ipc.answerRenderer('schildGetSchuelerfoto', async data => {
  return schild.getSchuelerfoto(data.arg)
})
ipc.answerRenderer('schildGetNutzer', async data => {
  return (await schild.getNutzer(data.arg)).toJSON()
})
