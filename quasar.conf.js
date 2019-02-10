module.exports = function (ctx) {
  return {
    boot: [ 'config.js' ],
    css: [ 'app.styl' ],
    extras: [
      'roboto-font',
      'material-icons' // optional, you are not bound to it
      // 'ionicons-v4',
      // 'mdi-v3',
      // 'fontawesome-v5',
      // 'eva-icons'
    ],
    framework: {
      components: [
        'QAvatar',
        'QBreadcrumbs',
        'QBreadcrumbsEl',
        'QBtn',
        'QCard',
        'QCardSection',
        'QCheckbox',
        'QDialog',
        'QDrawer',
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
      // vueRouterMode: 'history',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack (cfg) {
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
      // https: true,
      // port: 8080,
      open: false // opens browser window automatically
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
