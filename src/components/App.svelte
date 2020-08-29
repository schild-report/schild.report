<script context="module">
  import * as Comlink from "comlink";
  export const schild = Comlink.wrap(new Worker("./schild_worker.js"));
  export const repo_worker = Comlink.wrap(new Worker("./repo_worker.js"));
  export const rollup = Comlink.wrap(new Worker("./rollup_worker.js"));
</script>

<script>
  import { db, connected, user, configData } from "./../stores.js";
  import { VERSION } from "./../version.js";
  import Main from "./Main.svelte";
  import Intro from "./Intro.svelte";

  const production = VERSION.production;

  const init = async () => {
    try {
      await schild.connect(await $db);
      $connected = await schild.testConnection();
      repo_worker.set_report_location($configData.reports);
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
</script>

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

<style>
  @import "../node_modules/bulma/css/bulma.css";
</style>
