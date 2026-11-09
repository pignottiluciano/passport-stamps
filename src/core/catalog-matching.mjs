/** @param {string} value */
export function normalize(value) {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** @param {{id: string, code: string, name: string, aliases?: readonly string[]}} stamp */
export function countryNames(stamp) {
  return [stamp.id, stamp.code, stamp.name, ...(stamp.aliases ?? [])];
}

/** @param {{id: string, name: string, label: string, aliases?: readonly string[]}} stamp */
export function destinationNames(stamp) {
  return [stamp.id, stamp.id.slice(3), stamp.name, stamp.label, ...(stamp.aliases ?? [])];
}
