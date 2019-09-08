import { Model } from 'objection'

class Schueler extends Model {
  static get tableName () { return 'schueler' }
  static get virtualAttributes () {
    return ['anrede', 'akt_halbjahr', 'schueler_in', 'studierende_r', 'berufsbezeichnung_mw', 'volljaehrig']
  }
  get anrede () {
    return (this.Geschlecht === 3 ? 'Herr' : 'Frau')
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
  volljaehrig_bei (datum) {
    if (!datum || !this.Geburtsdatum) return false
    var g = new Date(this.Geburtsdatum)
    var d = new Date(datum)
    return (d.getFullYear() - g.getFullYear() - ((d.getMonth() > g.getMonth() || (d.getMonth() === g.getMonth() && d.getDay() >= g.getDay())) ? 0 : 1)) >= 18
  }
  static get relationMappings () {
    return {
      fachklasse: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fachklasse,
        join: { from: 'schueler.Fachklasse_ID', to: 'eigeneschule_fachklassen.ID' }
      },
      abschnitte: {
        relation: Model.HasManyRelation,
        modelClass: Abschnitt,
        join: { from: 'schueler.ID', to: 'schuelerlernabschnittsdaten.Schueler_ID' }
      },
      vermerke: {
        relation: Model.HasManyRelation,
        modelClass: Vermerk,
        join: { from: 'schueler.ID', to: 'schuelervermerke.Schueler_ID' }
      },
      bk_abschluss: {
        relation: Model.HasOneRelation,
        modelClass: BKAbschluss,
        join: { from: 'schueler.ID', to: 'schuelerbkabschluss.Schueler_ID' }
      },
      bk_abschluss_faecher: {
        relation: Model.HasManyRelation,
        modelClass: BKAbschlussFach,
        join: { from: 'schueler.ID', to: 'schuelerbkfaecher.Schueler_ID' }
      },
      abi_abschluss: {
        relation: Model.HasOneRelation,
        modelClass: AbiAbschluss,
        join: { from: 'schueler.ID', to: 'schuelerabitur.Schueler_ID' }
      },
      abi_abschluss_faecher: {
        relation: Model.HasManyRelation,
        modelClass: AbiAbschlussFach,
        join: { from: 'schueler.ID', to: 'schuelerabifaecher.Schueler_ID' }
      },
      fhr_abschluss: {
        relation: Model.HasOneRelation,
        modelClass: FHRAbschluss,
        join: { from: 'schueler.ID', to: 'schuelerfhr.Schueler_ID' }
      },
      fhr_abschluss_faecher: {
        relation: Model.HasManyRelation,
        modelClass: FHRAbschlussFach,
        join: { from: 'schueler.ID', to: 'schuelerfhrfaecher.Schueler_ID' }
      },
      schuelerfoto: {
        relation: Model.HasOneRelation,
        modelClass: Schuelerfoto,
        join: { from: 'schueler.ID', to: 'schuelerfotos.Schueler_ID' }
      },
      sprachenfolgen: {
        relation: Model.HasManyRelation,
        modelClass: Sprachenfolge,
        join: { from: 'schueler.ID', to: 'schuelersprachenfolge.Schueler_ID' }
      },
      versetzung: {
        relation: Model.HasOneRelation,
        modelClass: Versetzung,
        join: { from: 'schueler.Klasse', to: 'versetzung.Klasse' }
      }
    }
  }
}
class Fachklasse extends Model {
  static get tableName () { return 'eigeneschule_fachklassen' }
  static get relationMappings () {
    return {
      fach_gliederungen: {
        relation: Model.HasManyRelation,
        modelClass: FachGliederung,
        join: { from: 'eigeneschule_fachklassen.ID', to: 'fach_gliederungen.Fachklasse_ID' }
      }
    }
  }
}
class Abschnitt extends Model {
  static get tableName () { return 'schuelerlernabschnittsdaten' }
  static get virtualAttributes () {
    return ['v_name_klassenlehrer', 'klassenlehrer_in', 'schuljahr']
  }
  get v_name_klassenlehrer () {
    if (this.lehrer) return `${this.lehrer.Vorname[0]}. ${this.lehrer.Nachname}`
  }
  get klassenlehrer_in () {
    if (this.lehrer) return (this.lehrer.Geschlecht === '3' ? 'Klassenlehrer' : 'Klassenlehrerin')
  }
  get schuljahr () {
    return `${this.Jahr}/${this.Jahr - 1999}`
  }
  static get relationMappings () {
    return {
      lehrer: {
        relation: Model.BelongsToOneRelation,
        modelClass: Lehrer,
        join: { from: 'schuelerlernabschnittsdaten.KlassenLehrer', to: 'k_lehrer.Kuerzel' }
      },
      fachklasse: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fachklasse,
        join: { from: 'schuelerlernabschnittsdaten.Fachklasse_ID', to: 'eigeneschule_fachklassen.ID' }
      },
      noten: {
        relation: Model.HasManyRelation,
        modelClass: Note,
        join: { from: 'schuelerlernabschnittsdaten.ID', to: 'schuelerleistungsdaten.Abschnitt_ID' }
      }
    }
  }
}
class Jahrgang extends Model {
  static get tableName () { return 'eigeneschule_jahrgaenge' }
}
class Versetzung extends Model {
  static get tableName () { return 'versetzung' }
  static get relationMappings () {
    return {
      jahrgang: {
        relation: Model.BelongsToOneRelation,
        modelClass: Jahrgang,
        join: { from: 'versetzung.Jahrgang_ID', to: 'eigeneschule_jahrgaenge.ID' }
      },
      fachklasse: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fachklasse,
        join: { from: 'versetzung.Fachklasse_ID', to: 'eigeneschule_fachklassen.ID' }
      },
      schueler: {
        relation: Model.HasManyRelation,
        modelClass: Schueler,
        join: { from: 'versetzung.Klasse', to: 'schueler.Klasse' }
      }
    }
  }
}
class Lehrer extends Model {
  static get tableName () { return 'k_lehrer' }
}
class Note extends Model {
  static get tableName () { return 'schuelerleistungsdaten' }
  static get relationMappings () {
    return {
      fach: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fach,
        join: { from: 'schuelerleistungsdaten.Fach_ID', to: 'eigeneschule_faecher.ID' }
      }
    }
  }
}
class Fach extends Model {
  static get tableName () { return 'eigeneschule_faecher' }
  static get relationMappings () {
    return {
      fach_gliederungen: {
        relation: Model.HasManyRelation,
        modelClass: FachGliederung,
        join: { from: 'eigeneschule_faecher.ID', to: 'fach_gliederungen.Fach_ID' }
      }
    }
  }
}
class BKAbschluss extends Model {
  static get tableName () { return 'schuelerbkabschluss' }
}
class BKAbschlussFach extends Model {
  static get tableName () { return 'schuelerbkfaecher' }
  static get relationMappings () {
    return {
      fach: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fach,
        join: { from: 'schuelerbkfaecher.Fach_ID', to: 'eigeneschule_faecher.ID' }
      }
    }
  }
}
class AbiAbschluss extends Model {
  static get tableName () { return 'schuelerabitur' }
}
class AbiAbschlussFach extends Model {
  static get tableName () { return 'schuelerabifaecher' }
  static get relationMappings () {
    return {
      fach: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fach,
        join: { from: 'schuelerabifaecher.Fach_ID', to: 'eigeneschule_faecher.ID' }
      }
    }
  }
}
class FHRAbschluss extends Model {
  static get tableName () { return 'schuelerfhr' }
}
class FHRAbschlussFach extends Model {
  static get tableName () { return 'schuelerfhrfaecher' }
  static get relationMappings () {
    return {
      fach: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fach,
        join: { from: 'schuelerfhrfaecher.Fach_ID', to: 'eigeneschule_faecher.ID' }
      }
    }
  }
}
class Sprachenfolge extends Model {
  static get tableName () { return 'schuelersprachenfolge' }
  static get relationMappings () {
    return {
      fach: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fach,
        join: { from: 'schuelersprachenfolge.Fach_ID', to: 'eigeneschule_faecher.ID' }
      }
    }
  }
}
class FachGliederung extends Model {
  static get tableName () { return 'fach_gliederungen' }
  static get relationMappings () {
    return {
      fachklasse: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fachklasse,
        join: { from: 'fach_gliederungen.Fachklasse_ID', to: 'eigeneschule_fachklassen.ID' }
      }
    }
  }
}
class Vermerk extends Model {
  static get tableName () { return 'schuelervermerke' }
}
class Schuelerfoto extends Model {
  static get tableName () { return 'schuelerfotos' }
}
class Schule extends Model {
  static get tableName () { return 'eigeneschule' }
  static get virtualAttributes () {
    return ['schulleiter_in']
  }
  get schulleiter_in () {
    return this.SchulleiterGeschlecht === 3 ? 'Schulleiter' : 'Schulleiterin'
  }
}
class Nutzer extends Model {
  static get tableName () { return 'users' }
}

export {
  Schueler,
  Abschnitt,
  Fachklasse,
  Versetzung,
  Lehrer,
  Note,
  Fach,
  BKAbschluss,
  BKAbschlussFach,
  AbiAbschluss,
  AbiAbschlussFach,
  FHRAbschluss,
  FHRAbschlussFach,
  Sprachenfolge,
  FachGliederung,
  Vermerk,
  Schuelerfoto,
  Schule,
  Nutzer,
  Jahrgang
}
