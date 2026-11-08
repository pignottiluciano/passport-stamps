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

test('country artwork has no city/airport labels and Mendoza is separate', async () => {
  assert.deepEqual(destinations.map(c => c.id), ['ar-mendoza']);
  assert.equal(destinations[0].code, 'AR');
  for (const c of countries) {
    assert.equal('city' in c, false);
    assert.equal(c.serial, `${c.code} · PASSPORT`);
    const svg = await read(c.file);
    const visibleText = [...svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/gs)].map(m => m[1]).join(' ');
    assert.doesNotMatch(visibleText, /\b(?:BUENOS AIRES|RIO DE JANEIRO|ROMA|TOKYO|NEW YORK|PARIS|EZE|GIG|FCO|HND|JFK|CDG)\b/);
  }
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
