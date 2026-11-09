import { countryNames, destinationNames, normalize } from './catalog-matching.mjs';
import type { catalog } from './generated/catalog.js';

type CatalogStamp = typeof catalog[number];

export function createCatalogIndex(stamps: readonly CatalogStamp[]) {
  const countries = new Map<string, CatalogStamp>();
  const destinations = new Map<string, Map<string, CatalogStamp>>();

  for (const stamp of stamps) {
    if (stamp.kind === 'country') {
      for (const name of countryNames(stamp)) countries.set(normalize(name), stamp);
      continue;
    }
    let cities = destinations.get(stamp.code);
    if (!cities) {
      cities = new Map();
      destinations.set(stamp.code, cities);
    }
    for (const name of destinationNames(stamp)) cities.set(normalize(name), stamp);
  }
  return { countries, destinations };
}
