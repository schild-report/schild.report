<script>
  import { schild } from "./App.svelte";
  import {
    schueler,
    selected,
    schueler_sortiert,
    component,
    plugin,
    klasse,
    abschnitt,
    jahr,
    warten
  } from "./../stores.js";
  import Schueler from "./Schueler.svelte";
  import Klasse from "./Klasse.svelte";
  import { group_by } from "./../helfer.js";

  export let zurueck_zu

  let input;
  let term = "";
  let res = [];
  let sel = -1;
  let items = [];
  let show;

  $: if (term.length < 2) res = [];
  $: if (term.length > 1) {
    sel = -1;
    schild.suche(term).then(r => (res = r));
  }
  function schueler_sortieren() {
    const gruppiert = group_by($schueler, "Status");
    $schueler_sortiert = Object.entries(gruppiert).sort(
      (a, b) => b[1].length - a[1].length
    );
    try {
      $selected = $schueler_sortiert[0][1];
    } catch {
      $selected = []
    }
  }

  const blur = _ => setTimeout(_ => (show = false), 500);
  const key = e => {
    if (e.key === "ArrowDown") sel += 1;
    else if (e.key === "ArrowUp") sel -= 1;
    else if (e.key === "Enter") {
      show_selected(res[sel]);
      return;
    } else return;
    if (sel > res.length - 1) sel = 0;
    if (sel < 0) sel = res.length - 1;
    e.preventDefault();
    items[sel].scrollIntoView({ block: "center", inline: "nearest" });
  };

  async function show_selected(item) {
    $warten = true
    res = [];
    sel = -1;
    term = "";
    input.blur();
    zurueck_zu = item;
    if (Number.isInteger(item.status)) {
      const res = await schild.getSchueler(item.id);
      $component = ($component || $plugin) && Schueler;
      $schueler = [res];
      $klasse = {};
      $selected = $schueler
    } else {
      $klasse = await schild.getKlasse(item.id);
      $component = ($component || $plugin) && Klasse;
      $schueler = $klasse.schueler;
      schueler_sortieren()
    }
    $warten = false
  }
  function update_abschnitt () {
    ({ AktSchuljahr: $jahr, AktAbschnitt: $abschnitt } =
      $selected.length > 0
        ? $selected[0]
        : { AktSchuljahr: null, AktAbschnitt: null });
  }
  $: $selected && update_abschnitt()
</script>

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

<div class="wrapper">
  <input
    class="input"
    type="text"
    placeholder="suchen ..."
    bind:this={input}
    bind:value={term}
    on:keydown={key}
    on:blur={blur}
    on:focus={() => show=true} />
  {#if res.length && show}
    <div class="items">
      {#each res as r, i}
        <div
          on:click={() => show_selected(r)}
          class:active={sel === i}
          bind:this={items[i]}>
          {r.value}
        </div>
      {/each}
    </div>
  {/if}
</div>
