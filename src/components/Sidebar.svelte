<script>
  import { rollup } from './App.svelte'
  import * as Comlink from "comlink";
  import { configData, state } from './../stores.js';
  import { join } from 'path'

  function callback () {
    console.log('Modul wurde modifiziert, ...')
    run_rollup()
  }
  async function run_rollup (args) {
    console.log('rollup starten...')
    const options = args && args.file ? {
      source: join($configData.reports, args.repo, args.file),
      dest: join($configData.userData),
      debug: args.debug || true,
      plugin: args.file.startsWith('plugin')
    } : null
    await rollup.set_options(options);
    try {
      const res = await rollup.build()
      if (args) {
        $state.component = null
        $state.dokument = args.file
        $state.repo = args.repo
      }
      $state.reload += 1
    } catch (error) {
      console.log(error)
    }
    await rollup.watch(Comlink.proxy(callback))
  }
  function toggle_folder_state (key) {
    $configData.folderStates[key] = !$configData.folderStates[key]
  }
</script>

  <div class="sidebar">
    {#each Object.entries($state.repos) as [key, values]}
      <ul class="tree-group">
        <li class="tree-item tree-item--chevron-down"
            class:closed={$configData.folderStates[key]}
            on:click={()=>toggle_folder_state(key)}>
          <span class="tree-item-label tree-header">{key}</span>
        </li>
        {#if !$configData.folderStates[key]}
          <ul class="tree-group">
          {#each values as v}
            <li class="tree-item hoverable" class:active={key === $state.repo && v === $state.dokument} on:click={()=>run_rollup({ repo: key, file: v })}>
              <span class="tree-item-label">{v.replace(/\.[^/.]+$/, "")}</span>
            </li>
          {/each}
        </ul>
        {/if}
      </ul>
    {/each}
  </div>

<style>
  .sidebar {
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
    font-family: 'Material Icons' !important;
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
    font-family: 'Material Icons' !important;
    font-size: 17px;
    margin-right: 10px;
  }
</style>