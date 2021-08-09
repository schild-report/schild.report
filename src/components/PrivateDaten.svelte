<script>
  import { configData } from "./../stores.js";

  let private_key = "";
  let private_value = "";

  const save_private_key = (e) => {
    if (e.key === "Enter") {
      $configData.privateDaten[private_key] = private_value;
      private_key = "";
      private_value = "";
      e.preventDefault();
    } else return;
  };
</script>

<p class="subtitle is-4 has-text-grey has-text-centered">Eigene Datenfelder</p>
<br />
Die Key/Value-Paare können anschließend in den Reports eingesetzt werden. Legen Sie
z.B. fest, wo der Report das Logo für ihre Schule findet. Diese Werte können anschließend
im Report unter <code>{`{privat.IhrKey}`}</code> abgerufen werden.
<table class="table ist-striped">
  <thead>
    <tr>
      <td>
        <input
          class="input"
          placeholder="Key"
          type="text"
          bind:value={private_key}
        />
      </td>
      <td>
        <input
          class="input"
          type="text"
          placeholder="Value"
          on:keydown={save_private_key}
          bind:value={private_value}
        />
      </td>
    </tr>
  </thead>
  {#each Object.entries($configData.privateDaten).reverse() as [k, v]}
    <tr>
      <td>{k}</td>
      <td>{v}</td>
      <td
        on:click={() => {
          delete $configData.privateDaten[k];
          $configData = $configData;
        }}
        style="cursor: pointer;"
      >
        <i class="mdi has-text-danger" style="font-size: 18px">delete_forever</i
        >
      </td>
    </tr>
  {/each}
</table>
