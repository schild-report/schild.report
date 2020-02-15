import { writable } from 'svelte/store';
import configFile from './configstore';

export const configData = writable(configFile.store);
configData.subscribe(value => {
  configFile.set(value)
});

export const schueler_sortiert = writable()
export const klasse = writable()
export const schueler = writable()
export const selected = writable()
export const reload = writable(1)
export const abschnitt = writable()
export const jahr = writable()
export const plugin = writable()
export const plugin_entry = writable()
export const repos = writable()
export const schule = writable()
export const zurueck_zu = writable()
export const dokument = writable()
export const repo = writable()
export const set_mark = writable(true)
export const set_edit = writable()
export const gewaehlt = writable()
export const error = writable()
export const kommentar = writable()
export const pdf_name = writable()
export const generic_pdf = writable()
export const user = writable()
export const component = writable()
export const state = writable()
export const connected = writable(false)
export const webview = writable(false)
// export const state = writable({
//   klasse: [],
//   schueler: [],
//   selected: [],
//   reload: 1,
//   abschnitt: {},
//   repos: [],
//   schule: {},
//   connected: false,
//   zurueck_zu: {},
//   dokument: '',
//   repo: '',
//   set_mark: true
// });