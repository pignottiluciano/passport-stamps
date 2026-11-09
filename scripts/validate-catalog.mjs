import { countryNames, destinationNames, normalize } from '../src/core/catalog-matching.mjs';

export function validateCatalogAliases(stamps) {
  const owners = new Map();
  for (const stamp of stamps) {
    const isCountry = stamp.kind === 'country';
    const scope = isCountry ? 'country' : stamp.code;
    const names = isCountry ? countryNames(stamp) : destinationNames(stamp);
    for (const name of names) {
      const alias = normalize(name);
      if (!alias) throw new Error(`Empty catalog name for ${stamp.id}`);
      const key = `${scope}:${alias}`;
      const owner = owners.get(key);
      if (owner && owner !== stamp.id) {
        throw new Error(`Ambiguous catalog alias "${name}" in ${scope}: ${owner} and ${stamp.id}`);
      }
      owners.set(key, stamp.id);
    }
  }
}
