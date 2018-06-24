import { app, BrowserWindow } from 'electron'
import ipc from 'electron-better-ipc'
import path from 'path'
import * as fs from 'fs'
import configFile from './configstore'
import * as componentCompiler from './rollup'
import { Repo } from './dugite'
import { is } from 'electron-util'
import schild from 'schild'
import './store'
import CheapWatch from 'cheap-watch'

const componentsPath = is.development
  ? `${__statics}/plugins`
  : configFile.get('plugins.destination')

if (process.env.PROD) {
  global.__statics = path.join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow
let pdfWindow = null
let watcher

function createPDFWindow () {
  pdfWindow = new BrowserWindow({
    show: false,
    parent: mainWindow,
    width: 800,
    height: 600,
    webPreferences: {
      plugins: true
    }
  })

  pdfWindow.on('closed', () => {
    pdfWindow = null
  })
}

function createWindow () {
  let { width, height } = configFile.get('windowBounds.main')
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    useContentSize: true,
    icon: path.join(__dirname, '../icons/linux-256x256.png')
  })

  mainWindow.loadURL(process.env.APP_URL)
  if (is.development) mainWindow.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds()
    configFile.set('windowBounds.main', { width, height })
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

ipc.answerRenderer('view-pdf', async () => {
  if (pdfWindow === null) {
    createPDFWindow()
  }
  pdfWindow.loadURL(`file://${app.getPath('userData')}/print.pdf`)
  pdfWindow.show()
})

ipc.answerRenderer('source', async () => {
  return configFile.get('plugins.source')
})

function scanSource () {
  const isDirectory = source => fs.lstatSync(source).isDirectory()
  const getDirectories = source =>
    fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)
  const source = configFile.get('plugins.source')
  const obj = {}
  getDirectories(source).forEach(element => {
    obj[path.basename(element)] = fs.readdirSync(element).filter(fn => fn.slice(-5) === '.html' && fn.charAt(0) !== '_')
  })
  ipc.callRenderer(mainWindow, 'updateRepos', obj)
}

ipc.answerRenderer('repos', async () => {
  scanSource()
  const fileWatcher = new CheapWatch({
    dir: configFile.get('plugins.source'),
    filter: ({ path, stats }) => stats.isDirectory() ? !path.includes('/') : path.endsWith('.html')
  })
  await fileWatcher.init()
  fileWatcher.on('+', ({ path, stats, isNew }) => { if (isNew) scanSource() })
  fileWatcher.on('-', ({ path, stats }) => { scanSource() })
})

ipc.answerRenderer('compileDokumente', async (file) => {
  console.log('Rollup starten …')
  await componentCompiler.rollupSetup({
    statics: __statics,
    source: path.join(configFile.get('plugins.source'), file),
    dest: componentsPath,
    is: is
  })
  if (watcher) watcher.close()
  watcher = await componentCompiler.rollupWatch()
  watcher.on('event', event => {
    // console.log(event.code)
    switch (event.code) {
      case 'FATAL':
        ipc.callRenderer(mainWindow, 'message', event.error)
        break
      case 'END':
        console.log('Modul aktualisiert, webview aktualisieren …')
        ipc.callRenderer(mainWindow, 'hmr')
        break
    }
  })
})

ipc.answerRenderer('pullDokumente', async (event, arg) => {
  configFile.get('plugins.remoteRepos').forEach(repo => {
    const repoPath = path.join(configFile.get('plugins.source'), repo.name)
    Repo.pull(repoPath)
  })
})

ipc.answerRenderer('getRemoteRepos', async getRemoteRepos => {
  return configFile.get('plugins.remoteRepos') || []
})
ipc.answerRenderer('setRemoteRepos', async remoteRepos => {
  configFile.set('plugins.remoteRepos', remoteRepos)
})
ipc.answerRenderer('cloneRemoteRepo', async remoteRepo => {
  const pluginsSource = configFile.get('plugins.source')
  await Repo.clone(remoteRepo, pluginsSource)
})
ipc.answerRenderer('setDB', async db => {
  console.log('Verbindungsdaten speichern …')
  configFile.set('db', db)
})
ipc.answerRenderer('schildConnect', async data => {
  return schild.connect(data.arg, data.arg2)
})
ipc.answerRenderer('schildTestConnection', async data => {
  return schild.testConnection()
})
ipc.answerRenderer('schildSuche', async data => {
  return schild.suche(data.arg)
})
ipc.answerRenderer('schildGetKlasse', async data => {
  return schild.getKlasse(data.arg)
})
ipc.answerRenderer('schildGetSchule', async data => {
  return schild.getSchule()
})
ipc.answerRenderer('schildGetSchueler', async data => {
  return schild.getSchueler(data.arg)
})
ipc.answerRenderer('schildGetSchuelerfoto', async data => {
  return schild.getSchuelerfoto(data.arg)
})
ipc.answerRenderer('schildGetNutzer', async data => {
  return schild.getNutzer(data.arg)
})
