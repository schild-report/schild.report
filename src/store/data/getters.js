/*
export const someGetter = (state) => {}
 */
export const reportData = state => {
  console.log('reportData')
  const arr = schuelerGewaehlt(state)
  console.log(arr)
  const { AktSchuljahr: jahr, AktAbschnitt: abschnitt } = arr.length > 0 ? arr[0] : { AktSchuljahr: null, AktAbschnitt: null }
  return {
    schule: state.schule,
    klasse: state.klasse,
    schueler: arr,
    jahr: jahr,
    abschnitt: abschnitt,
    privat: state.configData.privateDaten,
    componentsPath: state.configData.userData + '/bundle.js',
    knexConfig: state.configData.db
  }
}

export const schuelerGewaehlt = state => {
  if (!state.klasse.schueler) return []
  console.log('schuelerGewaehlt', state)
  if (state.selected.length > 0) return state.selected
  if (state.klasseSortiert['2'].length > 0) return state.klasseSortiert['2'].schueler
  else if (state.klasseSortiert['8'].length > 0) return state.klasseSortiert['8'].schueler
  else if (state.klasseSortiert['0'].length > 0) return state.klasseSortiert['0'].schueler
  else return state.klasse.schueler || []
}
