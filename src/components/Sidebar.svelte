<script>
  import {
    configData,
    dokument,
    repo,
    dokument_component,
  } from "./../stores.js";
  import { repo_worker } from "./App.svelte";
  import * as Comlink from "comlink";

  let repos = {};
  export let highlight;

  function toggle_folder_state(key) {
    $configData.folderStates[key] = !$configData.folderStates[key];
  }
  function callback(obj) {
    repos = obj;
  }
  try {
    repo_worker.watch_repos($configData.reports, Comlink.proxy(callback));
  } catch (e) {
    console.log("Fehler beim Einlesen der Verzeichnisse: ", e)
  }
</script>

<div class="sidebar">
  {#each Object.entries(repos) as [key, values]}
    <ul class="tree-group">
      <li
        class="tree-item tree-item--chevron-down"
        class:closed={$configData.folderStates[key]}
        on:click={() => toggle_folder_state(key)}>
        <span class="tree-item-label tree-header">{key}</span>
      </li>
      {#if !$configData.folderStates[key]}
        <ul class="tree-group">
          {#each values as v}
            <li
              class="tree-item hoverable"
              class:active={key === $repo && v === $dokument && !highlight}
              on:click={() => $dokument_component.run_rollup({
                  repo: key,
                  file: v,
                })}>
              <span class="tree-item-label">{v.replace(/\.[^/.]+$/, '')}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </ul>
  {:else}Keine Dokumente vorhanden{/each}
</div>

<style>
  .sidebar {
    padding-top: 0.3rem;
    border-right: 1px solid #c5cad3;
  }
  .sidebar .tree-group {
    padding: 0;
    margin: 0;
  }
  .sidebar .tree-item {
    padding: 2px 0 2px 25px;
    list-style: none;
    position: relative;
  }
  .sidebar .tree-item-label.tree-header {
    font-weight: bold;
    text-transform: uppercase;
  }
  .sidebar .tree-item.active {
    background-color: hsl(0, 0%, 71%);
  }
  .sidebar .tree-item.hoverable:hover {
    background-color: DodgerBlue;
    color: #ffffff;
  }
  .sidebar .tree-item:before {
    font-family: "Material Icons" !important;
    position: absolute;
    left: 10px;
  }
  .sidebar .tree-item.tree-item--chevron-down:before {
    font-weight: bold;
    content: "keyboard_arrow_down";
  }
  .sidebar .tree-item.closed:before {
    font-weight: bold;
    content: "chevron_right";
  }
  .sidebar .tree-item-label {
    display: flex;
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    width: 220px;
    display: inline-block;
    text-overflow: ellipsis;
  }
  .sidebar .tree-item-label:before {
    font-family: "Material Icons" !important;
    font-size: 17px;
    margin-right: 10px;
  }
</style>
