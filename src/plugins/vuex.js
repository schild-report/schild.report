import Vuex from 'vuex'
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import data from '../../src/store/data'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    data
  }
})

// import master state
try {
  store.replaceState(ipcRenderer.sendSync('vuex-connect'))
} catch (error) {
}

const { commit } = store

store.commit = (...args) => {
  ipcRenderer.send('vuex-mutation', args)
}

store.dispatch = (...args) => {
  // nextTick hack to simulate dispatch behavior
  Vue.nextTick(() => {
    ipcRenderer.send('vuex-action', args)
  })
}

ipcRenderer.on('vuex-apply-mutation', (event, { type, payload }) => {
  commit(type, payload)
})

ipcRenderer.on('vuex-error', (event, error) => console.error(error))

export default ({ store }) => {
  // leave the export, even if you don't use it
  Vue.prototype.$vuex = store
}
