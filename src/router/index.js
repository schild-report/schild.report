import Vue from 'vue'
import VueRouter from 'vue-router'
import _ from 'lodash'
import configFile from '../../src-electron/main-process/configstore'
import store from '../store'
import { is } from 'electron-util'

import routes from './routes'

let db = configFile.get('db')
const componentsPath = is.development
  ? `${__statics}/plugins`
  : configFile.get('plugins.destination')

Vue.use(VueRouter)

const Router = new VueRouter({
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

if (_.isEmpty(db)) {
  console.log('Verbindungsdaten zur Schilddatenbank fehlen')
  Router.push({name: 'datenbank'})
} else {
  console.log('Verbindungsdaten gefunden, Datenbank öffnen')
  store.dispatch('data/updateSchild', db)
  store.commit('data/updateComponentsPath', componentsPath)
}
if (configFile.get('passAuth') === true) store.commit('data/updateAuth', true)

export default Router
