<script>
  import { schild } from './App.svelte'
  import { state } from './../stores.js';
  import Schueler from './Schueler.svelte';
  import Klasse from './Klasse.svelte';
  import _ from 'lodash';

  let input;
  let term = "";
  let res = [];
  let selected = -1
  let items = []
  let show

  $: if (term.length > 1) {
    selected = -1;
    schild.suche(term).then(r=> res = r)
  }
  $: if (term.length < 2) res = [];
  const key = e => {
    if (e.key === "ArrowDown") selected += 1;
    else if (e.key === "ArrowUp") selected -= 1;
    else if (e.key === "Enter") {
      show_selected(res[selected]);
      return
    } else return;
    if (selected > res.length - 1) selected = 0;
    if (selected < 0) selected = res.length - 1;
    e.preventDefault();
    items[selected].scrollIntoView({block: "center", inline: "nearest"})
  };
  const blur = _ => {setTimeout(_=> show = false, 500)}

  $: sortieren = $state.schueler
  $: sortieren.length && schueler_sortieren()

  function schueler_sortieren () {
    const gruppiert = _.groupBy($state.schueler, 'Status')
    $state.schueler_sortiert = Object.entries(gruppiert).sort((a,b)=>b[1].length - a[1].length)
    try {
      $state.gewaehlt = $state.schueler_sortiert[0][0]
    } catch (e) {
      $state.gewaehlt = null
    }
  }
  $: console.log($state.schueler_sortiert)
  async function show_selected(item) {
    res = [];
    selected = -1;
    term = ''
    input.blur()
    $state.selected = []
    $state.zurueck_zu = item
    if (item.status) {
      const schueler = await schild.getSchueler(item.id)
      $state.schueler = [schueler]
      $state.klasse = {}
      $state.component = ($state.component || $state.plugin) && Schueler
    } else {
      $state.klasse = await schild.getKlasse(item.id)
      $state.schueler = $state.klasse.schueler
      $state.component = ($state.component || $state.plugin) && Klasse
    }
    ({ AktSchuljahr: $state.jahr, AktAbschnitt: $state.abschnitt } = $state.schueler.length > 0
      ? $state.schueler[0]
      : { AktSchuljahr: null, AktAbschnitt: null })
  }
</script>

<div class="wrapper">
  <input
    class="input"
    type="text"
    placeholder="suchen ..."
    bind:this={input}
    bind:value={term}
    on:keydown={key}
    on:blur={blur}
    on:focus={()=>show=true}
  />
  {#if res.length && show}
    <div class="items">
      {#each res as r, i}
        <div on:click={()=>show_selected(r)}
             class:active={selected === i}
             bind:this={items[i]}>{r.value}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    position: relative;
  }
  .input {
    width: 20rem;
  }
  .items {
    position: absolute;
    border: 1px solid #d4d4d4;
    z-index: 99;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 80vh;
    overflow: auto;
  }
  .items div {
    padding: 10px;
    cursor: pointer;
    background-color: #fff;
    border-bottom: 1px solid #d4d4d4;
  }
  .items div:hover {
    background-color: #e9e9e9;
  }
  .active {
    background-color: DodgerBlue !important;
    color: #ffffff;
  }
</style>