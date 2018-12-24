/*
export const someMutation = (state) => {}
 */

export const updateSchule = (state, data) => {
  state.schule = data
}
export const updateKlasse = (state, data) => {
  state.klasse = data
}
export const updateKlasseSortiert = (state, data) => {
  state.klasseSortiert = data
}
export const updateSchuelerGewaehlt = (state, data) => {
  state.schuelerGewaehlt = data
}
export const updateSelected = (state, data) => {
  state.selected = data
}
export const updateSchuelerfoto = (state, data) => {
  state.schuelerfoto = data
}
export const updateComponents = (state, data) => {
  console.log('Components aktualisiert …')
  state.components = data
}
export const updateComponentsPath = (state, data) => {
  state.componentsPath = data
}
export const updateKnex = (state, data) => {
  state.knex = data
}
export const updateAuth = (state, data) => {
  state.auth = data
}
export const updateDocumentSource = (state, data) => {
  state.documentSource = data
}
export const updateAbschnitt = (state, data) => {
  state.abschnitt = data
}
export const updateRepos = (state, data) => {
  state.repos = data
}
export const updateMessage = (state, data) => {
  state.message = data
}
export const updatePrivateDaten = (state, data) => {
  state.privateDaten = data
}
