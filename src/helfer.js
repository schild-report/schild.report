export const groupBy = (arr, id) =>
  arr.reduce((entryMap, f) => {
    const fx = id.split(".").reduce((p, c) => (p && p[c]) || null, f);
    return entryMap.set(fx, [...(entryMap.get(fx) || []), f]);
  }, new Map());
export const datum = t => {
  // gibt ein Datum im deutschen Format zurück
  try {
    return new Date(t).toLocaleDateString("de", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Berlin"
    });
  } catch (e) {
    console.log(e);
    return;
  }
};
export const alter = datum => {
  try {
    const d = new Date();
    const g = new Date(datum);
    const alter =
      d.getFullYear() -
      g.getFullYear() -
      (d.getMonth() > g.getMonth() ||
      (d.getMonth() == g.getMonth() && d.getDay() >= g.getDay())
        ? 0
        : 1);
    return alter;
  } catch (e) {
    console.log(e);
    return;
  }
};
