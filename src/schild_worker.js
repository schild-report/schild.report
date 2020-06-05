import { expose } from "comlink";
import Knex from 'knex'
import { Model } from 'objection'
import { Schueler, Versetzung, Schule, Schuelerfoto, Nutzer } from './models.js'

class Schild {
  constructor() {
    this.options = null;
    this.knex = null;
  }

  async connect(knexConfig) {
    try {
      this.knex = await Knex(knexConfig);
      Model.knex(this.knex);
    } catch (e) {
      throw e;
    }
  }

  disconnect() {
    if (this.knex) this.knex.destroy();
  }

  async testConnection() {
    try {
      await this.knex.raw('select 1+1 as result')
      console.log('Testverbindung konnte aufgebaut werden');
      return true;
    } catch (err) {
      console.log(err);
      console.log('Testverbindung konnte nicht aufgebaut werden');
      throw err
    }
  }

  async suche(pattern) {
    const pattern_w = pattern+'%'
    try {
      const sres = await Schueler
      .query()
      .whereRaw(`
        Geloescht='-'
          AND Gesperrt='-'
          AND (CONCAT(LOWER(Vorname),' ',LOWER(Name)) LIKE ?
            OR CONCAT(LOWER(Name),', ',LOWER(Vorname)) LIKE ?)
          `
        , [pattern_w, pattern_w])
      .select('Name', 'Vorname', 'Klasse', 'Status', 'AktSchuljahr', 'ID')
      .orderBy('AktSchuljahr', 'desc')
      const schueler = sres.map(s => {
        return {
          value: `${s.Name}, ${s.Vorname} (${s.Klasse})`,
          status: s.Status,
          jahr: s.AktSchuljahr,
          id: s.ID
        };
      })
      const kres = await Versetzung.query().whereRaw(`LOWER(Klasse) LIKE ?`, [`${pattern}%`]).select('Klasse').orderBy('Klasse', 'desc')
      const klassen = kres.map(k => {
          return {
            value: k.Klasse,
            id: k.Klasse
          };
        })
      return schueler.concat(klassen)
    } catch (e) {
      throw e;
    }
  }

  async getSchueler(id) {
    try {
      const res = await Schueler.query()
        .where(function () {
          this.where('Geloescht', '-')
          .andWhere('Gesperrt', '-')
          .andWhere('ID', id)})
        .withGraphFetched(`
          [abschnitte.[noten.fach, lehrer],
          fachklasse.[fach_gliederungen], versetzung, bk_abschluss,
          bk_abschluss_faecher.fach, fhr_abschluss, fhr_abschluss_faecher.fach,
          abi_abschluss, abi_abschluss_faecher.fach, vermerke, sprachenfolgen.fach]
        `)
        .modifyGraph('abschnitte', builder => {
          builder.orderBy('ID');
        }).first();
      return res.toJSON()
    } catch (e) {
      throw e;
    }
  }

  async getKlasse(klasse) {
    try {
      const res = await Versetzung.query()
        .where('Klasse', klasse)
        .withGraphFetched(`
          [schueler.[abschnitte.[noten.fach, lehrer],
          fachklasse.[fach_gliederungen], versetzung, bk_abschluss,
          bk_abschluss_faecher.fach, fhr_abschluss, fhr_abschluss_faecher.fach,
          abi_abschluss, abi_abschluss_faecher.fach, vermerke, sprachenfolgen.fach], fachklasse,
          jahrgang]
        `)
        .modifyGraph('schueler', builder => {
          builder.where(function () {
            this.where('Geloescht', '-')
            .andWhere('Gesperrt', '-')})
            .orderBy('Name');
          })
        .first();
      return res.toJSON()
    } catch (e) {
      throw e;
    }
  }

  async getSchule() {
    try {
      const res = await Schule.query().first()
      delete res.SchulLogo;
      delete res.Einstellungen;
      delete res.Einstellungen2;
      return res.toJSON()
    } catch (e) {
      throw e;
    }
  }

  async getSchuelerfoto(id) {
    try {
      const data = await Schuelerfoto.query().where('Schueler_ID', id).first();
      return Buffer.from(data.Foto, 'binary').toString('base64');
    } catch (e) {
      throw e;
    }
  }

  async getNutzer(username) {
    try {
      const res = await Nutzer.query().where('US_LoginName', username).first();
      return res.toJSON()
    } catch (e) {
      throw e;
    }
  }

}
expose(new Schild())