const schild = require('schild')

export default ({ Vue }) => {
  Vue.prototype.$schild = schild
}
