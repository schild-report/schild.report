// Wrapper für die Erziehungsberichtigten

export class DErziehungsberechtigung {
    get geehrte_r () {
        return this.Anrede === "Herr" ? 'geehrter Herr' : 'geehrte Frau'
    }
    get Geschlecht () {
        return this.Anrede === "Herr" ? 'm' : 'w'
    }

    get Vorname() { return this.Vorname1 }
    get Name() { return this.Name1 }
    get Zusatz() { return this.Erz1ZusatzNachname }
    get Strasse() { return this.ErzStrasse }
    get Ort() { return this.ort.Bezeichnung }
    get PLZ() { return this.ErzPLZ }
}
