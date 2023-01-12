<script>
	import { fade } from 'svelte/transition';
  import Autocomplete from "./Autocomplete.svelte";
  import Schueler from "./Schueler.svelte";
  import Klasse from "./Klasse.svelte";
  import Einstellungen from "./Einstellungen.svelte";
  import Start from "./Start.svelte";
  import {
    configData,
    selected,
    dokument,
    jahr,
    generic_pdf,
    schueler,
    abschnitt,
    pdf_name,
    webview,
    set_edit,
    set_mark,
    klasse,
    component,
    error,
    kommentar,
    warten
  } from "./../stores.js";
  import { join, dirname } from "path";
  import { writeFile, existsSync, mkdirSync } from "fs";
  import { shell } from "electron";
  import snarkdown from "snarkdown";

  export let schule;
  let zurueck_zu;

  function ensureDirectoryExistence(filePath) {
    const dir = dirname(filePath);
    if (existsSync(dir)) {
      return true;
    }
    ensureDirectoryExistence(dir);
    try {
      mkdirSync(dir);
    } catch (e) {
      console.log(
        `Verzeichnis ${dir} konnte nicht erstellt werden: `,
        e.message
      );
    }
  }

  const open_pdf = async _ => {
    $warten = true;
    console.log("öffne PDF");
    const d = $dokument.replace(/\.[^/.]+$/, "");
    let pdfName;
    if ($generic_pdf) {
      pdfName = `${$pdf_name || d}.pdf`;
    } else {
      const s = $schueler[0];
      const schuelerName = $schueler.length === 1 ? `${s.Name}_` : "";
      pdfName = `${$jahr}_${$abschnitt}_${s.Klasse}_${schuelerName}${d}.pdf`;
    }
    const pdfPath = join($configData.pdf, $jahr.toString(), pdfName);
    const options = {
      margin: {top: 0, bottom: 0, left: 0, right: 0},
      printBackground: true,
      // pageSize: "A4",
      // wird per @page gesteuert
      preferCSSPageSize: true
    };
    try {
      const data = await $webview.printToPDF(options);
      ensureDirectoryExistence(pdfPath);
      writeFile(pdfPath, data, error => {
        if (error) throw error;
      });
      shell.openPath(pdfPath);
    } catch (e) {
      console.log(
        `PDF konnte nicht geöffnet oder geschrieben werden: `,
        e.message
      );
    }
    $warten = false;
  };

  const toggle_mark = async _ => {
    $set_mark = !$set_mark;
    $webview.send("set_mark", $set_mark);
  };
  const toggle_edit = async _ => {
    $set_edit = !$set_edit;
    $webview.send("set_edit", $set_edit);
  };
  const open_devtools = async _ => {
    const open = $webview.isDevToolsOpened();
    open || $webview.openDevTools();
    const data = {
      schule: schule,
      klasse: $klasse,
      schueler: $schueler,
      jahr: $jahr,
      abschnitt: $abschnitt,
      privat: $configData.privateDaten
    };
    $webview.send("open_devtools", data);
  };
  const md_kommentar = _ => snarkdown($kommentar);
  const einstellungen_oder_so = _ => {
    if ($component === Einstellungen) {
      if ($schueler?.length) {
        $component = zurueck_zu.status ? Schueler : Klasse;
      } else $component = Start;
    } else $component = Einstellungen;
  };
</script>

<style>
  .brand {
    text-transform: uppercase;
    padding-right: 10px;
    cursor: pointer;
  }
  .button {
    margin-right: 0.4rem;
    margin-left: 0.4rem;
  }
  .abschnittwahl:hover {
    background-color: hsl(0, 0%, 96%);
  }
</style>

<nav class="navbar is-info">
  <div class="navbar-item">
    <div
      in:fade="{{ duration: 2000 }}"
      class="has-text-white-ter brand is-size-7"
      on:click={() => ($component = Start)}>
      <b>{schule.Bezeichnung1 || 'schild.report'}</b>
      <br />
      {schule.Bezeichnung2 || ''}
    </div>
    <Autocomplete bind:zurueck_zu />
    {#if !$component}
      <button
        class="button"
        on:click={() => ($component = zurueck_zu.status ? Schueler : Klasse)}>
        <span class="icon">
          <i class="mdi">{zurueck_zu.status ? 'person' : 'people'}</i>
        </span>
      </button>
    {/if}
    {#if !$error && !$component}
      <button class="button is-primary"
              class:is-loading={$warten}
              on:click={open_pdf}
              disabled={$warten}>
        PDF erstellen
      </button>
    {/if}
  </div>
  <div class="navbar-end">
    {#if !$component && $schueler.length}
      <div class="navbar-item has-dropdown is-hoverable">
        <span class="navbar-link" style="font-variant-numeric: tabular-nums;">
          {$jahr}/{$abschnitt}
        </span>
        <div class="navbar-dropdown">
          {#each $selected[0].abschnitte as a}
            <span
              class="navbar-item abschnittwahl"
              class:has-background-success={$jahr === a.Jahr && $abschnitt === a.Abschnitt}
              class:has-text-white={$jahr === a.Jahr && $abschnitt === a.Abschnitt}
              style="cursor: pointer"
              on:click={() => {
                $jahr = a.Jahr;
                $abschnitt = a.Abschnitt;
              }}>
              {a.Jahr}/{a.Abschnitt}
            </span>
          {/each}
        </div>
      </div>
      <div class="navbar-item">
        <button class="button is-link">
          <span class="icon">
            <i class="mdi" on:click={open_devtools}>code</i>
          </span>
        </button>
        <button class="button is-link">
          <span class="icon">
            <i
              class="mdi"
              class:has-text-warning={$set_edit}
              on:click={toggle_edit}>
              edit
            </i>
          </span>
        </button>
        <button class="button is-link">
          <span class="icon">
            <i
              class="mdi"
              class:has-text-warning={$set_mark}
              on:click={toggle_mark}>
              warning
            </i>
          </span>
        </button>
        <div class="navbar-item has-dropdown is-hoverable">
          <div class="dropdown is-hoverable is-right">
            <div class="dropdown-trigger">
              <button class="button is-link" disabled={!$kommentar}>
                <span class="icon">
                  <i class="mdi">comment</i>
                </span>
              </button>
            </div>
            {#if $kommentar}
              <div class="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content" style="width: 50rem">
                  <div class="dropdown-item">
                    <p class="card-header-title">Information</p>
                  </div>
                  <hr class="dropdown-divider" />
                  <div class="dropdown-item">
                    {@html md_kommentar()}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
    <div class="navbar-item">
      <button class="button is-info">
        <span class="icon">
          <i class="mdi" on:click={einstellungen_oder_so}>settings</i>
        </span>
      </button>
    </div>
  </div>
</nav>