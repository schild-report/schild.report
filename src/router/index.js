import Vue from 'vue'
import VueRouter from 'vue-router'
import { isEmpty } from 'lodash'
import configFile from '../../src-electron/main-process/configstore'
import store from '../store'
import ipc from 'electron-better-ipc'
import routes from './routes'

let db = configFile.get('db')

Vue.use(VueRouter)

const Router = new VueRouter({
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

if (isEmpty(db)) {
  console.log('Verbindungsdaten zur Schilddatenbank fehlen')
  Router.push({ name: 'datenbank' })
} else {
  console.log('Verbindungsdaten gefunden, Datenbank öffnen')
  ipc.callMain(
    'schildConnect', {
      arg: {
        testing: {
          client: 'mysql',
          useNullAsDefault: true,
          connection: {
            host: db.host,
            database: db.name,
            user: db.user,
            password: db.password,
            charset: 'utf8'
          }
        }
      },
      arg2: 'testing'
    })
    .then(res => console.log(res)).catch(e => console.log(e))

  store.commit('data/updateKnex', db)

  ipc.callMain('schildGetSchule')
    .then(response => {
      store.commit('data/updateSchule', response)
    })
    .catch((error) => {
      console.log(error)
    })
  store.commit('data/updateComponentsPath', configFile.get('plugins.destination'))
}
store.commit('data/updateAuth', configFile.get('passAuth'))

export default Router
