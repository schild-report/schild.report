import Layout from 'layouts/default'
import Index from 'pages/index'
import Klasse from 'pages/klasse'
import Schueler from 'pages/schueler'
import Dokument from 'pages/dokument'
import Einstellungen from 'pages/einstellungen'
import Datenbank from 'layouts/datenbank'
import Login from 'layouts/login'
const Editor = () => import('pages/editor')

export default [
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: Index },
      { path: 'klasse', name: 'klasse', component: Klasse },
      { path: 'schueler', name: 'schueler', component: Schueler },
      { path: 'app/einstellungen', name: 'einstellungen', component: Einstellungen },
      { path: 'dokument/:repo/:id', name: 'dokument', component: Dokument }
    ]
  },
  { path: '/app/datenbank', name: 'datenbank', component: Datenbank },
  { path: '/app/login', name: 'login', component: Login },
  { path: '/app/editor', name: 'editor', component: Editor },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
