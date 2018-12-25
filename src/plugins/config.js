import ipc from 'electron-better-ipc'

export default ({ router, store }) => {
  ipc.callMain('getConfig')
    .then(configData => {
      store.commit('data/updateConfigData', configData)
      if (configData.db) {
        console.log('Verbindungsdaten gefunden, Datenbank öffnen')
        ipc.callMain(
          'schildConnect', {
            arg: { testing: configData.db },
            arg2: 'testing'
          })
          .catch(e => console.log(e))
        ipc.callMain('schildGetSchule')
          .then(response => {
            store.commit('data/updateSchule', response)
          })
          .catch((error) => {
            console.log(error)
          })
      } else {
        console.log('Verbindungsdaten zur Schilddatenbank fehlen')
        router.push({ name: 'datenbank' })
      }
    })
  router.beforeEach(async (to, from, next) => {
    // state wird oben gesetzt, ist aber async, deswegen wird passAuth nicht beim
    // ersten Start gefunden. Deshalb ebenfalls getConfig hier.
    const configData = store.state.data.configData.passAuth ? store.state.data.configData : await ipc.callMain('getConfig')
    const passAuth = configData.passAuth
    const db = configData.db
    const auth = store.state.data.auth
    if (to.matched.some(r => r.meta.requiresAuth) &&
      !auth &&
      db &&
      !passAuth) next({ name: 'login' })
    next()
  })

  ipc.answerMain('getConfigData', () => store.state.data.configData)
  ipc.answerMain('updateRepos', repos => {
    store.commit('data/updateRepos', repos)
  })
  ipc.answerMain('messageRollup', message => {
    store.commit('data/updateMessage', message)
  })
}
