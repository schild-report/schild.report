<script context="module">
  import * as Comlink from "comlink";
  export const schild = Comlink.wrap(new Worker("./schild_worker.js"));
  export const repo_worker = Comlink.wrap(new Worker("./repo_worker.js"));
  export const rollup = Comlink.wrap(new Worker("./rollup_worker.js"));
</script>

<script>
  import { configData, connected, user } from "./../stores.js";
  import { VERSION } from "./../version.js";
  import Main from "./Main.svelte";
  import Intro from "./Intro.svelte";

  const production = VERSION.production;

  const init = async () => {
    try {
      await schild.connect($configData.db);
      $connected = await schild.testConnection();
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
</script>

{#if $configData}
  {#await init()}
    Verbinde mit der Datenbank …
  {:then}
    {#if $connected && ($user || !production)}
      <Main />
    {:else}
      <Intro />
    {/if}
  {:catch}
    <Intro />
  {/await}
{/if}

<style>
  @import "../node_modules/bulma/css/bulma.css";
</style>
