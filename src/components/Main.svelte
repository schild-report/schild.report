<script>
  import { state } from './../stores.js';
  import Dokument from './Dokument.svelte'
  import Sidebar from "./Sidebar.svelte";
  import Navbar from "./Navbar.svelte";
  import Einstellungen from "./Einstellungen.svelte";
  import Start from "./Start.svelte";

  const sidebar_components = [Einstellungen, Start]
  $state.component = Start

  $: sidebar = !sidebar_components.includes($state.component)
  $: show = !!$state.component
</script>

<div class="grid-container" class:sidebar>
  {#if sidebar}
    <div class="menu has-background-white-ter">
      <Sidebar/>
    </div>
  {/if}
  <div class="main">
    <svelte:component this={$state.component}/>
    <div class:show>
      <Dokument></Dokument>
    </div>
  </div>
  <div class="header">
    <Navbar />
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
