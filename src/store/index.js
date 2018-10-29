import Vue from 'vue'
import Vuex from 'vuex'

// we first import the module
import data from './data'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    // then we reference it
    data
  }
})

// if we want some HMR magic for it, we handle
// the hot update like below. Notice we guard this
// code with "process.env.DEV" -- so this doesn't
// gets into our production build (and it shouldn't).
if (process.env.DEV && module.hot) {
  module.hot.accept(['./data'], () => {
    const newData = require('./data').default
    store.hotUpdate({ modules: { data: newData } })
  })
}

export default store