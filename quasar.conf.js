// Configuration for your app
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const NormalModuleReplacementPlugin = require('webpack').NormalModuleReplacementPlugin

module.exports = function (ctx) {
  return {
    // app plugins (/src/plugins)
    plugins: [
      'vuex', 'schild'
    ],
    css: [
      'app.styl'
    ],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      'material-icons'
      // 'ionicons',
      // 'mdi',
      // 'fontawesome'
    ],
    supportIE: false,
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      // useNotifier: false,
      extendWebpack (cfg) {
        cfg.devtool = 'eval'
        cfg.plugins.push(new UglifyJsPlugin({uglifyOptions: {mangle: false}}))
        cfg.plugins.push(new NormalModuleReplacementPlugin(/\.\.\/migrate/, '../util/noop.js'))
        cfg.plugins.push(new NormalModuleReplacementPlugin(/\.\.\/seed/, '../util/noop.js'))
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar|dist|plugins)/
        })
        cfg.module.noParse = /require-wrapper/
        cfg.externals = {
          'sqlite3': 'sqlite3',
          'mariasql': 'mariasql',
          'mssql': 'mssql',
          'mysql2': 'mysql2',
          'oracle': 'oracle',
          'strong-oracle': 'strong-oracle',
          'oracledb': 'oracledb',
          'pg': 'pg',
          'pg-query-stream': 'pg-query-stream'
        }
      }
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: false // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QAutocomplete',
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QPageContainer',
        'QPage',
        'QProgress',
        'QSearch',
        'QTable',
        'QTh',
        'QTr',
        'QTd',
        'QTableColumns',
        'QToolbar',
        'QToolbarTitle',
        'QTooltip',
        'QBtn',
        'QIcon',
        'QInput',
        'QCheckbox',
        'QList',
        'QListHeader',
        'QItem',
        'QItemMain',
        'QItemSide',
        'QItemTile',
        'QCard',
        'QCardTitle',
        'QCardMain',
        'QCardSeparator',
        'QFab',
        'QFabAction',
        'QPageSticky',
        'QBreadcrumbs',
        'QBreadcrumbsEl'
      ],
      directives: [
        'Ripple'
      ],
      // Quasar plugins
      plugins: [
        'Notify',
        'Loading'
      ]
    },
    // animations: 'all' --- includes all animations
    animations: [
    ],
    pwa: {
      cacheExt: 'js,html,css,ttf,eot,otf,woff,woff2,json,svg,gif,jpg,jpeg,png,wav,ogg,webm,flac,aac,mp4,mp3',
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      extendWebpack (cfg) {
        // do something with cfg
      },
      packager: {
        asar: true
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      }
    },

    // leave this here for Quasar CLI
    starterKit: '1.0.0'
  }
}
