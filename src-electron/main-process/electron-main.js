import { join, basename, dirname } from 'path'
import { lstatSync, readdirSync } from 'fs'

import { app, BrowserWindow, shell } from 'electron'
// import ipc from 'electron-better-ipc'
const { ipcMain: ipc } = require('electron-better-ipc')
import { is } from 'electron-util'
import Schild from 'schild'
import CheapWatch from 'cheap-watch'
import serializeError from 'serialize-error'

import configFile from './configstore'
import RollupBuild from './rollup'
import { VERSION } from './version'
import { mkDirByPathSync } from './mkdir'

console.log(VERSION)
if (process.argv.some(a => a === '-v')) app.exit()
const configData = configFile.store
configData['passAuth'] = process.argv.some(a => a === '--no-login') || is.development
configData['debug'] = process.argv.some(a => a === '--debug') || is.development
configData['version'] = VERSION
console.log('Verzeichnisse anlegen oder verwenden …')
mkDirByPathSync(configData.reports)

if (process.env.PROD) {
  global.__statics = join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow, win
function createWindow () {
  mainWindow = new BrowserWindow({
    ...configData.windowBounds.main,
    show: false,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
    title: `${app.getName()} ${VERSION['buildVersion']}`,
    icon: join(__dirname, '../icons/linux-256x256.png')
  })

  mainWindow.loadURL(process.env.APP_URL)
  if (is.development || process.argv.some(a => a === '--devtools')) mainWindow.openDevTools()

  mainWindow.on('close', e => {
    if (!configData.close) {
      e.preventDefault()
      configFile.set('windowBounds.main', mainWindow.getBounds())
      win && configFile.set('windowBounds.editor', win.getBounds())
      console.log('Konfigurationsdaten gespeichert.')
      configData.close = true
      mainWindow.close()
      win && win.close()
    }
  })
  mainWindow.webContents.on('will-navigate', (e, url) => {
    if (url.includes('http')) {
      console.log(url)
      e.preventDefault()
      shell.openExternal(url)
      console.log('Navigation umgeleitet auf Browser etc.')
    }
  })
  mainWindow.on('closed', () => {
    mainWindow = null
    win = null
  })
  mainWindow.once('ready-to-show', async () => {
    mainWindow.show()
    scanSource()
    const fileWatcher = new CheapWatch({
      debounce: 50,
      dir: configData.reports,
      filter: ({ path, stats }) => stats.isDirectory() ? !path.includes('/') : /\.((html)|(svelte))$/.test(path)
    })
    await fileWatcher.init()
    fileWatcher.on('+', ({ path, stats, isNew }) => { if (isNew) scanSource() })
    fileWatcher.on('-', ({ path, stats }) => { scanSource() })
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

const scanSource = () => {
  const isDirectory = (source) => lstatSync(source).isDirectory()
  const getDirectories = (source) =>
    readdirSync(source).map(name => join(source, name)).filter(isDirectory)
  const obj = getDirectories(configData.reports)
    .reduce((o, element) => ({ ...o,
      [basename(element)]: readdirSync(element).filter(fn => /\.((html)|(svelte))$/.test(fn) && fn.charAt(0) !== '_')
    }), {})
  ipc.callRenderer(mainWindow, 'updateRepos', obj)
}
ipc.answerRenderer('repos', async () => scanSource())

let webview
ipc.on('webview', async (event) => { webview = event.sender })

const rollup = new RollupBuild()
rollup.on('message', error => ipc.callRenderer(mainWindow, 'messageRollup', serializeError(error)))
let bundle
rollup.on('bundle', b => {
  win && win.isVisible() && ipc.callRenderer(win, 'bundleRollup', b)
  bundle = b
})
let watcher = []
rollup.on('moduleIDs', moduleIDs => {
  while (watcher.length) { watcher.pop().close() }
  Array.from(moduleIDs).forEach(async (moduleID) => {
    if (!moduleID.includes('node_modules')) {
      const emitter = new CheapWatch({
        dir: dirname(moduleID),
        debounce: 30,
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

const runRollup = async (args) => {
  const options = args && args.file ? {
    source: join(configData.reports, args.file),
    dest: join(configData.userData),
    debug: args.debug
  } : null
  try {
    await rollup.build(options)
    webview.send('loadSvelte')
  } catch (err) {
    console.log(err)
  }
}
ipc.on('runRollup', async (event, args) => {
  console.log('Rollup starten für', args.file, '…')
  runRollup(args)
})

const schild = new Schild()
ipc.answerRenderer('schildConnect', async options => schild.connect(options))
ipc.answerRenderer('schildTestConnection', async () => schild.testConnection())
ipc.answerRenderer('schildSuche', async data => schild.suche(data))
ipc.answerRenderer('schildGetKlasse', async id => schild.getKlasse(id))
ipc.answerRenderer('schildGetSchule', async () => schild.getSchule())
ipc.answerRenderer('schildGetSchueler', async id => schild.getSchueler(id))
ipc.answerRenderer('schildGetSchuelerfoto', async id => schild.getSchuelerfoto(id))
ipc.answerRenderer('schildGetNutzer', async id => schild.getNutzer(id))
ipc.answerRenderer('getBundle', async () => bundle)
ipc.answerRenderer('getConfigData', async () => configData)
ipc.answerRenderer('setConfigData', async data => configFile.set(data))

ipc.answerRenderer('openEditor', async () => {
  if (win) {
    ipc.callRenderer(win, 'bundleRollup', bundle)
    win.show()
  } else {
    win = new BrowserWindow({ ...configData.windowBounds.editor, show: false, webPreferences: { nodeIntegration: true } })
    win.loadURL(process.env.APP_URL + '#/app/editor')
    win.once('ready-to-show', async () => {
      win.show()
    })
    win.on('closed', () => { win = null })
    win.on('close', async (e) => {
      if (!configData.close) {
        win.hide()
        e.preventDefault()
      }
    })
  }
})
