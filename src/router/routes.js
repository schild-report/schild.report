import Layout from 'layouts/default'
import Datenbank from 'layouts/datenbank'
import Login from 'layouts/login'
import Index from 'pages/index'
import Klasse from 'pages/klasse'
import Schueler from 'pages/schueler'
import Dokument from 'pages/dokument'
import Einstellungen from 'pages/einstellungen'
import store from '../store'
import ipc from 'electron-better-ipc'

export default [
  {
    path: '/',
    component: Layout,
    beforeEnter: (to, from, next) => {
      ipc.callMain('schildGetSchule')
        .then(response => {
          store.commit('data/updateSchule', response)
        })
        .catch((error) => {
          console.log(error)
        })

      if (store.state.data.auth) next()
      else next({ name: 'login' })
    },
    children: [
      { path: '', component: Index },
      { path: 'klasse/:id', name: 'klasse', component: Klasse },
      { path: 'schueler/:id', name: 'schueler', component: Schueler },
      { path: 'app/einstellungen', name: 'einstellungen', component: Einstellungen },
      { path: 'dokument/:repo/:id', name: 'dokument', component: Dokument }
    ]
  },
  { path: '/app/datenbank', name: 'datenbank', component: Datenbank },
  { path: '/app/login', name: 'login', component: Login },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
