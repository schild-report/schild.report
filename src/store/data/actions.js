/*
export const someAction = (state) => {}
 */

const nodeRequire = require('require-wrapper')
export const updateComponents = (state, data) => {
  const components = nodeRequire(data + '/bundle.js')
  state.commit('updateComponents', components)
}
