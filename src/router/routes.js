import DefaultLayout from 'layouts/default'
import Datenbank from 'layouts/datenbank'
import Login from 'layouts/login'
import Index from 'pages/index'
import Klasse from 'pages/klasse'
import Schueler from 'pages/schueler'
import Dokument from 'pages/dokument'
import Einstellungen from 'pages/einstellungen'
import store from '../store'

export default [
  {
    path: '/',
    component: DefaultLayout,
    beforeEnter: (to, from, next) => {
      if (!store.state.data.auth) {
        next({name: 'login'})
      } else next()
    },
    children: [
      { path: '', component: Index },
      { path: 'klasse/:id', name: 'klasse', component: Klasse },
      { path: 'schueler/:id', name: 'schueler', component: Schueler },
      { path: 'app/einstellungen', name: 'einstellungen', component: Einstellungen },
      { path: 'dokument/:id', name: 'dokument', component: Dokument }
    ]
  },
  { path: '/app/datenbank', name: 'datenbank', component: Datenbank },
  { path: '/app/login', name: 'login', component: Login },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
