import { join, normalize } from 'path'
import url from 'url'
import { app, BrowserWindow, shell, protocol, ipcMain } from 'electron'
import { is } from 'electron-util'

import configFile from './configstore'
import { VERSION } from './version'
import { mkDirByPathSync } from './mkdir'

console.log(VERSION)
if (process.argv.some(a => a === '-v')) app.exit()
const configData = configFile.store
console.log('Verzeichnisse anlegen oder verwenden …')
try {
  mkDirByPathSync(configData.reports)
  mkDirByPathSync(configData.plugins)
} catch (e) {
  console.log(e, 'Verzeichnisse konnten nicht angelegt werden: ', configData.reports, configData.plugins)
}

let mainWindow
app.allowRendererProcessReuse = true

const handleRedirect = (e, url) => {
  if (url !== e.sender.getURL()) {
    e.preventDefault()
    shell.openExternal(url)
  }
}
function createWindow() {
  mainWindow = new BrowserWindow({
    ...configData.windowBounds.main,
    show: false,
    useContentSize: true,
    defaultEncoding: 'utf-8',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      nodeIntegrationInWorker: true
    },
    title: `${app.name} ${VERSION['buildVersion']}`,
    // icon: join(__dirname, '../icons/icon.icns')
  })
  mainWindow.removeMenu()
  mainWindow.loadURL(
    url.format({
      pathname: join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    }))
  if (is.development || process.argv.some(a => a === '--devtools')) mainWindow.openDevTools()

  mainWindow.on('close', e => {
    if (!configData.close) {
      e.preventDefault()
      configFile.set('windowBounds.main', mainWindow.getBounds())
      console.log('Konfigurationsdaten gespeichert.')
      configData.close = true
      mainWindow.close()
    }
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.once('ready-to-show', async () => {
    mainWindow.show()
  })
  mainWindow.webContents.on('will-navigate', handleRedirect)
  // baseDir bug
  protocol.registerFileProtocol('file2', (request, callback) => {
    const url = request.url.substr(6)
    const file = { path: normalize(`${url}`) }
    callback(file)
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

ipcMain.handle('get_store', (event, key) => configData );
ipcMain.handle('set_store', (event, value) => configFile.set(value))