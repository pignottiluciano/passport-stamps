import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, base), 'utf8');
const countries = JSON.parse(await read('manifest.json'));
const destinations = JSON.parse(await read('destinations.json'));
const source = JSON.parse(await read('data/un-members.json'));

test('country collection contains exactly the 193 verified UN members', () => {
  const expected = source.members.map(c => c.code).sort();
  assert.equal(expected.length, 193);
  assert.equal(new Set(expected).size, 193);
  assert.deepEqual(countries.map(c => c.code).sort(), expected);
  const names = new Map(source.members.map(c => [c.code, c.officialName]));
  for (const c of countries) {
    assert.equal(c.id, c.code.toLowerCase());
    assert.equal(c.kind, 'country');
    assert.equal(c.officialName, names.get(c.code));
    assert.ok(c.icon && c.iconLabel && c.name && c.label);
  }
});

test('country artwork has no city/airport labels', async () => {
  for (const c of countries) {
    assert.equal('city' in c, false);
    assert.equal(c.serial, `${c.code} · PASSPORT`);
    const svg = await read(c.file);
    const visibleText = [...svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/gs)].map(m => m[1]).join(' ');
    assert.doesNotMatch(visibleText, /\b(?:BUENOS AIRES|RIO DE JANEIRO|ROMA|TOKYO|NEW YORK|PARIS|EZE|GIG|FCO|HND|JFK|CDG)\b/);
  }
});

test('all 60 agreed destinations are separate, unique, and assigned to the right country', () => {
  const expected = {
    AR:'buenos-aires cordoba rosario mendoza mar-del-plata la-plata santa-fe salta san-miguel-de-tucuman purmamarca cafayate puerto-iguazu posadas bariloche san-martin-de-los-andes villa-la-angostura puerto-madryn el-calafate el-chalten ushuaia',
    ES:'madrid barcelona sevilla granada cordoba valencia bilbao santiago-de-compostela segovia toledo',
    FR:'paris lyon marseille bordeaux nice strasbourg avignon carcassonne chamonix mont-saint-michel',
    DE:'berlin munich hamburg cologne frankfurt dresden heidelberg nuremberg lubeck fussen',
    IT:'rome florence venice milan pisa naples verona bologna siena alberobello'
  };
  const ids = Object.entries(expected).flatMap(([code,slugs])=>slugs.split(' ').map(slug=>code.toLowerCase()+'-'+slug));
  assert.equal(destinations.length,60);
  assert.equal(new Set(destinations.map(c=>c.id)).size,60);
  assert.deepEqual(destinations.map(c=>c.id).sort(),ids.sort());
  for (const c of destinations) {
    const parent=countries.find(country=>country.code===c.code);
    assert.ok(parent);
    assert.equal(c.kind,'destination');
    assert.ok(c.id.startsWith(c.code.toLowerCase()+'-'));
    assert.equal(c.countryName,parent.name);
    assert.equal(c.region,parent.region);
    assert.ok(c.countryLabel && c.label && c.destinationType && c.adminArea);
    assert.equal(countries.some(country=>country.id===c.id),false);
  }
  assert.equal(destinations.find(c=>c.id==='fr-mont-saint-michel').destinationType,'landmark');
  assert.equal(destinations.find(c=>c.id==='de-fussen').landmarkLocality,'Schwangau');
  assert.notEqual(destinations.find(c=>c.id==='ar-cordoba').icon,destinations.find(c=>c.id==='es-cordoba').icon);
});

test('each catalog asset exists, is self-contained, and stays below 10 KiB', async () => {
  for (const c of [...countries, ...destinations]) {
    for (const [file, bytes] of [[c.file, c.bytes], [c.cleanFile, c.cleanBytes]]) {
      const svg = await read(file);
      assert.equal(Buffer.byteLength(svg), bytes, file);
      assert.ok(bytes < 10240, file);
      assert.match(svg, /viewBox="0 0 400 300"/);
      assert.match(svg, /<title\b/);
      assert.doesNotMatch(svg, /<(?:script|image)\b|(?:xlink:)?href\s*=/);
      const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
      assert.equal(ids.length, new Set(ids).size, file);
      for (const ref of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(ref[1]), file);
      if (file === c.file) assert.match(svg, /<feTurbulence\b/);
      else assert.doesNotMatch(svg, /<filter\b/);
    }
  }
});

test('SVG inventory has no missing or orphaned files', async () => {
  const expected = [...countries, ...destinations].map(c => c.id+'.svg').sort();
  for (const path of ['svg/', 'svg/clean/']) {
    const actual = (await readdir(fileURLToPath(new URL(path, base)))).filter(f => f.endsWith('.svg')).sort();
    assert.deepEqual(actual, expected);
  }
});
