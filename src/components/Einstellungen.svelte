<script>
  import Datenbank from './Datenbank.svelte'
  import PrivateDaten from './PrivateDaten.svelte'
  import SonstigeEinstellungen from './SonstigeEinstellungen.svelte'
</script>
<div class="section">
  <div class="tile is-ancestor">
    <div class="tile is-parent">
      <Datenbank />
    </div>
    <div class="tile is-parent">
      <PrivateDaten />
    </div>
    <div class="tile is-parent">
      <SonstigeEinstellungen />
    </div>
  </div>
</div>
