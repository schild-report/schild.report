import { writable } from "svelte/store";
import { ipcRenderer } from 'electron';

export const configData = writable(undefined);
const store = ipcRenderer.invoke("get_store").then((res) => {
  configData.set(res);
  configData.subscribe((value) => {
    ipcRenderer.invoke("set_store", value);
  });
  return res
});
export const db = writable(store.then(res=>res.db))
export const klasse = writable(undefined);
export const schueler = writable(undefined);
export const schueler_sortiert = writable(undefined);
export const selected = writable(undefined);
export const abschnitt = writable(undefined);
export const jahr = writable(undefined);
export const dokument = writable(undefined);
export const repo = writable(undefined);
export const set_mark = writable(true);
export const set_edit = writable(undefined);
export const error = writable(undefined);
export const kommentar = writable(undefined);
export const pdf_name = writable(undefined);
export const generic_pdf = writable(undefined);
export const user = writable(undefined);
export const component = writable(undefined);
export const connected = writable(undefined);
export const webview = writable(undefined);
export const warten = writable(undefined);
export const compiled_module = writable(undefined);
export const dokument_component = writable(undefined);
