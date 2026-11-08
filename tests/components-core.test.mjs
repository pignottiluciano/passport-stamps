import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createStampImage, resolveStamp, formatStampDate, stampSize} from '../dist/core/index.js';
const decode = image => decodeURIComponent(image.src.split(',').slice(1).join(','));
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
