import { countryNames, destinationNames, normalize } from './catalog-matching.mjs';
import type { CountryCode, StampId } from './generated/ids.js';

/** Compact generated row: id, name, icon label, then optional aliases and artwork label. */
export type CatalogRow = readonly [id: StampId, name: string, iconLabel: string, aliases?: readonly string[], label?: string];

export interface CatalogStamp {
  readonly id: StampId;
  readonly code: CountryCode;
  readonly kind: 'country' | 'destination';
  readonly name: string;
  readonly label: string;
  readonly iconLabel: string;
  readonly aliases: readonly string[];
}

/** Restores the fields the build omits; the build validates that ids encode code and kind. */
export function expandCatalog(rows: readonly CatalogRow[]): readonly CatalogStamp[] {
  return rows.map(([id, name, iconLabel, aliases = [], label = name.toUpperCase()]) => ({
    id, code: id.slice(0, 2).toUpperCase() as CountryCode, kind: id.length === 2 ? 'country' : 'destination',
    name, label, iconLabel, aliases
  }));
}

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
