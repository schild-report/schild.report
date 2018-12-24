import Vue from 'vue'
import VueRouter from 'vue-router'
import { isEmpty } from 'lodash'
import configFile from '../../src-electron/main-process/configstore'
import store from '../store'
import ipc from 'electron-better-ipc'
import routes from './routes'

let db = configFile.get('db')
store.commit('data/updatePrivateDaten', configFile.get('privateDaten'))

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
      arg: { testing: db },
      arg2: 'testing'
    })
    .then(_ => store.commit('data/updateKnex', db))
    .catch(e => console.log(e))
}
store.commit('data/updateAuth', configFile.get('passAuth'))
store.commit('data/updateComponentsPath', configFile.get('plugins.destination'))

export default Router
