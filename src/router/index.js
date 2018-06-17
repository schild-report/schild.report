import Vue from 'vue'
import VueRouter from 'vue-router'
import _ from 'lodash'
const schild = require('schild')
import configFile from '../../src-electron/main-process/configstore'
import store from '../store'
import { is } from 'electron-util'

import routes from './routes'

const db = configFile.get('db')
const componentsPath = is.development
  ? `${__statics}/plugins`
  : configFile.get('plugins.destination')

Vue.use(VueRouter)

const Router = new VueRouter({
  /*
   * NOTE! Change Vue Router mode from quasar.conf.js -> build -> vueRouterMode
   *
   * If you decide to go with "history" mode, please also set "build.publicPath"
   * to something other than an empty string.
   * Example: '/' instead of ''
   */

  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

Router.beforeEach((to, from, next) => {
  if (_.isEmpty(db)) {
    console.log('Verbindungsdaten zur Schilddatenbank fehlen')
    if (to.name !== 'datenbank') next({name: 'datenbank'})
  } else if (!store.state.data.schule) {
    console.log('Verbindungsdaten gefunden, Datenbank öffnen')
    schild.connect({
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
    }, 'testing')
    store.commit('data/updateKnex', db)

    schild.getSchule()
      .then((response) => {
        store.commit('data/updateSchule', response.toJSON())
      })
      .catch((error) => {
        console.log(error)
      })
    store.commit('data/updateComponentsPath', componentsPath)
  }
  if (!store.state.data.auth && configFile.get('passAuth') !== true) {
    if (to.name !== 'login') next({name: 'login'})
  }
  next()
})

export default Router
