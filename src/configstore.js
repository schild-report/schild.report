import { api } from 'electron-util'
import Store from 'electron-store'
import { join } from 'path'
import { hostname } from 'os'

api.app.name = 'schild.report'

console.log('Config laden …')
const configFile = new Store({
  encryptionKey: hostname(),
  defaults: {
    windowBounds: {
      main: { width: 1800, height: 800 }
    },
    reports: join(api.app.getPath("documents"), api.app.name, "reports"),
    plugins: join(api.app.getPath("documents"), api.app.name, "plugins"),
    pdf: join(api.app.getPath("documents"), api.app.name, "pdf"),
    userData: join(api.app.getPath("userData")),
    privateDaten: {},
    folderStates: {},
    debug: true,
    db: {
      client: "mysql",
      useNullAsDefault: true,
      connection: {
        host: "localhost",
        database: "schild_berufskolleg",
        port: "3306",
        user: "schild",
        password: "schild",
        charset: "utf8",
        dateStrings: false,
        timezone: '',
        debug: false
      }
    }
  }
});
export default configFile
