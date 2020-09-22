import { writable } from "svelte/store";
import { ipcRenderer } from 'electron';

export const configData = writable();
const store = ipcRenderer.invoke("get_store").then((res) => {
  configData.set(res);
  configData.subscribe((value) => {
    ipcRenderer.invoke("set_store", value);
  });
  return res
});
export const db = writable(store.then(res=>res.db))
export const klasse = writable();
export const schueler = writable();
export const schueler_sortiert = writable();
export const selected = writable();
export const reload = writable(1);
export const abschnitt = writable();
export const jahr = writable();
export const plugin = writable();
export const plugin_entry = writable();
export const dokument = writable();
export const repo = writable();
export const set_mark = writable(true);
export const set_edit = writable();
export const error = writable();
export const kommentar = writable();
export const pdf_name = writable();
export const generic_pdf = writable();
export const user = writable();
export const component = writable();
export const connected = writable();
export const webview = writable();
export const warten = writable();
export const compiled_module = writable();
export const dokument_component = writable();
