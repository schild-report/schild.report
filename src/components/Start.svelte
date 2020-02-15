<script>
  import { configData, plugin, plugin_entry, component, reload } from './../stores.js';
  import { lstatSync, readdirSync, readFileSync } from 'fs'
  import { join, basename } from 'path'

  function scanSource (report_location) {
    const isDirectory = (source) => lstatSync(source).isDirectory() && !basename(source).startsWith('.')
    const getDirectories = (source) =>
      readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    const obj = getDirectories(report_location)
      .reduce((o, element) => ({
        ...o,
        [element]: json(element)
      }), {})
    return obj
  }
  const json = dir => {
    try {
      return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    } catch (e) {
      return {name: 'Keine Beschreibung vorhanden', description: ''}
    }
  }
  const dir = scanSource($configData.plugins)

  const run_plugin = (p,d) => {
    $plugin = p
    $plugin_entry = d.main || 'bundle.js'
    $component = null
    $reload += 1
  }

</script>
<div class="tile is-ancestor">
  {#each Object.entries(dir) as [p,d]}
    <div class="tile is-parent is-4" on:click={()=>run_plugin(p,d)} style="cursor: pointer">
      <article class="tile is-child notification is-grey-dark">
        <div class="content">
          <p class="title">{d.name}</p>
          <p class="subtitle">{d.description}</p>
        </div>
      </article>
    </div>
  {/each}
</div>