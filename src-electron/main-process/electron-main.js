import { app, BrowserWindow, ipcMain } from 'electron'
import ipc from 'electron-better-ipc'
import path from 'path'
import configFile from './configstore'
import * as componentCompiler from './rollup'
import { Repo } from './remote-repos'
import { is } from 'electron-util'
import store from './store'

// console.log(store)

const componentsPath = is.development
  ? `${__statics}/plugins`
  : configFile.get('plugins.destination')

if (process.env.PROD) {
  global.__statics = path.join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

console.log('Rollup watch starten …')
componentCompiler.rollupSetup({
  statics: __statics,
  source: configFile.get('plugins.source'),
  dest: componentsPath,
  is: is
})

let mainWindow
let pdfWindow = null

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
  // mainWindow.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds()
    configFile.set('windowBounds.main', { width, height })
  })

  mainWindow.webContents.on('did-finish-load', () => {
    const watcher = componentCompiler.rollupWatch()
    watcher.on('event', event => {
      if (event.code === 'END') {
        console.log(
          new Date().toLocaleDateString('de-DE', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
          })
        )
        mainWindow.webContents.send('recompile')
      }
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

ipcMain.on('view-pdf', () => {
  if (pdfWindow === null) {
    createPDFWindow()
  }
  pdfWindow.loadURL(`file://${app.getPath('userData')}/print.pdf`)
  pdfWindow.show()
})

ipcMain.on('compileDokumente', () => {
  compileDokumente()
})

ipcMain.on('pullDokumente', (event, arg) => {
  configFile.get('plugins.remoteRepos').forEach(repo => {
    const repoPath = `${configFile.get('plugins.source')}/${repo.name}`
    Repo.pull(repoPath)
  })
  compileDokumente()
})

async function compileDokumente () {
  await componentCompiler.rollupBuild()
  console.log(
    new Date().toLocaleDateString('de-DE', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
  )
  // mainWindow.webContents.send('recompile')
  store.dispatch('data/updateComponents', componentsPath)
}

ipc.answerRenderer('getRemoteRepos', async getRemoteRepos => {
  return configFile.get('plugins.remoteRepos') || []
})
ipc.answerRenderer('setRemoteRepos', async remoteRepos => {
  configFile.set('plugins.remoteRepos', remoteRepos)
})
ipc.answerRenderer('cloneRemoteRepo', async remoteRepo => {
  const pluginsSource = configFile.get('plugins.source')
  const name = await Repo.clone(remoteRepo, pluginsSource)
  compileDokumente()
  return name
})
ipc.answerRenderer('setDB', async db => {
  console.log('Verbindungsdaten speichern …')
  configFile.set('db', db)
})
