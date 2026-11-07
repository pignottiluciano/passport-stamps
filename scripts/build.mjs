import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { styles, finish } from './ink.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stamps = JSON.parse(await readFile(resolve(root, 'data/stamps.json'), 'utf8'));
const check = process.argv.includes('--check');
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const icons = {
  sun: '<circle r="13"/><circle cx="-4" cy="-2" r="1.4" fill="currentColor" stroke="none"/><circle cx="4" cy="-2" r="1.4" fill="currentColor" stroke="none"/><path d="M-5 5Q0 9 5 5M0-22V-33M0 22V33M22 0H33M-22 0H-33M16-16L24-24M-16 16L-24 24M16 16L24 24M-16-16L-24-24M8-20Q14-26 12-31M20-8Q27-9 30-14M20 8Q26 14 31 12M8 20Q9 27 14 30M-8 20Q-14 26-12 31M-20 8Q-27 9-30 14M-20-8Q-26-14-31-12M-8-20Q-9-27-14-30"/>',
  christ: '<circle cy="-32" r="5" fill="currentColor" stroke="none"/><path d="M-6-24L-41-21V-14L-10-15L-13 24H13L10-15L41-14V-21L6-24Z" fill="currentColor" stroke="none"/><path d="M0-19V20M-6 23V29M6 23V29M-16 30H16M-22 36H22M-34 41L-20 35M20 35L34 41"/>',
  colosseum: '<path d="M-43 25V-15Q-6-35 35-17L43-10V25ZM-43-4Q-5-21 43-2M-43 10Q-2-1 43 12M-43 25Q0 17 43 25M-43-15V25M-33-20V23M-21-24V21M-7-26V20M8-25V21M22-22V22M35-17V24M-47 29H47"/><path d="M-37-9V-13Q-35-17-33-13M-26-13V-17Q-24-21-22-17M-12-15V-19Q-10-23-8-19M3-15V-19Q5-23 7-19M17-13V-17Q19-21 21-17M30-9V-13Q32-17 34-13M-37 7V2Q-35-2-33 2M-26 4V-1Q-24-5-22-1M-12 2V-3Q-10-7-8-3M3 2V-3Q5-7 7-3M17 4V-1Q19-5 21-1M30 7V2Q32-2 34 2" stroke-width="3"/>',
  fuji: '<path d="M-50 26L-9-25H9L50 26ZM-24-6L-13-2L-6-10L1-4L9-10L20-7M-54 30H54"/><circle cx="30" cy="-24" r="9" fill="currentColor" stroke="none"/><path d="M-8-23L-42 23M8-23L40 23" stroke-width="1"/>',
  liberty: '<path d="M-13 31L-8-6L-18-15L-24-39L-20-43L-12-22L-3-16L6-15L15-3L10 11L16 31Z" fill="currentColor" stroke="none"/><circle cx="1" cy="-26" r="7"/><path d="M-6-31L-10-39M-3-34L-4-43M2-34L3-44M6-32L12-40M8-27L17-30M-6-26H7M-21-44V-50M-26-43H-16M-22-50Q-30-57-20-65Q-13-55-22-50"/><path d="M8-4L20-7L24 10L12 13Z" fill="currentColor" stroke="none"/><path d="M-6-5L-10 29M1-8V29M6 8L10 29M-20 32H22V39H-20ZM-26 45H28"/>',
  tower: '<path d="M0-43V-33M-4-33Q-5 7-29 37H-15Q0 9 15 37H29Q5 7 4-33ZM-14 9H14M-9-9H9M-22 27H22M-8-23H8M-13 10L11 26M13 10L-11 26M-8-9L10 8M8-9L-10 8M-33 39H33"/>',
  vineyard: '<path d="M-65 15L-36-23L-23-7L-7-34L18-5L33-20L65 15M-45-11L-35-8L-29-13M-18-17L-7-11L0-24M-65 21H65" stroke-width="2"/><g fill="currentColor" stroke="none"><circle cx="-14" cy="8" r="8"/><circle cx="3" cy="8" r="8"/><circle cx="20" cy="8" r="8"/><circle cx="-6" cy="22" r="8"/><circle cx="11" cy="22" r="8"/><circle cx="3" cy="36" r="8"/></g><path d="M2 0Q0-13 11-21M8-13Q16-29 30-21Q27-8 8-13"/>'
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
  switch (c.id) {
    case 'ar': return label('REPÚBLICA',81,12,'letter-spacing="4"')+icon(c.icon,200,112,.8)+label('ARGENTINA',179,40,'font-family="Georgia,serif" font-weight="700" textLength="290" lengthAdjust="spacingAndGlyphs"')+line(191,52,348)+label('BUENOS AIRES',216,16,'letter-spacing="3"')+text(c.serial,55,81,10,'text-anchor="start"')+text('01',345,81,12,'text-anchor="end"');
    case 'br': return label('REPÚBLICA FEDERATIVA',76,11,'letter-spacing="2"')+icon(c.icon,200,119,.82)+line(159,87,313)+label('BRASIL',197,43,'font-weight="900" letter-spacing="5"')+label('RIO DE JANEIRO',222,14,'letter-spacing="2"')+label(c.serial,242,10);
    case 'it': return label('REPUBBLICA ITALIANA',64,10,'letter-spacing="1.5"')+icon(c.icon,200,109,.94)+line(147,109,291)+label('ITALIA',190,45,'font-family="Georgia,serif" font-weight="700" letter-spacing="2"')+label('ROMA',221,18,'letter-spacing="4"')+label(c.serial,248,10);
    case 'jp': return label('日本',67,22)+icon(c.icon,200,113,1)+line(154,106,294)+label('JAPAN',198,43,'font-weight="900" letter-spacing="3"')+line(211,106,294)+label('TOKYO · ようこそ',237,13)+label(c.serial,255,10,'letter-spacing="2"');
    case 'us': return icon(c.icon,200,91,.86)+label('UNITED STATES',161,29,'font-family="Georgia,serif" font-weight="700" textLength="274" lengthAdjust="spacingAndGlyphs"')+line(177,78,322)+label('NEW YORK',203,17,'letter-spacing="4"')+label('★  ★  ★  ★  ★',229,16,'letter-spacing="5"')+label(c.serial,251,10,'letter-spacing="2"');
    case 'fr': return icon(c.icon,200,91,.88)+line(139,123,277)+label('FRANCE',179,36,'font-family="Georgia,serif" font-weight="700" letter-spacing="2"')+line(193,123,277)+label('PARIS',217,17,'letter-spacing="4"')+label('BON VOYAGE',237,10,'letter-spacing="1"');
    case 'ar-mendoza': return label('ARGENTINA',79,13,'letter-spacing="4"')+icon(c.icon,200,117,.9)+line(163,53,347)+label('MENDOZA',199,39,'font-family="Georgia,serif" font-weight="700" letter-spacing="2"')+label('TIERRA DEL VINO · ANDES',224,12,'letter-spacing="1.5"')+text(c.serial,53,81,10,'text-anchor="start"');
    default: throw Error(`Missing composition: ${c.id}`);
  }
}
function stamp(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-labelledby="title-${c.id}"><title id="title-${c.id}">${xml(c.name)} — ${xml(c.iconLabel)} passport stamp</title><g color="${c.color}" fill="currentColor" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><g fill="none" stroke="currentColor">${frames[c.shape]}</g>${composition(c)}</g></svg>\n`;
}
const wornStyle = styles.find(style => style.key === 'worn');
const files = new Map();
const seen = new Set();
const manifest = stamps.map(c => {
  if (!/^[A-Z]{2}$/.test(c.code) || !/^[a-z]{2}(?:-[a-z0-9]+)*$/.test(c.id) || (c.kind === 'country' ? c.id !== c.code.toLowerCase() : !c.id.startsWith(c.code.toLowerCase() + '-')) || seen.has(c.id) || !['country','destination'].includes(c.kind) || !frames[c.shape] || !icons[c.icon]) throw Error(`Invalid or duplicate stamp: ${c.id}`);
  seen.add(c.id);
  const filename = c.id;
  const clean = stamp(c);
  const textured = finish(clean, c, wornStyle);
  for (const [path, content] of [[`svg/${filename}.svg`,textured],[`svg/clean/${filename}.svg`,clean]]) {
    if (Buffer.byteLength(content) > 10240) throw Error(`${path} exceeds the 10 KiB budget`);
    files.set(path, content);
  }
  return {...c, finish:'worn', file:`svg/${filename}.svg`, cleanFile:`svg/clean/${filename}.svg`, bytes:Buffer.byteLength(textured), cleanBytes:Buffer.byteLength(clean)};
});
files.set('manifest.json', JSON.stringify(manifest,null,2)+'\n');
const cards = manifest.map(c => `<article><div class="meta"><span>${c.kind === 'country' ? 'País' : c.code + ' · Destino'} / ${xml(c.name)}</span><span>${(c.bytes/1000).toFixed(2)} KB</span></div><div class="art"><img src="../${c.file}" alt="${xml(c.name)}: ${xml(c.iconLabel)}" width="400" height="300"></div><footer><span>${xml(c.iconLabel)}</span><div><a href="../${c.file}" download="${c.id}.svg">SVG gastado ↗</a><a href="../${c.cleanFile}" download="${c.id}-clean.svg">Limpio ↗</a></div></footer></article>`).join('');
files.set('preview/index.html', `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Passport Stamps — Primera colección</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f0e8;color:#242d31;font-family:Arial,Helvetica,sans-serif}main{max-width:1300px;margin:auto;padding:42px 48px 32px}.top{display:flex;justify-content:space-between;border-bottom:1px solid #c7c9c0;padding-bottom:18px;font-size:11px;letter-spacing:2px;text-transform:uppercase}.intro{display:flex;justify-content:space-between;align-items:end;margin:36px 0 32px;gap:24px}h1{font-family:Georgia,serif;font-weight:400;letter-spacing:-3px;font-size:64px;line-height:1;margin:0}h1 em{color:#9b4e39}p{font-size:14px;line-height:1.6;max-width:340px;margin:0;color:#59615f}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}article{background:#fcfaf5;border:1px solid #d9d9ce;border-radius:3px;overflow:hidden}.meta{padding:15px 18px;display:flex;justify-content:space-between;text-transform:uppercase;font-size:10px;letter-spacing:1.5px;color:#626a66}.art{padding:0 10px}.art img{display:block;width:100%;height:auto}footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e4db;margin:0 18px;padding:14px 0;font-size:10px;gap:10px}footer>span{max-width:42%}footer div{display:flex;gap:12px}a{color:#414f4c;text-underline-offset:4px}a:hover{color:#a14732}a:focus-visible{outline:2px solid #a14732;outline-offset:4px}.bottom{display:flex;justify-content:space-between;gap:20px;font-size:10px;color:#6b726d;margin-top:24px;letter-spacing:1px;text-transform:uppercase}@media(max-width:950px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}h1{font-size:48px}.intro{align-items:start;flex-direction:column}}@media(max-width:580px){main{padding:24px 18px}.grid{grid-template-columns:1fr}h1{font-size:44px}.top{font-size:9px;letter-spacing:1px}.bottom{flex-direction:column}}</style><main><div class="top"><span>Passport Stamps / Biblioteca de sellos</span><span>Vol. 01 — Países y destinos</span></div><div class="intro"><h1>El mundo,<br><em>en tinta.</em></h1><p>Seis países y un destino con símbolos propios.<br>SVG livianos, fondo transparente y acabado de tinta gastada.</p></div><div class="grid">${cards}</div><div class="bottom"><span>AR · BR · IT · JP · US · FR · MENDOZA</span><span>Sin dependencias · Licencia MIT · v0.1.0</span></div></main></html>\n`);
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
    const expected = stamps.map(c=>c.id+'.svg').sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw Error(`Unexpected SVG inventory in ${directory}`);
  }
}
for (const c of manifest) console.log(`${c.id}  ink ${c.bytes} B  clean ${c.cleanBytes} B`);
console.log(`${check ? 'Verified' : 'Built'} ${stamps.length} stamps, ${stamps.length*2} SVGs; all under 10 KiB.`);
