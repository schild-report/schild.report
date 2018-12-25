import ipc from 'electron-better-ipc'

export default async ({ router, store }) => {
  const configData = await ipc.callMain('getConfig')
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

  router.beforeEach((to, from, next) => {
    if (to.path === '/') configData['passAuth'] ? next() : next({ name: 'login' })
    else next()
  })

  ipc.answerMain('getConfigData', () => store.state.data.configData)
  ipc.answerMain('updateRepos', repos => {
    store.commit('data/updateRepos', repos)
  })
  ipc.answerMain('messageRollup', message => {
    store.commit('data/updateMessage', message)
  })
}
