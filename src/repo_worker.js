import { expose } from "comlink";
import CheapWatch from 'cheap-watch'
import { lstatSync, readdirSync, existsSync, closeSync, openSync } from 'fs'
import { join, basename } from 'path'

function scanSource (report_location) {
  try {
    const isDirectory = (source) => lstatSync(source).isDirectory() && !basename(source).startsWith('.')
    const getDirectories = (source) =>
      readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    const obj = getDirectories(report_location)
      .reduce((o, element) => ({
        ...o,
        [basename(element)]: readdirSync(element).filter(fn => /\.((html)|(svelte))$/.test(fn) && fn.charAt(0) !== '_')
      }), {})
    
    Object.keys(obj).forEach(e=> {
      if (!existsSync(join(report_location, e, 'package.json'))) {
        closeSync(openSync(join(report_location, e, 'package.json'), 'a'))
      }
    })
    return obj
  } catch (e) {
    console.log('Fehler beim Scannen des Report-Verzeichnisses: ', e)
    throw e
  }
}

class RepoWatcher {
  async watch_repos (report_location, cb) {
    if (!existsSync(report_location)) throw 'Verzeichnis existiert nicht'
    cb(scanSource(report_location))
    try {
      const fileWatcher = new CheapWatch({
        debounce: 50,
        dir: report_location,
        filter: ({ path, stats }) => stats.isDirectory() ? !path.includes('/') : /\.((html)|(svelte))$/.test(path)
      })
      await fileWatcher.init()
      fileWatcher.on('+', ({ path, stats, isNew }) => { if (isNew) cb(scanSource(report_location)) })
      fileWatcher.on('-', ({ path, stats }) => { cb(scanSource(report_location)) })
    } catch (e) {
      console.log('Fehler beim File-Watcher: ', e)
      throw e
    }
  }
}

expose(new RepoWatcher())
