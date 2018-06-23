/*
export const someAction = (state) => {}
 */

const nodeRequire = require('require-wrapper')
const schild = require('schild')

export const updateComponents = (state, data) => {
  delete nodeRequire.cache[nodeRequire.resolve(data + '/bundle.js')]
  const components = nodeRequire(data + '/bundle.js')
  state.commit('updateComponents', components)
}
export const updateSchild = (state, db) => {
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
  state.commit('data/updateKnex', db)

  schild.getSchule()
    .then((response) => {
      state.commit('data/updateSchule', response.toJSON())
    })
    .catch((error) => {
      console.log(error)
    })
}
