/*
export const someGetter = (state) => {}
 */
export const reportData = state => {
  const arr = schuelerGewaehlt(state) || []
  const { AktSchuljahr: jahr, AktAbschnitt: abschnitt } = arr.length > 0 ? arr[0] : { AktSchuljahr: null, AktAbschnitt: null }
  return {
    schule: state.schule,
    klasse: state.klasse,
    schueler: arr,
    jahr: state.abschnitt.jahr || jahr,
    abschnitt: state.abschnitt.abschnitt || abschnitt,
    privat: state.configData.privateDaten,
    knexConfig: state.configData.db
  }
}

export const klasseSortiert = state => {
  const inaktiv = [], aktiv = [], fertig = [], neu = []
  state.schueler.forEach(s => {
    if (s.Status === 2 && s.Geloescht === '-' && s.Gesperrt === '-') aktiv.push(s)
    else if (s.Status === 8 && s.Geloescht === '-' && s.Gesperrt === '-') fertig.push(s)
    else if (s.Status === 0 && s.Geloescht === '-' && s.Gesperrt === '-') neu.push(s)
    else inaktiv.push(s)
  })
  return {
    '2': { titel: 'Aktive Schüler', schueler: aktiv, status: 'positive' },
    '8': { titel: 'Ausbildung beendet', schueler: fertig, status: 'positive' },
    '0': { titel: 'Neue Schüler', schueler: neu, status: 'blue' },
    'x': { titel: 'Inaktive Schüler', schueler: inaktiv, status: 'negative' }
  }
}

export const schuelerGewaehlt = state => {
  if (state.selected.length > 0) return state.selected
  const sortiert = klasseSortiert(state)
  if (Object.keys(sortiert).length > 0) {
    if (sortiert['2'].schueler.length > 0) return sortiert['2'].schueler
    else if (sortiert['8'].schueler.length > 0) return sortiert['8'].schueler
    else if (sortiert['0'].schueler.length > 0) return sortiert['0'].schueler
  }
  return state.schueler
}
