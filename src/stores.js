import { writable } from 'svelte/store';
import configFile from './configstore';

export const configData = writable(configFile.store);
configData.subscribe(value => {
  configFile.set(value)
});

export const state = writable({
  klasse: [],
  schueler: [],
  schueler_sortiert: [[]],
  selected: [],
  reload: 1,
  abschnitt: {},
  repos: [],
  schule: {},
  connected: false,
  zurueck_zu: {},
  dokument: '',
  repo: '',
  set_mark: true
});