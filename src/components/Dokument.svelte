<script>
  import { rollup } from "./App.svelte";
  import * as Comlink from "comlink";
  import {
    configData,
    component,
    set_edit,
    set_mark,
    error,
    repo,
    dokument,
    klasse,
    selected,
    jahr,
    abschnitt,
    kommentar,
    pdf_name,
    generic_pdf,
    webview,
    compiled_module,
    warten,
  } from "./../stores.js";
  import { join } from "path";

  export let schule;

  function callback(failure, result) {
    if (failure) {
      $error = failure.error;
    } else {
      $error = null;
      $compiled_module = result;
      set_dokument()
    }
    $warten = false;
  }
  export async function run_rollup(args) {
    $warten = true;
    $component = null;
    $dokument = args.file;
    $repo = args.repo;
    await set_repo();
    console.log("rollup starten...");
    const options = {
      source: join($configData.reports, args.repo, args.file),
      basedir: join($configData.reports, args.repo),
      rootdir: join($configData.reports),
      dest: join($configData.userData),
      debug: $configData.debug,
      cache: $configData.cache,
      write: $configData.write,
      source_maps: $configData.source_maps,
    };
    try {
      rollup.build(options, Comlink.proxy(callback));
    } catch (e) {
      console.log(e);
    }
  }

  let props = {}
  $: {
      // übergebe Auswahlinformation an das schuelerobjekt 
      if ($selected) {
					$selected.forEach(s => {
						s.gewaehltesJahr = $jahr;
						s.gewaehlteAbschnittsNummer = $abschnitt;
					});
			}
      props = {
        componentPath: join($configData.userData, "bundle.js"),
        compiled_module: $compiled_module,
        debug: $configData.debug,
        svelteProps: {
          // mache alle Informationen über das "auswahl" Objekt verfügbar
          // -> es ist nur ein Import im Dokument erforderlich, der einfach erweitert werden kann 
          auswahl: { 
              schule: schule, 
              klasse: $klasse, 
              schueler: $selected,
              jahr: $jahr,
              abschnitt: $abschnitt,
              privat: $configData.privateDaten,
              db: $configData.db,
            },
          // alternative Nutzung: 
          schule: schule,
          klasse: $klasse,
          schueler: $selected,
          jahr: $jahr,
          abschnitt: $abschnitt,
          privat: $configData.privateDaten,
          knexConfig: $configData.db,
        }
      }
  };

  $: props && set_props();

  async function set_props() {
    if ($component || !$webview) return;
    $webview.send("props", props);
  }
  async function set_dokument() {
    await $webview.send("props", props);
    $webview.send("set_dokument");
    $set_mark = true;
    $set_edit = false;
  }
  async function set_repo() {
    const base_url = `file2://${join($configData.reports, $repo)}/`;
    await $webview.loadURL(
      /*
      <!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><style>@media print{.noprint *{display:none;height:0;}}</style></head><body><div id="content" contenteditable="false"><svelte></svelte></div></body></html>
      */
     `data:text/html;charset=utf-8;base64,
      IDwhRE9DVFlQRSBodG1sPjxodG1sIGxhbmc9ImVuIj48aGVhZD48bWV0YSBjaGFyc2V0PSJ1dGYtOCI+PHN0eWxlPkBtZWRpYSBwcmludHsubm9wcmludCAqe2Rpc3BsYXk6bm9uZTtoZWlnaHQ6MDt9fTwvc3R5bGU+PC9oZWFkPjxib2R5PjxkaXYgaWQ9ImNvbnRlbnQiIGNvbnRlbnRlZGl0YWJsZT0iZmFsc2UiPjxzdmVsdGU+PC9zdmVsdGU+PC9kaXY+PC9ib2R5PjwvaHRtbD4=
      `,
      { baseURLForDataURL: base_url }
    );
  }

  function startup(node) {
    $webview = node;
    const console_message = (e) => {
      console.log("%cSvelte:", "color: blue", e.message);
    };
    const ipc_message = (e) => {
      switch (e.channel) {
        case "error_message":
          $error = e.args[0];
          console.log(e.args[0]);
          break;
        case "dokument_options": {
          const opts = e.args[0];
          $kommentar = opts.kommentar;
          $pdf_name = opts.pdf_name;
          $generic_pdf = opts.generic_pdf;
          break;
        }
      }
    };
    node.addEventListener("console-message", console_message);
    node.addEventListener("ipc-message", ipc_message);
    return {
      destroy() {
        node.removeEventListener("ipc-message", ipc_message);
        node.removeEventListener("console-message", console_message);
      },
    };
  }
</script>

<!-- svelte-ignore component-name-lowercase -->
<webview src="about:blank" preload="./preload.js" disablewebsecurity use:startup />
{#if $error}
  <div class="fehlermeldung">
    <div style="margin-bottom:1em">Bei der Verarbeitung des Dokuments ist folgender Fehler aufgetreten:</div>
    <div style="overflow:auto">
      <pre style="font-size:1.3rem; font-weigth:bold; color:white; background-color:rgba(100,100,100,0.8); white-space: pre-wrap;">{$error.message}</pre>
      <pre style="background-color:rgba(200, 220, 240, 0.8); white-space: pre-wrap;">{$error.stack}</pre>
    </div>
  </div>
{/if}

<style>
  webview {
    height: -webkit-fill-available;
  }
  .fehlermeldung {
    position: sticky;
    margin: auto;
    width: 90%;
    left: auto;
    height: 30%;
    border: 2px solid red;
    bottom: 1em;
    padding: 1em;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }
</style>
