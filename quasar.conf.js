const MonocoEditorPlugin = require('monaco-editor-webpack-plugin')

module.exports = function (ctx) {
  return {
    boot: [ 'config.js' ],
    css: [ 'app.styl' ],
    extras: [
      'roboto-font',
      'material-icons'
    ],
    framework: {
      components: [
        'QAvatar',
        'QBtn',
        'QCard',
        'QCardSection',
        'QCheckbox',
        'QDialog',
        'QDrawer',
        'QExpansionItem',
        'QFab',
        'QFabAction',
        'QHeader',
        'QIcon',
        'QImg',
        'QInput',
        'QItem',
        'QItemLabel',
        'QItemSection',
        'QLayout',
        'QList',
        'QPage',
        'QPageContainer',
        'QPageSticky',
        'QSelect',
        'QSeparator',
        'QSpace',
        'QTable',
        'QTabs',
        'QTab',
        'QTd',
        'QTh',
        'QToolbar',
        'QToolbarTitle',
        'QTooltip',
        'QTr'
      ],
      directives: [ ],
      plugins: [ ]
    },
    supportIE: false,
    build: {
      scopeHoisting: true,
      extendWebpack (cfg) {
        cfg.plugins.push(
          new MonocoEditorPlugin({
            // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
            // Include a subset of languages support
            // Some language extensions like typescript are so huge that may impact build performance
            // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
            // Languages are loaded on demand at runtime
            languages: ['javascript', 'css', 'html']
          })
        )
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            cache: true
          }
        })
      }
    },
    devServer: {
      open: false
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack (cfg) {
        // do something with Electron process Webpack cfg
      },
      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      },
      builder: {
        // https://www.electron.build/configuration/configuration
        // appId: 'quasar-app'
      }
    }
  }
}
