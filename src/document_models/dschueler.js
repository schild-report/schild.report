// Wrapper für den Schüler

export class DSchueler {
    DSchueler () {
      this.gewaehlteAbschnittsNummer=0
      this.gewaehltesJahr=0
    }
    abschnittVom (jahr, abschnitt) {
      return this.abschnitte.find(a => a.Jahr === jahr && a.Abschnitt === abschnitt)
    }
  
    get vorhergehenderAbschnitt () {
      let na=this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr && a.Abschnitt === this.gewaehlteAbschnittsNummer-1)
      if(na) return na
      let ab=1
      let s
      do {
        na=s;
        s=this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr-1 && a.Abschnitt === ab)
        ab++
      } while(s)
      return na
    }
    get naechsterAbschnitt () {
      let na= this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr && a.Abschnitt === this.gewaehlteAbschnittsNummer+1)
      if(na) return na
      return this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr+1 && a.Abschnitt === 0)
    }
    volljaehrigAm (datum) {
      if (!datum || !this.Geburtsdatum) return false
      var g = new Date(this.Geburtsdatum)
      var d = new Date(datum)
      return (d.getFullYear() - g.getFullYear() - ((d.getMonth() > g.getMonth() || (d.getMonth() === g.getMonth() && d.getDay() >= g.getDay())) ? 0 : 1)) >= 18
    }
  
    get gewaehlterAbschnitt () {
      return this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr && a.Abschnitt === this.gewaehlteAbschnittsNummer)
    }
    get gewaehlterJahrgang () {
      return this.gewaehlterAbschnitt.Jahrgang
    }
    get anrede () {
      return (this.Geschlecht === 3 ? 'Herr' : 'Frau')
    }
    get geehrte_r () {
      return this.Geschlecht === 3 ? 'geehrter Herr' : 'geehrte Frau'
    }
    get schueler_in () {
      return (this.Geschlecht === 3 ? 'Schüler' : 'Schülerin')
    }
    get studierende_r () {
      return (this.Geschlecht === 3 ? 'Studierender' : 'Studierende')
    }
    get berufsbezeichnung_mw () {
      if (this.fachklasse) return this.Geschlecht === 3 ? this.fachklasse.Bezeichnung : this.fachklasse.Beschreibung_W
      else return 'Keine Fachklasse zugeordnet'
    }
    get volljaehrig () {
      return this.Volljaehrig === '+'
    }
  }
  