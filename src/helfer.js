export const focus = node => node.focus();
export const group_by = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    return result;
  }, {});
};
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
