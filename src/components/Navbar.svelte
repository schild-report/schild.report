<script>
  import Autocomplete from "./Autocomplete.svelte";
  import Schueler from './Schueler.svelte';
  import Klasse from './Klasse.svelte'
  import Einstellungen from "./Einstellungen.svelte";
  import { configData, state } from './../stores.js';
  import { join, dirname } from 'path'
  import { writeFile, existsSync, mkdirSync } from 'fs'
  import { shell } from 'electron'
  import snarkdown from 'snarkdown'

  function ensureDirectoryExistence (filePath) {
    const dir = dirname(filePath)
    if (existsSync(dir)) {
      return true
    }
    ensureDirectoryExistence(dir)
    mkdirSync(dir)
  }

  const open_pdf = async _ => {
    console.log('öffne PDF')
    const s = $state.schueler[0]
    const schuelerName = $state.schueler.length === 1 ? `${s.Name}_` : ''
    const d = $state.dokument.replace(/\.[^/.]+$/, "")
    const jahr = $state.jahr
    const abschnitt = $state.abschnitt
    const pdfName = `${jahr}_${abschnitt}_${s.Klasse}_${schuelerName}${d}.pdf`
    const pdfPath = join($configData.pdf, jahr.toString(), pdfName)
    const options = {
      marginsType: 1,
      printBackground: true
    }
    try {
      const data = await $state.webview.printToPDF(options)
      ensureDirectoryExistence(pdfPath)
      writeFile(pdfPath, data, error => {
        if (error) throw error
      })
      shell.openItem(pdfPath)
    } catch (e) {
      throw e
    }
  }

  const toggle_mark = async _ => {
    $state.set_mark = !$state.set_mark
    $state.webview.send('set_mark', $state.set_mark)
  }
  const toggle_edit = async _ => {
    $state.set_edit = !$state.set_edit
    $state.webview.send('set_edit', $state.set_edit)
  }
  const toggle_comment = _ => {
    $state.show_comment = !$state.show_comment
    console.log('comment:',$state.show_comment)
  }
  const open_devtools = async _ => {
    const open = $state.webview.isDevToolsOpened()
    open || $state.webview.openDevTools()
    const data = {
      schule: $state.schule,
      klasse: $state.klasse,
      schueler: $state.schueler,
      jahr: $state.jahr,
      abschnitt: $state.abschnitt,
      privat: $configData.privateDaten
    }
    $state.webview.send('open_devtools', data)
  }
  const kommentar = _ => snarkdown($state.kommentar)
</script>

<nav class="navbar is-info">
  <div class="navbar-item">
      <div class="has-text-white-ter brand is-size-7"
          on:click={()=>$state.component = Einstellungen}>
      <b>{$state.schule.Bezeichnung1}</b>
      <br> {$state.schule.Bezeichnung2}
    </div>
    <Autocomplete />
    {#if !$state.component}
      <button class="button" on:click={()=>$state.component = $state.zurueck_zu.status ? Schueler : Klasse}>
        <span class="icon"><i class="mdi">{$state.zurueck_zu.status ? 'person':'people'}</span>
      </button>
      <button class="button is-primary" on:click={open_pdf}>PDF erstellen</button>
    {/if}
  </div>
  {#if !$state.component}
    <div class="navbar-end">
      <div class="navbar-item has-dropdown is-hoverable">
        <span class="navbar-link" style="font-variant-numeric: tabular-nums;">{$state.jahr}/{$state.abschnitt}</span>
        <div class="navbar-dropdown">
          {#each $state.schueler[0].abschnitte as a}
            <span class="navbar-item"
                  class:has-text-danger={$state.jahr === a.Jahr && $state.abschnitt === a.Abschnitt}
                  style="cursor: pointer"
                  on:click={()=>{$state.jahr = a.Jahr; $state.abschnitt = a.Abschnitt}}
            >{a.Jahr}/{a.Abschnitt}</span>
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
              <i class="mdi" class:has-text-warning={$state.set_edit} on:click={toggle_edit}>edit</i>
            </span>
          </button>
          <button class="button is-link">
            <span class="icon">
              <i class="mdi" class:has-text-warning={$state.set_mark} on:click={toggle_mark}>warning</i>
            </span>
          </button>
          <div class="navbar-item has-dropdown is-hoverable">
            <div class="dropdown is-hoverable is-right">
              <div class="dropdown-trigger">
                <button class="button is-link" disabled={!$state.kommentar}>
                  <span class="icon">
                    <i class="mdi">comment</i>
                  </span>
                </button>
              </div>
              {#if $state.kommentar}
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                  <div class="dropdown-content" style="width: 50rem">
                    <div class="dropdown-item">
                        <p class="card-header-title"> Information</p>
                    </div>
                    <hr class="dropdown-divider">
                    <div class="dropdown-item">
                      {@html kommentar()}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
      </div>
    </div>
  {/if}
</nav>

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
</style>