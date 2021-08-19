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

  $: props = {
    componentPath: join($configData.userData, "bundle.js"),
    compiled_module: $compiled_module,
    debug: $configData.debug,
    svelteProps: {
      schule: schule,
      klasse: $klasse,
      schueler: $selected,
      jahr: $jahr,
      abschnitt: $abschnitt,
      privat: $configData.privateDaten,
      knexConfig: $configData.db,
    },
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
<webview src="about:blank" preload="./preload.js" use:startup />
{#if $error}
  <div class="fehlermeldung">
    <h3 class="is-size-3">{$error.message}</h3>
    <pre>{$error.stack}</pre>
  </div>
{/if}

<style>
  webview {
    height: -webkit-fill-available;
  }
  .fehlermeldung {
    position: absolute;
    left: 250px;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    width: 100%;
    height: 200px;
    overflow: auto;
  }
</style>
