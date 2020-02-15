<script>
  import { configData, schueler } from "./../stores.js";
  import mysql from "mysql";
  import { datum } from "./../helfer.js";
  $: s = $schueler[0];
  $: faecher = new Set(
    s.abschnitte
      .reverse()
      .map(a => a.noten.map(n => n.fach.FachKrz))
      .flat()
  );
  $: foto = new Promise((resolve, reject) => {
    const connection = mysql.createConnection($configData.db.connection);
    connection.connect();
    connection.query(
      "SELECT Foto FROM `schuelerfotos` WHERE `Schueler_ID` = ?",
      [s.ID],
      (err, rows) => {
        connection.end();
        if (err || rows.length === 0) return reject();
        resolve(Buffer.from(rows[0].Foto, "binary").toString("base64"));
      }
    );
  });
</script>

<style>
  .kreis {
    border: 0.2rem solid red;
    border-radius: 20%;
    padding: 0.2rem;
  }
</style>

<div class="card">
  <div class="card-content">
    <div class="media">
      <div class="media-left">
        <figure class="image">
          {#await foto}
            Lade Foto …
          {:then f}
            <img src="data:image/jpg;base64,{f}" alt="Foto" width="128" />
          {:catch}
            Kein Foto
          {/await}
        </figure>
      </div>
      <div class="media-content">
        <p class="title is-4">{s.Name}, {s.Vorname}</p>
        <p class="subtitle is-6">{s.Klasse}</p>
        {s.Strasse}, {s.PLZ} {s.OrtAbk}
        <p />
        <br />
        {s.Telefon || s.Fax || ''}
        <br />
        {s.EMail}
        <br />
        {datum(s.Geburtsdatum)}
      </div>
    </div>
    <div class="content">
      <h5 class="title is-5">Vermerke</h5>
      {#each s.vermerke.reverse() as v}
        – {v.Bemerkung} – {`${datum(v.Datum)} | ${v.GeaendertVon || v.AngelegtVon}`}
        <br />
      {:else}– keine –
      {/each}
    </div>
    <div class="content">
      <h5 class="title is-5">Noten</h5>
      <table class="table is-narrow is-bordered is-striped">
        <thead>
          <td>Abschnitt</td>
          {#each Array.from(faecher) as f}
            <td class="has-text-centered">{f}</td>
          {/each}
        </thead>
        {#each s.abschnitte as hj}
          <tr>
            <td>{`${hj.Jahr}/${hj.Abschnitt}`}</td>
            {#each Array.from(faecher) as f}
              {#each [hj.noten.find(n => n.fach.FachKrz === f) || {}] as n}
                <td
                  class="has-text-centered"
                  style={parseInt(n.NotenKrz) > 4 ? 'background:tomato;' : ''}>
                  <span class:kreis={n.Warnung === '+'}>
                    {n.NotenKrz || '–'}
                  </span>
                </td>
              {/each}
            {/each}
          </tr>
        {:else}Bisher noch keine Abschnitte angelegt
        {/each}
      </table>
    </div>
  </div>
</div>
