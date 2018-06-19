// adapted from https://raw.githubusercontent.com/LightouchDev/MasterVyrn/master/src/main/libs/store.js
// steal from https://github.com/vuejs/vuex/issues/92#issuecomment-212012430
import Vue from 'vue'
import Vuex from 'vuex'
import data from '../../src/store/data'
import { BrowserWindow, ipcMain } from 'electron'

const clients = []
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    data
  }
})

store.subscribe((mutation, state) => {
  console.log('veränderung')
  clients.forEach(client => {
    client.send('vuex-apply-mutation', mutation)
  })
})

ipcMain.on('vuex-connect', (event) => {
  let winId = BrowserWindow.fromWebContents(event.sender).id

  clients[winId] = event.sender
  event.returnValue = store.state
})

ipcMain.on('vuex-mutation', (event, args) => {
  try {
    store.commit(...args)
  } catch (error) {
    event.sender.send('vuex-error', error)
  }
})

ipcMain.on('vuex-action', (event, args) => {
  try {
    store.dispatch(...args)
  } catch (error) {
    event.sender.send('vuex-error', error)
  }
})

export default store
