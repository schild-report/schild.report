<script>
  import { configData, component, set_edit, set_mark, error, repo, state, dokument,
  plugin, plugin_entry, schule, klasse, selected, jahr, abschnitt, schueler_sortiert, reload,
  kommentar, pdf_name, generic_pdf, webview } from './../stores.js';
  import { join } from 'path'

  $: props = {
    componentPath: !$plugin ? join($configData.userData, 'bundle.js') : join($plugin || '', $plugin_entry || ''),
    debug: $configData.debug,
    svelteProps: {
      schule: $schule,
      klasse: $klasse,
      schueler: $selected && $selected.length ? $selected : [],
      jahr: $jahr,
      abschnitt: $abschnitt,
      privat: $configData.privateDaten,
      knexConfig: $configData.db
    }
  }
  $: if ($reload > 1) set_repo()
  $: $reload > 1 && component && set_destroy()
  $: props && set_props()

  async function set_destroy () {
    $plugin = null
    $reload = 1
    $webview && await $webview.send('destroy')
  }
  async function set_props () {
    if ($component) return
    $webview && await $webview.send('props', props)
  }
  async function set_dokument () {
    await $webview.send('props', props)
    $webview.send('set_dokument')
    $set_mark = true
    $set_edit = false
    $webview.removeEventListener('dom-ready', set_dokument)
  }
  async function set_repo () {
    $error = null
    if ($component) return
    const base_url = `file2://${$plugin ? join($plugin) : join($configData.reports, $repo)}/`
    $webview.loadURL(
      // <!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
      // <style>@media print{.noprint *{display:none;height:0;}}</style></head>
      // <body><div id="content" contenteditable="false"><svelte></svelte></div></body></html>
      `data:text/html;charset=utf-8;base64,
      PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9InV0Zi04
      Ij48c3R5bGU+QG1lZGlhIHByaW50ey5ub3ByaW50ICp7ZGlzcGxheTpub25lO2hlaWdodDowO319
      PC9zdHlsZT48L2hlYWQ+PGJvZHk+PGRpdiBpZD0iY29udGVudCIgY29udGVudGVkaXRhYmxlPSJm
      YWxzZSI+PHN2ZWx0ZT48L3N2ZWx0ZT48L2Rpdj48L2JvZHk+PC9odG1sPg==
      `
      , {baseURLForDataURL: base_url})
    $webview.addEventListener('dom-ready', set_dokument)
  }

	function startup (node) {
    $webview = node
    const console_message = e => {
      console.log('%cSvelte:', 'color: blue', e.message)
    }
    const ipc_message = e => {
      switch (e.channel) {
        case 'error_message': $error = e.args[0];console.log(e.args[0]); break
        case 'dokument_options': {
          const opts = e.args[0]
          $kommentar = opts.kommentar
          $pdf_name = opts.pdf_name
          $generic_pdf = opts.generic_pdf
          break
        }
      }
    }
    node.addEventListener('console-message', console_message)
    node.addEventListener('ipc-message', ipc_message)
    return {
			destroy() {
        node.removeEventListener('ipc-message', ipc_message)
        node.removeEventListener('console-message', console_message)
			}
		};
	};
</script>

<webview src="about:blank"
         preload="./preload.js"
         use:startup
></webview>
{#if $error}
  <div class="fehlermeldung">
    <h3 class="is-size-3">{$error.message}</h3>
    <pre>{$error.stack}</pre>
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
