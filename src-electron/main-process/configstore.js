import { api } from 'electron-util'
import Store from 'electron-store'
import { mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { hostname } from 'os'

api.app.setName('schild.report')

console.log('Config laden …')
const configFile = new Store({
  encryptionKey: hostname(),
  defaults: {
    windowBounds: {
      main: { width: 1800, height: 800 },
      dokument: { width: 1800, height: 800 }
    },
    plugins: {
      source: join(api.app.getPath('documents'), api.app.getName(), 'vorlagen', '.'),
      destination: join(api.app.getPath('userData'), '.'),
      remoteRepos: ''
    },
    db: {},
    passAuth: false
  }
})

function ensureDirectoryExistence (filePath) {
  const dir = dirname(filePath)
  if (existsSync(dir)) {
    return true
  }
  ensureDirectoryExistence(dir)
  mkdirSync(dir)
}

console.log('Verzeichnisse anlegen oder verwenden …')
ensureDirectoryExistence(configFile.get('plugins.source'))
ensureDirectoryExistence(configFile.get('plugins.destination'))

export default configFile
