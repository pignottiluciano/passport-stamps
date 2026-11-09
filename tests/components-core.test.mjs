import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createStampSvg, createStampImage, resolveStamp, formatStampDate, stampSize, getCountries, getCities} from '../dist/core/index.js';
const decode = image => decodeURIComponent(image.src.split(',').slice(1).join(','));
test('country and city lists provide stable selector options', () => {
  const countries = getCountries();
  assert.equal(countries.length, 193);
  assert.deepEqual(countries.find(country => country.code === 'AR'), { id: 'ar', code: 'AR', name: 'Argentina' });
  const cities = getCities('Argentina');
  assert.deepEqual(cities, getCities(' ar '));
  assert.equal(cities.length, 20);
  assert.ok(cities.every(city => city.code === 'AR'));
  assert.ok(cities.some(city => city.id === 'ar-mendoza'));
  assert.ok(cities.every((city, i) => i === 0 || cities[i - 1].name.localeCompare(city.name, 'en') <= 0));
  assert.deepEqual(getCities('JP'), []);
  assert.throws(() => getCities('ZZ'), { code: 'INVALID_COUNTRY' });
});

test('country codes and names resolve without a city', () => {
  for(const country of ['AR','ar','Argentina']) assert.equal(resolveStamp({country}).stamp.id,'ar');
});
test('city names, slugs and IDs are restricted to the selected country', () => {
  for(const city of ['Mendoza','mendoza','ar-mendoza']) assert.equal(resolveStamp({country:'AR',city}).stamp.id,'ar-mendoza');
  assert.equal(resolveStamp({country:'AR',city:'Córdoba'}).stamp.id,'ar-cordoba');
  assert.equal(resolveStamp({country:'ES',city:'cordoba'}).stamp.id,'es-cordoba');
  const fallback=resolveStamp({country:'FR',city:'Mendoza'});
  assert.equal(fallback.stamp.id,'fr');assert.equal(fallback.fallback,true);
});
test('strict city matching rejects unknown and cross-country cities', () => {
  assert.equal(resolveStamp({ country: 'AR', city: 'Mendoza', strictCity: true }).stamp.id, 'ar-mendoza');
  assert.equal(resolveStamp({ country: 'AR', strictCity: true }).stamp.id, 'ar');
  assert.equal(resolveStamp({ country: 'AR', city: '  ', strictCity: true }).stamp.id, 'ar');
  for (const city of ['Mendoza', 'Unknown city']) {
    assert.throws(() => resolveStamp({ country: 'FR', city, strictCity: true }), { code: 'INVALID_CITY' });
  }
});

test('invalid countries fail explicitly rather than creating a guessed file path', () => {
  assert.throws(()=>resolveStamp({country:'../invalid'}),{code:'INVALID_COUNTRY'});
});
test('dates validate calendar days and do not shift across timezones', () => {
  assert.equal(formatStampDate('2026-11-07'),'07 NOV 2026');
  assert.equal(formatStampDate('2024-02-29'),'29 FEB 2024');
  for(const date of ['2026-02-29','2026-04-31','2026-13-01','2026-00-01','0000-01-01','2026-11-07T00:00:00Z','<script>']) {
    assert.throws(()=>formatStampDate(date),{code:'INVALID_DATE'});
  }
  assert.equal(formatStampDate(''),undefined);
});
test('variants and sizes have clear validation', () => {
  assert.throws(()=>resolveStamp({country:'AR',variant:'invalid'}),{code:'INVALID_VARIANT'});
  for(const size of [0,-5,NaN,Infinity])assert.throws(()=>stampSize(size),{code:'INVALID_SIZE'});
  assert.equal(stampSize(),240);
});
test('undated image content is identical to existing worn and clean SVG files', async () => {
  for(const variant of ['worn','clean']){
    const image=await createStampImage({country:'AR',city:'Mendoza',variant});
    assert.equal(decode(image),await readFile(`svg/${variant==='clean'?'clean/':''}ar-mendoza.svg`,'utf8'));
    assert.equal(image.id,'ar-mendoza');assert.equal(image.fallback,false);
  }
});
test('date is embedded in SVG text, including for country-only stamps', async () => {
  for(const options of [{country:'AR'},{country:'AR',city:'Mendoza'},{country:'JP',variant:'clean'}]){
    const image=await createStampImage({...options,date:'2026-11-07'});
    const svg=decode(image);
    assert.match(svg,/<text[^>]*>07 NOV 2026<\/text>/);
    assert.doesNotMatch(svg,/__PASSPORT_DATE__/);
    assert.match(image.alt,/07 NOV 2026/);
    assert.equal(/<filter/.test(svg),options.variant!=='clean');
  }
});

test('SVG export includes the date and preserves the selected ink finish', async () => {
  for (const variant of ['worn', 'clean']) {
    const options = { country: 'AR', city: 'Mendoza', variant };
    assert.equal(await createStampSvg(options), await readFile(`svg/${variant === 'clean' ? 'clean/' : ''}ar-mendoza.svg`, 'utf8'));
    const dated = { ...options, date: '2026-11-07' };
    const svg = await createStampSvg(dated);
    assert.equal(svg, decode(await createStampImage(dated)));
    assert.match(svg, /<title[^>]*>.*07 NOV 2026<\/title>/);
    assert.match(svg, /<text[^>]*>07 NOV 2026<\/text>/);
    assert.equal(/<filter\b/.test(svg), variant === 'worn');
  }
});

test('numeric date format preserves the calendar day in exported artwork', async () => {
  assert.equal(formatStampDate('2024-02-29', 'numeric'), '29/02/2024');
  assert.throws(() => formatStampDate('2026-02-29', 'numeric'), { code: 'INVALID_DATE' });
  assert.throws(() => formatStampDate('2026-11-07', 'invalid'), { code: 'INVALID_DATE_FORMAT' });
  const image = await createStampImage({ country: 'AR', city: 'Mendoza', date: '2026-11-07', dateFormat: 'numeric' });
  assert.match(decode(image), /<text[^>]*>07\/11\/2026<\/text>/);
  assert.match(image.alt, /07\/11\/2026/);
});
