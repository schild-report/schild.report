import { api } from 'electron-util'
import Store from 'electron-store'
import { mkdirSync } from 'fs'
import { join, sep, isAbsolute, resolve } from 'path'
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
      destination: join(api.app.getPath('userData')),
      remoteRepos: ''
    },
    db: {},
    privateDaten: {},
    passAuth: false
  }
})

function mkDirByPathSync (targetDir, { isRelativeToScript = false } = {}) {
  const seperator = sep
  const initDir = isAbsolute(targetDir) ? seperator : ''
  const baseDir = isRelativeToScript ? __dirname : '.'

  return targetDir.split(seperator).reduce((parentDir, childDir) => {
    const curDir = resolve(baseDir, parentDir, childDir)
    try {
      mkdirSync(curDir)
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`)
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1
      if (!caughtErr || (caughtErr && curDir) === resolve(targetDir)) {
        throw err // Throw if it's just the last created dir.
      }
    }

    return curDir
  }, initDir)
}

console.log('Verzeichnisse anlegen oder verwenden …')
mkDirByPathSync(configFile.get('plugins.source'))
mkDirByPathSync(configFile.get('plugins.destination'))

export default configFile
