  <script>
    import { configData } from './../stores.js';
  </script>

<div class="box">
  <p class="subtitle is-4 has-text-grey has-text-centered">Erweiterte Einstellungen</p><br>
  <div class="field">
    <p class="control">
      <label class="checkbox">
        <input type="checkbox" bind:checked={$configData.debug}>
        Svelte Debug
      </label>
      </p>
      <p>
        Den Debug-Modus in Svelte aktivieren. Diese Einstellung velangsamt
        die Kompilierung der Dokumente, kann aber dafür genutzt werden, um
        z.B. Informationen über die verwendenen Komponentnen zu bekommen oder
        <code>{`{@debug}`}</code>Anweisungen im Code zu verteilen. Z.b. kann man damit
        <code>{`{@debug schueler}`}</code> setzen, das in der Konsole dann
        jede Veränderung von schueler ausgibt.
    </p>
  </div>
  <div class="field">
    <label class="label">Reportverzeichnis</label>
    <p class="control">
      <input class="input"
              type="text"
              bind:value={$configData.reports}>
    </p>
  </div>
  <div class="field">
    <label class="label">PDF-Verzeichnis</label>
    <p class="control">
      <input class="input"
              type="text"
              bind:value={$configData.pdf}>
    </p>
  </div>
  <div class="field">
    <label class="label">Datenverzeichnis</label>
    <p class="control">
      <input class="input"
              type="text"
              bind:value={$configData.userData}>
    </p>
  </div>
</div>