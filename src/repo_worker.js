import { expose } from "comlink";
import CheapWatch from 'cheap-watch'
import { lstatSync, readdirSync, existsSync } from 'fs'
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
    return obj
  } catch (e) {
    console.log('Fehler beim Scannen des Report-Verzeichnisses: ', e)
  }
}

class RepoWatcher {
  constructor () {
    this.report_location = null
  }

  set_report_location (location) {
    if (existsSync(location)) {
      this.report_location = location
    } else throw 'Verzeichnis existiert nicht'
  }

  async watch_repos (cb) {
    const report_location = this.report_location
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
    }
  }
}

expose(new RepoWatcher())
