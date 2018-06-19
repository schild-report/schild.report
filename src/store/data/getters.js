/*
export const someGetter = (state) => {}
 */
export const reportData = state => {
  console.log('reportData')
  const jahr = state.schuelerGewaehlt && state.schuelerGewaehlt.length > 0 ? state.schuelerGewaehlt[0].AktSchuljahr : null
  const abschnitt = state.schuelerGewaehlt && state.schuelerGewaehlt.length > 0 ? state.schuelerGewaehlt[0].AktAbschnitt : null
  return {
    schule: state.schule,
    klasse: state.klasse,
    schueler: state.schuelerGewaehlt,
    jahr: jahr,
    abschnitt: abschnitt
  }
}
