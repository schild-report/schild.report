// // import something here

// // leave the export, even if you don't use it
// export default async ({ app, router, Vue }) => {
//   // something to do
// }
const { ipcRenderer: ipc } = require('electron-better-ipc')

export default async ({ router, store }) => {
  const configData = await ipc.callMain('getConfigData')
  store.commit('data/updateConfigData', configData)
  if (configData.db) {
    console.log('Verbindungsdaten gefunden, Datenbank öffnen')
    try {
      await ipc.callMain('schildConnect', configData.db)
    } catch (e) {
      console.log('Kann nicht mit Schild-DB verbinden:', e)
      router.push({ name: 'datenbank' })
    }
    const response = await ipc.callMain('schildGetSchule')
    store.commit('data/updateSchule', response)
  } else {
    console.log('Verbindungsdaten zur Schilddatenbank fehlen')
    router.push({ name: 'datenbank' })
  }
  store.subscribe((mutation, state) => {
    if (mutation.type === 'data/updateConfigData') {
      ipc.callMain('setConfigData', state.data.configData)
    }
  })
  ipc.callMain('repos')
  ipc.answerMain('updateRepos', repos => store.commit('data/updateRepos', repos))
  ipc.answerMain('messageRollup', message => store.commit('data/updateMessage', message))
  router.beforeEach(async (to, from, next) => {
    // state wird oben gesetzt, ist aber async, deswegen wird passAuth nicht beim
    // ersten Start gefunden. Deshalb ebenfalls getConfig hier.
    // const configData = store.state.data.configData.passAuth ? store.state.data.configData : await ipc.callMain('getConfig')
    const passAuth = configData.passAuth
    const db = configData.db
    const auth = store.state.data.auth
    if (to.matched.some(r => r.meta.requiresAuth) &&
      !auth &&
      db &&
      !passAuth) next({ name: 'login' })
    next()
  })
}
