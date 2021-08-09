<script>
  import Datenbank from "./Datenbank.svelte";
  import PrivateDaten from "./PrivateDaten.svelte";
  import SonstigeEinstellungen from "./SonstigeEinstellungen.svelte";
</script>

<div class="section">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <div class="tile is-child box">
        <Datenbank />
      </div>
    </div>
    <div class="tile is-parent">
      <div class="tile is-child box">
        <PrivateDaten />
      </div>
    </div>
    <div class="tile is-parent">
      <div class="tile is-child box">
        <SonstigeEinstellungen />
      </div>
    </div>
  </div>
</div>
