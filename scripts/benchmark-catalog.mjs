import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { catalog } from '../dist/core/generated/catalog.js';
import { countryNames, destinationNames, normalize } from '../dist/core/catalog-matching.mjs';
import { createCatalogIndex } from '../dist/core/catalog-index.js';

const countries = catalog.filter(stamp => stamp.kind === 'country');
function linear(country, city) {
  const countryQuery = normalize(country);
  const match = countries.find(stamp => countryNames(stamp).some(name => normalize(name) === countryQuery));
  if (!match || !city) return match;
  const query = normalize(city);
  return catalog.find(stamp => stamp.kind === 'destination' && stamp.code === match.code &&
    destinationNames(stamp).some(name => normalize(name) === query)) ?? match;
}

const start = performance.now();
const index = createCatalogIndex(catalog);
const firstIndexMs = performance.now() - start;
function indexed(country, city) {
  const match = index.countries.get(normalize(country));
  if (!match || !city) return match;
  return index.destinations.get(match.code)?.get(normalize(city)) ?? match;
}

const queries = catalog.flatMap(stamp => stamp.kind === 'country'
  ? countryNames(stamp).map(name => [name, ''])
  : destinationNames(stamp).map(name => [stamp.code, name]));
queries.push(['AR', 'cordoba'], ['ES', 'cordoba'], ['AR', 'unknown-city'], ['ZZ', '']);
for (const query of queries) assert.equal(indexed(...query), linear(...query), query.join(' / '));

function median(fn) {
  const values = Array.from({ length: 7 }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  });
  return Number(values.sort((a, b) => a - b)[3].toFixed(3));
}

const batch = lookup => {
  for (let repeat = 0; repeat < 8; repeat++) for (const query of queries) lookup(...query);
};
batch(indexed);
batch(linear);

let retainedBytes;
if (global.gc) {
  global.gc();
  const before = process.memoryUsage().heapUsed;
  const copies = Array.from({ length: 100 }, () => createCatalogIndex(catalog));
  global.gc();
  retainedBytes = Math.round((process.memoryUsage().heapUsed - before) / copies.length);
  assert.equal(copies.length, 100);
}

console.log(JSON.stringify({
  node: process.version, equivalentQueries: queries.length,
  lookupsPerBatch: queries.length * 8,
  firstIndexMs: Number(firstIndexMs.toFixed(3)),
  buildIndexMedianMs: median(() => createCatalogIndex(catalog)),
  linearMedianMs: median(() => batch(linear)),
  indexedMedianMs: median(() => batch(indexed)),
  approximateRetainedBytes: retainedBytes
}, null, 2));
