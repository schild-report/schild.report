<script>
  import { schild } from "./App.svelte";
  import { configData, connected } from "./../stores.js";
  import { focus } from "./../helfer.js";

  let tested=false
  let caption={"false":"Testen", "error":"Verbindung fehlgeschlagen", "success": "Verbindung erfolgreich"}
  const db = $configData?.db || {};

  const key = (e) => {
    tested=false
    if (e.key === "Enter") {
      connect();
      e.preventDefault();
    } else return;
  };
  const connect = async (_) => {
    try {
      await schild.connect(db);
      $connected = await schild.testConnection();
      $configData.db = db
      if (!$connected) {
        throw "Verbindungstest gescheitert";
      }
      tested="success"
    } catch (e) {
      console.log(e);
      tested="error"
    }
    setTimeout(() => {
      tested=false
    }, 3000);
  };
</script>

<p class="subtitle is-4 has-text-grey has-text-centered">Datenbank</p>
<br />
<div class="field">
  <div class="control">
    <label class="label" for="client"
      >Datenbank
      <div class="select">
        <select bind:value={db.client} name="client">
          <option value="mysql">MySQL/MariaDB</option>
          <option value="mssql">MSSQL</option>
        </select>
      </div>
    </label>
  </div>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Server
      <input
        class="input"
        type="text"
        placeholder="z.B. localhost oder 192.168.178.99"
        use:focus
        on:keydown={key}
        bind:value={db.connection.host}
      />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Port
      <input
        class="input"
        type="text"
        placeholder="Port"
        on:keydown={key}
        bind:value={db.connection.port}
      />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Datenbank
      <input
        class="input"
        type="text"
        placeholder="Datenbank"
        on:keydown={key}
        bind:value={db.connection.database}
      />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Benutzer
      <input
        class="input"
        type="text"
        placeholder="Benutzername"
        on:keydown={key}
        bind:value={db.connection.user}
      />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Passwort
      <input
        class="input"
        type="password"
        placeholder="Passwort"
        on:keydown={key}
        bind:value={db.connection.password}
      />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label">
      <input type="checkbox" bind:checked={db.connection.debug} />
      MySQL Debug-Modus
    </label>
    Alle MySQL-Anfragen werden in der Konsole ausgegeben.
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Zeitzone
      <input
        class="input"
        type="text"
        placeholder="'local', 'Z' oder als Offset +HH:MM / -HH:MM"
        on:keydown={key}
        bind:value={db.connection.timezone}
      />
    </label>
  </p>
</div>
<div class="field">
  <p class="control">
    <label class="label"
      >Zeichensatz
      <input
        class="input"
        type="text"
        placeholder="utf8"
        on:keydown={key}
        bind:value={db.connection.charset}
      />
    </label>
  </p>
</div>
<button
  class="button is-block is-link is-fullwidth"
  class:is-danger={ tested =="error"}
  class:is-success={$connected}
  on:click={connect}
  >{caption[tested]}</button
><br />
