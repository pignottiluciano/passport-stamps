import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { styles, finish } from './ink.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const countries = JSON.parse(await readFile(resolve(root, 'data/countries.json'), 'utf8'));
const check = process.argv.includes('--check');
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const icons = {
  sun: '<circle r="13" fill="currentColor" stroke="none"/><path d="M0-22V-30M0 22V30M22 0H30M-22 0H-30M16-16L22-22M-16 16L-22 22M16 16L22 22M-16-16L-22-22"/>',
  mountain: '<path d="M-42 24Q-25 14-17-1Q-8-17 0-18Q12-19 17 1L29 23M-48 25H48M-9-21V-42M-24-34H6"/><path d="M-4-16Q-7 10-15 24H16Q7 8 5-16" fill="currentColor" stroke="none"/>',
  arch: '<path d="M-36 25V-13Q0-35 36-13V25ZM-36-3Q0-22 36-3M-36 11H36M-24-8V24M-8-12V24M8-12V24M24-8V24M-40 26H40"/><path d="M-29 7V0M-16 5V-4M0 5V-6M16 5V-4M29 7V0" stroke-width="5"/>',
  torii: '<path d="M-40-27Q0-17 40-27L37-18Q0-9-37-18Z" fill="currentColor" stroke="none"/><path d="M-34-1H34M-23-15L-27 31M23-15L27 31M-30 31H-20M20 31H30M0-14V-2" stroke-width="6"/>',
  star: '<path d="M0-30L8-10L30-9L13 5L18 27L0 15L-18 27L-13 5L-30-9L-8-10Z" fill="currentColor" stroke="none"/>',
  tower: '<path d="M0-37V-27M-4-27Q-5 7-25 33H-13Q0 7 13 33H25Q5 7 4-27ZM-13 8H13M-8-7H8M-19 23H19M-8-19H8"/>'
};
const frames = {
  ticket: '<rect x="24" y="47" width="352" height="206" rx="27" stroke-width="5"/><rect x="33" y="56" width="334" height="188" rx="19" stroke-width="1.6"/><path d="M43 67H357M43 233H357" stroke-dasharray="1 11" stroke-linecap="round" stroke-width="3"/>',
  oval: '<ellipse cx="200" cy="150" rx="179" ry="115" stroke-width="5"/><ellipse cx="200" cy="150" rx="170" ry="106" stroke-width="1.5"/><ellipse cx="200" cy="150" rx="160" ry="97" stroke-dasharray="12 8" stroke-width="1.3"/>',
  round: '<circle cx="200" cy="150" r="130" stroke-width="6"/><circle cx="200" cy="150" r="120" stroke-width="1.5"/><circle cx="200" cy="150" r="113" stroke-dasharray="2 7" stroke-width="1"/>',
  square: '<rect x="81" y="23" width="238" height="254" rx="9" stroke-width="5"/><rect x="90" y="32" width="220" height="236" rx="3" stroke-width="1.5"/><path d="M99 64V42H121M279 42H301V64M99 236V258H121M279 258H301V236" stroke-width="3"/>',
  hexagon: '<path d="M200 17L354 75V225L200 283L46 225V75Z" stroke-width="5"/><path d="M200 27L344 82V218L200 273L56 218V82Z" stroke-width="1.5"/>',
  diamond: '<path d="M184 19Q200 8 216 19L365 134Q384 150 365 166L216 281Q200 292 184 281L35 166Q16 150 35 134Z" stroke-width="5"/><path d="M188 28Q200 20 212 28L357 140Q369 150 357 160L212 272Q200 280 188 272L43 160Q31 150 43 140Z" stroke-width="1.3"/>'
};
const text = (value, x, y, size, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${xml(value)}</text>`;
const label = (value, y, size = 14, extra = '') => text(value, 200, y, size, extra);
const line = (y, x1 = 105, x2 = 295) => `<path d="M${x1} ${y}H${x2}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const icon = (name, x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g>`;
function composition(c) {
  switch (c.code) {
    case 'AR': return icon(c.icon,200,91,.7)+label('REPÚBLICA ARGENTINA',139,24,'font-weight="800" textLength="298" lengthAdjust="spacingAndGlyphs"')+line(153,52,348)+label('BUENOS AIRES',187,29,'font-family="Georgia,serif" font-weight="700"')+label('★  PASAPORTE VIAJERO  ★',213,12,'letter-spacing="2"')+text(c.serial,65,82,11,'text-anchor="start"')+text('01',335,82,13,'text-anchor="end"');
    case 'BR': return label('★  BRASIL  ★',86,19,'letter-spacing="4" font-weight="700"')+icon(c.icon,200,136,.82)+line(165,87,313)+label('RIO DE JANEIRO',197,28,'font-weight="900" textLength="274" lengthAdjust="spacingAndGlyphs"')+label('BOA VIAGEM',222,12,'letter-spacing="3"')+label(c.serial,242,10);
    case 'IT': return label('ITALIA',66,18,'letter-spacing="5"')+icon(c.icon,200,106,.7)+line(134,109,291)+label('ROMA',185,58,'font-family="Georgia,serif"')+line(199,109,291)+label('BENVENUTI',223,15,'letter-spacing="3"')+label(c.serial,247,10);
    case 'JP': return label('JAPAN',64,17,'letter-spacing="6" font-weight="700"')+icon(c.icon,200,112,.85)+line(151,106,294)+label('TOKYO',197,46,'font-weight="900" letter-spacing="3"')+line(211,106,294)+label('WELCOME · ようこそ',237,13)+label(c.serial,255,10,'letter-spacing="2"');
    case 'US': return icon(c.icon,200,69,.6)+label('UNITED STATES',116,15,'letter-spacing="3"')+line(130,78,322)+label('NEW YORK',175,39,'font-family="Georgia,serif" font-weight="700" textLength="267" lengthAdjust="spacingAndGlyphs"')+line(191,78,322)+label('★  ★  ★  ★  ★',218,17,'letter-spacing="5"')+label(c.serial,244,11,'letter-spacing="2"');
    case 'FR': return icon(c.icon,200,83,.65)+label('FRANCE',129,14,'letter-spacing="5"')+line(140,123,277)+label('PARIS',180,48,'font-family="Georgia,serif" font-weight="700" letter-spacing="3"')+line(192,123,277)+label('BON VOYAGE',218,12,'letter-spacing="2"')+label(c.serial,241,10);
    default: throw Error(`Missing composition: ${c.code}`);
  }
}
function stamp(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-labelledby="title-${c.code}"><title id="title-${c.code}">${xml(c.name)} — ${xml(c.city)} passport stamp</title><g color="${c.color}" fill="currentColor" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><g fill="none" stroke="currentColor">${frames[c.shape]}</g>${composition(c)}</g></svg>\n`;
}
const wornStyle = styles.find(style => style.key === 'worn');
const files = new Map();
const seen = new Set();
const manifest = countries.map(c => {
  if (!/^[A-Z]{2}$/.test(c.code) || seen.has(c.code) || !frames[c.shape] || !icons[c.icon]) throw Error(`Invalid or duplicate country: ${c.code}`);
  seen.add(c.code);
  const filename = c.code.toLowerCase();
  const clean = stamp(c);
  const textured = finish(clean, c, wornStyle);
  for (const [path, content] of [[`svg/${filename}.svg`,textured],[`svg/clean/${filename}.svg`,clean]]) {
    if (Buffer.byteLength(content) > 10240) throw Error(`${path} exceeds the 10 KiB budget`);
    files.set(path, content);
  }
  return {...c, finish:'worn', file:`svg/${filename}.svg`, cleanFile:`svg/clean/${filename}.svg`, bytes:Buffer.byteLength(textured), cleanBytes:Buffer.byteLength(clean)};
});
files.set('manifest.json', JSON.stringify(manifest,null,2)+'\n');
const cards = manifest.map(c => `<article><div class="meta"><span>${c.code} / ${xml(c.name)}</span><span>${(c.bytes/1000).toFixed(2)} KB</span></div><div class="art"><img src="../${c.file}" alt="Sello de ${xml(c.name)}, ${xml(c.city)}" width="400" height="300"></div><footer><span>${xml(c.city)}</span><div><a href="../${c.file}" download="${c.code.toLowerCase()}.svg">SVG gastado ↗</a><a href="../${c.cleanFile}" download="${c.code.toLowerCase()}-clean.svg">Limpio ↗</a></div></footer></article>`).join('');
files.set('preview/index.html', `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Passport Stamps — Primera colección</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f0e8;color:#242d31;font-family:Arial,Helvetica,sans-serif}main{max-width:1300px;margin:auto;padding:42px 48px 32px}.top{display:flex;justify-content:space-between;border-bottom:1px solid #c7c9c0;padding-bottom:18px;font-size:11px;letter-spacing:2px;text-transform:uppercase}.intro{display:flex;justify-content:space-between;align-items:end;margin:36px 0 32px;gap:24px}h1{font-family:Georgia,serif;font-weight:400;letter-spacing:-3px;font-size:64px;line-height:1;margin:0}h1 em{color:#9b4e39}p{font-size:14px;line-height:1.6;max-width:340px;margin:0;color:#59615f}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}article{background:#fcfaf5;border:1px solid #d9d9ce;border-radius:3px;overflow:hidden}.meta{padding:15px 18px;display:flex;justify-content:space-between;text-transform:uppercase;font-size:10px;letter-spacing:1.5px;color:#626a66}.art{padding:0 10px}.art img{display:block;width:100%;height:auto}footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e4db;margin:0 18px;padding:14px 0;font-size:11px;gap:10px}footer div{display:flex;gap:12px}a{color:#414f4c;text-underline-offset:4px}a:hover{color:#a14732}a:focus-visible{outline:2px solid #a14732;outline-offset:4px}.bottom{display:flex;justify-content:space-between;gap:20px;font-size:10px;color:#6b726d;margin-top:24px;letter-spacing:1px;text-transform:uppercase}@media(max-width:950px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}h1{font-size:48px}.intro{align-items:start;flex-direction:column}}@media(max-width:580px){main{padding:24px 18px}.grid{grid-template-columns:1fr}h1{font-size:44px}.top{font-size:9px;letter-spacing:1px}.bottom{flex-direction:column}}</style><main><div class="top"><span>Passport Stamps / Biblioteca de sellos</span><span>Vol. 01 — Seis destinos</span></div><div class="intro"><h1>El mundo,<br><em>en tinta.</em></h1><p>Una colección original de sellos de viaje.<br>SVG livianos, fondo transparente y dos acabados: tinta gastada o líneas limpias.</p></div><div class="grid">${cards}</div><div class="bottom"><span>AR · BR · IT · JP · US · FR</span><span>Sin dependencias · Licencia MIT · v0.1.0</span></div></main></html>\n`);
for (const [path, content] of files) {
  const full = resolve(root,path);
  if (check) {
    if (await readFile(full,'utf8') !== content) throw Error(`Stale generated file: ${path}. Run npm run build.`);
  } else {
    await mkdir(dirname(full),{recursive:true});
    await writeFile(full,content);
  }
}
if (check) {
  for (const directory of ['svg','svg/clean']) {
    const actual = (await readdir(resolve(root,directory))).filter(f=>f.endsWith('.svg')).sort();
    const expected = countries.map(c=>c.code.toLowerCase()+'.svg').sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw Error(`Unexpected SVG inventory in ${directory}`);
  }
}
for (const c of manifest) console.log(`${c.code}  ink ${c.bytes} B  clean ${c.cleanBytes} B`);
console.log(`${check ? 'Verified' : 'Built'} ${countries.length} countries, ${countries.length*2} SVGs; all under 10 KiB.`);
