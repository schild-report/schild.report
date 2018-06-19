/*
export const someAction = (state) => {}
 */

const nodeRequire = require('require-wrapper')
export const updateComponents = (state, data) => {
  delete nodeRequire.cache[nodeRequire.resolve(data + '/bundle.js')]
  const components = nodeRequire(data + '/bundle.js')
  state.commit('updateComponents', components)
}
