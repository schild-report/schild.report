<script>
  import { schild } from './App.svelte'
  import { configData, connected } from './../stores.js';
  import { focus } from './../helfer.js';

  let fehler = false
  const db = $configData?.db.connection || {}

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
      <p class="control">
        <label class="label">Server
          <input class="input"
          type="text"
          placeholder="z.B. localhost oder 192.168.178.99"
          use:focus
          on:keydown={key}
          bind:value={db.host}>
        </label>
        </p>
    </div>
    <div class="field">
      <p class="control">
        <label class="label">Datenbank
          <input class="input"
          type="text"
          placeholder="Datenbank"
          on:keydown={key}
          bind:value={db.database}>
        </label>
      </p>
    </div>
    <div class="field">
      <p class="control">
        <label class="label">Benutzer
          <input class="input"
          type="text"
          placeholder="Benutzername"
          on:keydown={key}
          bind:value={db.user}>
        </label>
      </p>
    </div>
    <div class="field">
      <p class="control">
        <label class="label">Passwort
          <input class="input"
          type="password"
          placeholder="Passwort"
          on:keydown={key}
          bind:value={db.password}>
        </label>
      </p>
    </div>
    <div class="field">
      <p class="control">
        <label class="label checkbox">
          <input type="checkbox" bind:checked={db.dateStrings}>
          Daten als String
        </label>
        Daten als String verwenden – verhindert Probleme bei Geburtsdaten etc.
      </p>
    </div>
    <div class="field">
      <p class="control">
        <label class="label">
          <input type="checkbox" bind:checked={db.debug}>
          MySQL Debug-Modus
        </label>
        Alle MySQL-Anfragen werden in der Konsole ausgegeben.
      </p>
    </div>
    <div class="field">
      <p class="control">
        <label class="label">Zeitzone
          <input class="input"
          type="text"
          placeholder="'local', 'Z' oder als Offset +HH:MM / -HH:MM"
          on:keydown={key}
          bind:value={db.timezone}>
        </label>
      </p>
    </div>
    <div class="field">
      <p class="control">
        <label class="label">Zeichensatz
          <input class="input"
          type="text"
          placeholder="utf8"
          on:keydown={key}
          bind:value={db.charset}>
        </label>
      </p>
    </div>
    <button class="button is-block is-link is-fullwidth"
            class:is-danger={fehler}
            class:is-success={$connected}
            on:click={connect}>{fehler ? 'Verbindung fehlgeschlagen' : 'Verbinden'}</button><br>
</div>