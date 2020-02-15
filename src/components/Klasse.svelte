<script>
  import { schueler_sortiert, selected } from './../stores.js';
  const status = {
    0: 'Neue Schüler',
    1: '1',
    2: 'Aktive Schüler',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: 'Ausbildung beendet',
    9: 'Abgänger'
  }
</script>
{#each $schueler_sortiert as gruppe}
  <h2 class="subtitle">{status[gruppe[0]]}</h2>
  <table class="table">
    <thead>
      <tr>
        <th>
          <!-- <input type="checkbox" bind:checked={$selected} value={gruppe}> -->
        </th>
        <th></th>
        <th>Name</th>
        <th>Vorame</th>
        <th>Adress</th>
        <th>Telefon</th>
        <th>email</th>
        <th>Geburtstag</th>
        <th>Info</th>
      </tr>
    </thead>
    <tbody>
      {#each gruppe[1] || [] as s,i}
        <tr>
          <td><input type="checkbox" bind:group={$selected} value={s}></td>
          <td>{i+1}</td>
          <td>{s.Name}</td>
          <td>{s.Vorname}</td>
          <td>{`${s.Strasse}, ${s.PLZ} ${s.OrtAbk}`}</td>
          <td>{s.Telefon || ''}</td>
          <td>{s.EMail || ''}</td>
          <td>{s.Geburtsdatum.toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric'})}</td>
          <td><span class={s.Volljaehrig==='+' ? 'tag is-success':'tag is-danger'}></span></td>
        </tr>
      {/each}
    </tbody>
  </table>
{/each}