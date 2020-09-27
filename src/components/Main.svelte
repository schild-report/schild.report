<script>
  import { component, plugin, dokument_component } from "./../stores.js";
  import Dokument from "./Dokument.svelte";
  import Sidebar from "./Sidebar.svelte";
  import Navbar from "./Navbar.svelte";
  import Einstellungen from "./Einstellungen.svelte";
  import Start from "./Start.svelte";
  import { schild } from "./App.svelte";

  let schule = schild.getSchule();
  const sidebar_components = [Einstellungen, Start];
  $component = Start

  $: sidebar = !sidebar_components.includes($component) && !$plugin;
  $: show = !!$component;
</script>

<div class="grid-container" class:sidebar>
  {#if sidebar}
    <div class="menu has-background-white-ter">
      <Sidebar highlight="{show}"/>
    </div>
  {/if}
  <div class="main">
    {#if $component}
      <section class="section">
        <div class="container">
          <svelte:component this={$component} />
        </div>
      </section>
    {/if}
    <div class:show style="height: -webkit-fill-available;">
      {#await schule then schule}
        <Dokument {schule} bind:this={$dokument_component}/>
      {/await}
    </div>
  </div>
  <div class="header">
    {#await schule then schule}
      <Navbar {schule} />
    {/await}
  </div>
</div>

<style>
  .show {
    display: none;
  }
  .grid-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: 3.25rem calc(100vh - 3.25rem);
    grid-template-areas: "header header" "main main";
  }
  .grid-container.sidebar {
    grid-template-areas: "header header" "menu main";
  }
  .menu {
    grid-area: menu;
    overflow: auto;
  }
  .main {
    grid-area: main;
    overflow: auto;
  }
  .header {
    grid-area: header;
  }
  ::-webkit-scrollbar {
    display: none;
  }
</style>
