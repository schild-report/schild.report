const { api } = require('electron-util')
import Store from 'electron-store'
import * as fs from 'fs'
const path = require('path')
import os from 'os'

api.app.setName('schild.report')

console.log('Config laden …')
const configFile = new Store({
  encryptionKey: os.hostname(),
  defaults: {
    windowBounds: {
      main: { width: 1800, height: 800 },
      dokument: { width: 1800, height: 800 }
    },
    plugins: {
      source: path.join(api.app.getPath('documents'), api.app.getName()),
      destination: path.join(api.app.getPath('userData'), 'plugins'),
      remoteRepos: ''
    },
    db: {},
    passAuth: false
  }
})

console.log('Verzeichnisse anlegen oder verwenden …')
try { fs.mkdirSync(configFile.get('plugins.source')) } catch (err) { /* console.log(err) */ }
try { fs.mkdirSync(configFile.get('plugins.destination')) } catch (err) { /* console.log(err) */ }

export default configFile
