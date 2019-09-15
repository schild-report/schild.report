<script>
  import { configData, state } from './../stores.js';
  import mysql from 'mysql'
  $: s = $state.schueler[0]
  async function foto (s) {
    const connection = mysql.createConnection($configData.db.connection)
    connection.connect()
    return new Promise((resolve, reject) => {
      connection.query('SELECT Foto FROM `schuelerfotos` WHERE `Schueler_ID` = ?', [s.ID],
        (err, rows) => {
          connection.end()
          if (err || rows.length===0) return reject(err);
          resolve(Buffer.from(rows[0].Foto, 'binary').toString('base64'));
      });
    });
  }
  const faecher = new Set
  $: s.abschnitte.forEach(a => a.noten.forEach(n => faecher.add(n.fach.FachKrz)))
</script>

<div class="card">
  <div class="card-content">
    <div class="media">
      <div class="media-left">
        <figure class="image">
          {#await foto(s) then f}
            <img src="data:image/jpg;base64,{f}" alt="Foto" width="128" >
          {:catch}
            Kein Foto
          {/await}
        </figure>
      </div>
      <div class="media-content">
        <p class="title is-4">{s.Name}, {s.Vorname}</p>
        <p class="subtitle is-6">{s.Klasse}</p>
        {s.Strasse}, {s.PLZ} {s.OrtAbk}
        <p></p>
        <br>{s.Telefon || s.Fax || ''}
        <br>{s.EMail}
        <br>{(new Date(s.Geburtsdatum).toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric', timezone: 'Europe/Berlin'}))}
      </div>
    </div>
    <div class="content">
      <h5 class="title is-5"> Vermerke </h5>
      {#each s.vermerke.reverse() as v}
          – {v.Bemerkung} –
          {`${(new Date(v.Datum).toLocaleDateString('de', {day: '2-digit', month: '2-digit', year: 'numeric'}))} | ${v.GeaendertVon||v.AngelegtVon}`}
          <br>
      {:else} – keine –
      {/each}
      <h5 class="title is-5"> Noten </h5>
      <table>
        <thead>
          <td></td>
          {#each Array.from(faecher) as f}
            <td>{f}</td>
          {/each}
        </thead>
        {#each s.abschnitte as hj}
        <tr>
        {#each Array.from(faecher) as f}
          {#each [hj.noten.find(n => n.fach.FachKrz === f)||{}] as n}
            <td class="text-center" style={parseInt(n.NotenKrz) > 4 ? 'background:tomato;':''}>
              <span class:kreis={n.Warnung==='+'}>{n.NotenKrz || '–'}</span>
            </td>
          {/each}
        {/each}
        </tr>
        {/each}
      </table>
    </div>
  </div>
</div>

