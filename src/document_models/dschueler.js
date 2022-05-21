// Wrapper für den Schüler

export class DSchueler {
  constructor () {
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
    get gewaehltesSchuljahrStartDatum() {
      return new Date(this.gewaehltesJahr,7,1) // 1.8. des Schuljahres
    }
    get gewaehltesSchuljahrEndDatum() {
      return new Date(this.gewaehltesJahr+1,6,31) // 31.7. des Schuljahres
    }
    get naechsterAbschnitt () {
      let na= this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr && a.Abschnitt === this.gewaehlteAbschnittsNummer+1)
      if(na) return na
      return this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr+1 && a.Abschnitt === 0)
    }
  
    get gewaehlterAbschnitt () {
      return this.abschnitte.find(a => a.Jahr === this.gewaehltesJahr && a.Abschnitt === this.gewaehlteAbschnittsNummer)
    }
    get gewaehlterJahrgang () {
      return this.gewaehlterAbschnitt.Jahrgang
    }
    get VollstaendigerName () {
      return (this.Vorname + " "+ (this.Zusatz ? (this.Zusatz+" ") : "") +this.Name)
    }
    get VollstaendigeAnrede () {
      return ((this.Geschlecht === 3 ? 'Herr ' : 'Frau ' ) + this.Vorname + " "+ (this.Zusatz ? (this.Zusatz+" ") : "") +this.Name)
    }
    get VollstaendigeBriefAnrede () {
      return ((this.Geschlecht === 3 ? 'Sehr geehrter Herr ' : 'Sehr geehrte Frau ')+ (this.Zusatz ? (this.Zusatz+" ") : "") + this.Name)
    }
    get Anrede () {
      return (this.Geschlecht === 3 ? 'Herr' : 'Frau')
    }
    get geehrte_r () {
      return this.Geschlecht === 3 ? 'geehrter Herr' : 'geehrte Frau'
    }
    get Schueler_in () {
      return (this.Geschlecht === 3 ? 'Schüler' : 'Schülerin')
    }
    get artikel () {
      return (this.Geschlecht === 3 ? 'der' : 'die')
    }
    get Artikel () {
      return (this.Geschlecht === 3 ? 'Der' : 'Die')
    }
    get geschlecht () {
      return (this.Geschlecht === 3 ? 'männlich' : 'weiblich')
    }
    get pronomen () {
      return (this.Geschlecht === 3 ? 'er' : 'sie')
    }
    get Pronomen () {
      return (this.Geschlecht === 3 ? 'Er' : 'Sie')
    }
    get Studierende_r () {
      return (this.Geschlecht === 3 ? 'Studierender' : 'Studierende')
    }
    get Berufsbezeichnung_mw () {
      if (this.fachklasse) return this.Geschlecht === 3 ? this.fachklasse.Bezeichnung : this.fachklasse.Beschreibung_W
      else return 'Keine Fachklasse zugeordnet'
    }
    get istVolljaehrig () {
      return this.Volljaehrig === '+'
    }
    istVolljaehrigAm (datum) {
      if (!datum || !this.Geburtsdatum) return false
      var g = new Date(this.Geburtsdatum)
      var d = new Date(datum)
      return (d.getFullYear() - g.getFullYear() - ((d.getMonth() > g.getMonth() || (d.getMonth() === g.getMonth() && d.getDay() >= g.getDay())) ? 0 : 1)) >= 18
    }
  }
  