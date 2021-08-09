<script>
  import { schild } from "./App.svelte";
  import { user } from "./../stores.js";
  import { focus } from "./../helfer.js";

  let username = "";
  let password = "";
  let fehler = false;

  function crypt(password) {
    const p = Array.from(password);
    return String.fromCodePoint(
      ...p
        .map((c) => c.codePointAt(0))
        .map((c) => Math.floor(c / 16) * 32 + 15 - c)
    );
  }

  const key = (e) => {
    if (e.key === "Enter") {
      authorize();
      e.preventDefault();
    } else return;
  };
  const authorize = async (_) => {
    try {
      const u = await schild.getNutzer(username);
      if (u.US_Password === crypt(password)) $user = u;
      else throw "Fehler";
    } catch (e) {
      console.log(e);
      fehler = true;
    }
  };
</script>

<p class="subtitle is-4 has-text-grey">schild.report</p>
<br />
<div class="field">
  <p class="control">
    <input
      class="input is-medium"
      type="text"
      placeholder="Schild-Benutzername"
      use:focus
      bind:value={username}
    />
  </p>
</div>
<div class="field">
  <p class="control">
    <input
      class="input is-medium"
      type="password"
      placeholder="Passwort"
      on:keydown={key}
      bind:value={password}
    />
  </p>
</div>
<button
  class="button is-block is-link is-large is-fullwidth"
  class:is-danger={fehler}
  on:click={authorize}>{fehler ? "Benutzerdaten falsch" : "Anmelden"}</button
><br />
