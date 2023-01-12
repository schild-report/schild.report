<script context="module">
  import * as Comlink from "comlink";
  export const schild = Comlink.wrap(new Worker("./schild_worker.js"));
  export const repo_worker = Comlink.wrap(new Worker("./repo_worker.js"));
  export const rollup = Comlink.wrap(new Worker("./rollup_worker.js"));
</script>

<script>
  import { db, connected, user } from "./../stores.js";
  import VERSION from "./../version";
  import Main from "./Main.svelte";
  import Intro from "./Intro.svelte";

  const production = VERSION.production;

  const init = async () => {
    try {
      await schild.connect(await $db);
      $connected = await schild.testConnection();
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
</script>

{#await init()}
  <div class="box">
    <div class="mitte">
      Verbinde mit der Datenbank...
      <progress class="progress is-small is-primary" max="100" />
    </div>
  </div>
{:then}
  {#if $connected && ($user || !production)}
    <Main />
  {:else}
    <Intro />
  {/if}
{:catch}
  <Intro />
{/await}

<style>
  .box { display: grid; height: 100vh; }
  .mitte { margin: auto;}
</style>
