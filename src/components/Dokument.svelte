<script>
  import { schild } from './App.svelte'
  import { onMount } from 'svelte';
  import { configData, state } from './../stores.js';
  import { join } from 'path'

  let webview, error

  $: props = {
    file: join($configData.reports, $state.dokument),
    componentPath: join($configData.userData, 'bundle.js'),
    debug: $configData.debug,
    svelteProps: {
      schule: $state.schule,
      klasse: $state.klasse,
      schueler: $state.selected.length ? $state.selected : $state.schueler_sortiert[0][1],
      jahr: $state.jahr,
      abschnitt: $state.abschnitt,
      privat: $configData.privateDaten,
      knexConfig: $configData.db
    }
  }
  $: reload = $state.reload
  $: if (reload > 1) set_repo()
  $: props && set_props()
  $: $state.component && set_destroy()

  async function set_destroy () {
    if ($state.component) return
    webview && await webview.send('destroy')
  }
  async function set_props () {
    if ($state.component) return
    webview && await webview.send('props', props)
  }
  async function set_dokument () {
    await webview.send('props', props)
    webview.send('set_dokument')
    $state.set_mark = true
    $state.set_edit = false
  }
  async function set_repo () {
    error = null
    if ($state.component) return
    webview.loadURL(
      // <!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
      // <style>@media print{.noprint *{display:none;height:0;}}</style></head>
      // <body><div id="content" contenteditable="false"><svelte></svelte></div></body></html>
      `data:text/html;charset=utf-8;base64,
      PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9InV0Zi04
      Ij48c3R5bGU+QG1lZGlhIHByaW50ey5ub3ByaW50ICp7ZGlzcGxheTpub25lO2hlaWdodDowO319
      PC9zdHlsZT48L2hlYWQ+PGJvZHk+PGRpdiBpZD0iY29udGVudCIgY29udGVudGVkaXRhYmxlPSJm
      YWxzZSI+PHN2ZWx0ZT48L3N2ZWx0ZT48L2Rpdj48L2JvZHk+PC9odG1sPg==
      `
      , { baseURLForDataURL: `file://${join($configData.reports, $state.repo)}/` })
    webview.addEventListener('dom-ready', set_dokument)
  }

	onMount(async () => {
    $state.webview = webview
    webview.addEventListener('console-message', (e) => {
      console.log('%cSvelte:', 'color: blue', e.message)
    })
    webview.addEventListener('ipc-message', (event) => {
      switch (event.channel) {
        case 'error_message': error = event.args[0];console.log(event.args[0]); break
        case 'svelte_comment': $state.kommentar = (event.args[0]); break
      }
    })
	});
</script>

<webview src="about:blank"
         preload="./preload.js"
         bind:this={webview}
></webview>
{#if error}
  <div class="fehlermeldung">
    <h3 class="is-size-3">{error.message}</h3>
    <pre>{error.stack}</pre>
  </div>
{/if}

<style>
  webview { height: -webkit-fill-available; }
  .fehlermeldung {
    position: absolute;
    left: 250px;
    bottom: 0;
    background: rgba(255,255,255,.9);
    width: 100%;
    height: 200px;
    overflow: auto;
  }
</style>
