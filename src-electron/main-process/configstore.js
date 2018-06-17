const {api} = require('electron-util')
import Store from 'electron-store'
import * as fs from 'fs'
// import os from 'os'

api.app.setName('schild.report')

console.log('Config laden …')
const configFile = new Store({
  // encryptionKey: os.hostname(),
  defaults: {
    windowBounds: {
      main: { width: 1800, height: 800 },
      dokument: { width: 1800, height: 800 }
    },
    plugins: {
      source: `${api.app.getPath('documents')}/${api.app.getName()}`,
      destination: `${api.app.getPath('userData')}/plugins`,
      remoteRepos: ''
    },
    db: {},
    passAuth: true
  }
})

console.log('Verzeichnisse anlegen oder verwenden und plugin-loader schreiben …')
try { fs.mkdirSync(configFile.get('plugins.source')) } catch (err) { /* console.log(err) */ }
try { fs.mkdirSync(configFile.get('plugins.destination')) } catch (err) { /* console.log(err) */ }
fs.writeFileSync(configFile.get('plugins.source') + '/plugin-loader.js', '// v1.0.0\nimport * as c from \'./*/*.html\'\nexport default c\n', (err) => { if (err) throw err })

export default configFile
