<script>
  import { configData } from "./../stores.js";
  import { clear } from "idb-keyval";
</script>

<p class="subtitle is-4 has-text-grey has-text-centered">
  Erweiterte Einstellungen
</p>
<br />
<div class="field">
  <p class="control">
    <label class="label">
      <input type="checkbox" bind:checked={$configData.debug} />
      Svelte Debug
    </label>
  </p>
  <p>
    Den Debug-Modus in Svelte aktivieren. Diese Einstellung velangsamt die
    Kompilierung der Dokumente, kann aber dafür genutzt werden, um z.B.
    Informationen über die verwendenen Komponentnen zu bekommen oder
    <code>{`{@debug}`}</code>Anweisungen im Code zu verteilen. Z.b. kann man
    damit
    <code>{`{@debug schueler}`}</code>
    setzen, das in der Konsole dann jede Veränderung von schueler ausgibt.
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label">
      <input type="checkbox" bind:checked={$configData.certificate_errors} />
      Unsichere Zertifikate zulassen
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label">
      <input type="checkbox" bind:checked={$configData.write} />
      Rollup Bundle schreiben
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label">
      <input type="checkbox" bind:checked={$configData.source_maps} />
      Source Maps erstellen
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label">
      <input type="checkbox" bind:checked={$configData.cache} />
      Cache verwenden
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <button class="button is-warning" on:click={(_) => clear()}
      >Cache leeren</button
    >
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Reportverzeichnis
      <input class="input" type="text" bind:value={$configData.reports} />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >PDF-Verzeichnis
      <input class="input" type="text" bind:value={$configData.pdf} />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Datenverzeichnis
      <input class="input" type="text" bind:value={$configData.userData} />
    </label>
  </p>
</div>
