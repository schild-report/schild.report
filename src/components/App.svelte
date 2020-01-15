<script context="module">
  import * as Comlink from "comlink";
  export const schild = Comlink.wrap(new Worker("./schild_worker.js"));
  export const repo_worker = Comlink.wrap(new Worker("./repo_worker.js"));
  export const rollup = Comlink.wrap(new Worker("./rollup_worker.js"));
</script>

<script>
  import { onMount } from 'svelte';
  import { configData, state } from './../stores.js';
  import { VERSION } from './../version.js';
  import Main from "./Main.svelte";
  import Intro from "./Intro.svelte";

  const production =  VERSION.production

  function callback(obj) {
    $state.repos = obj
  }
  const init = async () => {
    try {
      await repo_worker.set_report_location($configData.reports)
      await repo_worker.watch_repos(Comlink.proxy(callback))
      await schild.connect($configData.db)
      $state.connected = await schild.testConnection()
    } catch (e) {
      console.log(e)
      $state.connected = false
      return
    }
  }
  $: connected = $state.connected
  $: if (connected) update_ui()

  async function update_ui () {
    $state.schule = await schild.getSchule()
    console.log('Update UI')
  }
</script>

<style>
  @import "../node_modules/bulma/css/bulma.css";
</style>

{#await init() then weiter}
  {#if connected && ($state.user || !production)}
    <Main />
  {:else}
    <Intro bind:connected />
  {/if}
  {:catch} schild.report konnte nicht gestartet werden. Nicht gut. Datenbank ok?
{/await}