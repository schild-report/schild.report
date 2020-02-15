<script>
  import Datenbank from './Datenbank.svelte'
  import Login from "./Login.svelte";
  import { connected } from './../stores.js';
</script>
<section class="hero is-info is-bold is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="column is-4 is-offset-4">
        {#if $connected}
          <Login />
        {:else}
          <Datenbank />
        {/if}
      </div>
    </div>
  </div>
</section>