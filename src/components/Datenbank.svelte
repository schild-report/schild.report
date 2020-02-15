<script>
  import { schild } from './App.svelte'
  import { configData, connected } from './../stores.js';
  import { focus } from './../helfer.js';

  let fehler = false
  const db = $configData.db && $configData.db.connection || {}

  const key = e => {
    if (e.key === "Enter") {
      connect()
      e.preventDefault();
    } else return
  };
  const connect = async _ => {
    try {
      await schild.connect({client: 'mysql', connection: db})
      $connected = await schild.testConnection()
      fehler = false
      $configData.db = {client: 'mysql', useNullAsDefault: true, connection: db}
      if (!$connected) throw 'Fehler'
    } catch (e) {
      console.log(e)
      fehler = true
    }
  }
</script>

<div class="box">
  <p class="subtitle is-4 has-text-grey has-text-centered">Datenbank</p><br>
    <div class="field">
      <label class="label">Server</label>
      <p class="control">
        <input class="input"
                type="text"
                placeholder="z.B. localhost oder 192.168.178.99"
                use:focus
                on:keydown={key}
                bind:value={db.host}>
      </p>
    </div>
    <div class="field">
      <label class="label">Datenbank</label>
      <p class="control">
        <input class="input"
                type="text"
                placeholder="Datenbank"
                on:keydown={key}
                bind:value={db.database}>
      </p>
    </div>
    <div class="field">
      <label class="label">Benutzer</label>
      <p class="control">
        <input class="input"
                type="text"
                placeholder="Benutzername"
                on:keydown={key}
                bind:value={db.user}>
      </p>
    </div>
    <div class="field">
      <label class="label">Passwort</label>
      <p class="control">
        <input class="input"
                type="password"
                placeholder="Passwort"
                on:keydown={key}
                bind:value={db.password}>
      </p>
    </div>
    <div class="field">
      <label class="label">Daten als String</label>
      <p class="control">
        <label class="checkbox">
          <input type="checkbox" bind:checked={db.dateStrings}>
            Daten als String verwenden – verhindert Probleme bei Geburtsdaten etc.
        </label>
      </p>
    </div>
    <div class="field">
      <label class="label">MySQL Debug-Modus</label>
      <p class="control">
        <label class="checkbox">
          <input type="checkbox" bind:checked={db.debug}>
          Alle MySQL-Anfragen werden in der Konsole ausgegeben.
        </label>
      </p>
    </div>
    <div class="field">
      <label class="label">Zeitzone</label>
      <p class="control">
        <input class="input"
                type="text"
                placeholder="'local', 'Z' oder als Offset +HH:MM / -HH:MM"
                on:keydown={key}
                bind:value={db.timezone}>
      </p>
    </div>
    <div class="field">
      <label class="label">Zeichensatz</label>
      <p class="control">
        <input class="input"
                type="text"
                placeholder="utf8"
                on:keydown={key}
                bind:value={db.charset}>
      </p>
    </div>
    <button class="button is-block is-link is-fullwidth"
            class:is-danger={fehler}
            class:is-success={$connected}
            on:click={connect}>{fehler ? 'Verbindung fehlgeschlagen' : 'Verbinden'}</button><br>
</div>