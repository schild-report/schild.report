import { api } from 'electron-util'
import Store from 'electron-store'
import { join } from 'path'
import { hostname } from 'os'

api.app.setName('schild.report')

console.log('Config laden …')
const configFile = new Store({
  encryptionKey: hostname(),
  defaults: {
    windowBounds: {
      main: { width: 1800, height: 800 }
    },
    reports: join(api.app.getPath('documents'), api.app.getName(), 'reports'),
    pdf: join(api.app.getPath('documents'), api.app.getName(), 'pdf'),
    userData: join(api.app.getPath('userData')),
    privateDaten: {}
  }
})

export default configFile
