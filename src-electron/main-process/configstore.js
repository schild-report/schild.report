import { api } from 'electron-util'
import Store from 'electron-store'
import { mkdirSync } from 'fs'
import { join } from 'path'
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
      source: join(api.app.getPath('documents'), api.app.getName(), 'vorlagen'),
      destination: join(api.app.getPath('userData'), 'plugins'),
      remoteRepos: ''
    },
    db: {},
    passAuth: false
  }
})

console.log('Verzeichnisse anlegen oder verwenden …')
try { mkdirSync(configFile.get('plugins.source')) } catch (err) { /* console.log(err) */ }
try { mkdirSync(configFile.get('plugins.destination')) } catch (err) { /* console.log(err) */ }

export default configFile
