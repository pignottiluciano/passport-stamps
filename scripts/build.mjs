import { validateCatalogAliases } from './validate-catalog.mjs';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { catalogWornStyle, finish } from '../src/core/ink.mjs';
import { assembleStamp, frames } from '../src/core/stamp-svg.mjs';
import { icons as countryIcons } from './icons.mjs';
import { destinationIcons } from './destination-icons.mjs';
import { europeIcons } from './europe-icons.mjs';
import { galleryPage } from './gallery.mjs';

const icons = {...countryIcons, ...destinationIcons, ...europeIcons};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stamps = JSON.parse(await readFile(resolve(root, 'data/stamps.json'), 'utf8'));
const check = process.argv.includes('--check');
const roster = JSON.parse(await readFile(resolve(root, 'data/un-members.json'), 'utf8'));
const expectedMembers = new Set(roster.members.map(c => c.code));
const actualMembers = stamps.filter(c => c.kind === 'country');
if (expectedMembers.size !== 193 || actualMembers.length !== 193 || actualMembers.some(c => !expectedMembers.has(c.code)) || new Set(actualMembers.map(c => c.code)).size !== 193) throw Error('Country catalog must match the 193 verified UN members exactly.');
if (actualMembers.some(c => 'city' in c || c.serial !== `${c.code} · PASSPORT`)) throw Error('Country stamps must not contain cities or airport codes.');
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const text = (value, x, y, size, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${xml(value)}</text>`;
const label = (value, y, size = 14, extra = '') => text(value, 200, y, size, extra);
const line = (y, x1 = 105, x2 = 295) => `<path d="M${x1} ${y}H${x2}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
const icon = (name, x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g>`;
// Names wrap into at most three lines. Explicit text widths keep long names inside frames.
function standardComposition(c, footer = c.shape === 'diamond' ? c.code : c.serial) {
  const lines = [];
  for (const word of c.label.split(' ')) {
    if (!lines.length || (lines.at(-1) + ' ' + word).length > 14) lines.push(word);
    else lines[lines.length - 1] += ' ' + word;
  }
  if (lines.length > 3) throw Error(`Stamp label needs a shorter display form: ${c.id}`);
  const widths = {ticket:294,oval:270,round:206,square:192,hexagon:272,diamond:210};
  const width = widths[c.shape];
  const first = lines.length === 1 ? 184 : lines.length === 2 ? 171 : 165;
  const spacing = lines.length === 3 ? 23 : 29;
  const size = lines.length === 1 ? 42 : lines.length === 2 ? 31 : 24;
  const headings = lines.map((value,i) => label(value, first+i*spacing, size, `font-family="${c.shape === 'square' || c.shape === 'oval' ? 'Arial,Helvetica,sans-serif' : 'Georgia,serif'}" font-weight="700" textLength="${Math.min(width, Math.round(value.length*size*.65))}" lengthAdjust="spacingAndGlyphs"`)).join('');
  // Tall destination landmarks stay below the ticket's dotted inner border.
  const destinationTicket = c.kind === 'destination' && c.shape === 'ticket';
  const scale = destinationTicket ? .64 : c.icon === 'liberty' || c.icon === 'oryx' ? .68 : .79;
  const footerAttributes = c.kind === 'destination' && footer.length > 12 ? 'letter-spacing="1" textLength="100" lengthAdjust="spacingAndGlyphs"' : 'letter-spacing="2"';
  return icon(c.icon,200,destinationTicket ? 110 : 103,scale)+line(143,200-width/2,200+width/2)+headings+label(footer,239,10,footerAttributes);
}
function composition(c) {
  switch (c.id) {
    case 'ar': return label('REPÚBLICA',81,12,'letter-spacing="4"')+icon(c.icon,200,112,.8)+label('ARGENTINA',179,40,'font-family="Georgia,serif" font-weight="700" textLength="290" lengthAdjust="spacingAndGlyphs"')+line(191,52,348)+label('PASAPORTE',216,16,'letter-spacing="3"')+text(c.serial,55,81,10,'text-anchor="start"')+text('01',345,81,12,'text-anchor="end"');
    case 'br': return label('REPÚBLICA FEDERATIVA',76,11,'letter-spacing="2"')+icon(c.icon,200,119,.82)+line(159,87,313)+label('BRASIL',197,43,'font-weight="900" letter-spacing="5"')+label('BOA VIAGEM',222,14,'letter-spacing="2"')+label(c.serial,242,10);
    case 'it': return label('REPUBBLICA ITALIANA',64,10,'letter-spacing="1.5"')+icon(c.icon,200,109,.94)+line(147,109,291)+label('ITALIA',190,45,'font-family="Georgia,serif" font-weight="700" letter-spacing="2"')+label('BENVENUTI',221,13,'letter-spacing="4"')+label(c.serial,248,10);
    case 'jp': return label('日本',67,22)+icon(c.icon,200,113,1)+line(154,106,294)+label('JAPAN',198,43,'font-weight="900" letter-spacing="3"')+line(211,106,294)+label('ようこそ',237,13)+label(c.serial,255,10,'letter-spacing="2"');
    case 'us': return icon(c.icon,200,91,.86)+label('UNITED STATES',161,29,'font-family="Georgia,serif" font-weight="700" textLength="274" lengthAdjust="spacingAndGlyphs"')+line(177,78,322)+label('WELCOME',203,17,'letter-spacing="4"')+label('★  ★  ★  ★  ★',229,16,'letter-spacing="5"')+label(c.serial,251,10,'letter-spacing="2"');
    case 'fr': return icon(c.icon,200,91,.88)+line(139,123,277)+label('FRANCE',179,36,'font-family="Georgia,serif" font-weight="700" letter-spacing="2"')+line(193,123,277)+label('BON VOYAGE',217,12,'letter-spacing="4"')+label(c.code,237,10,'letter-spacing="3"');
    case 'ar-mendoza': return label('ARGENTINA',79,13,'letter-spacing="4"')+icon(c.icon,200,117,.9)+line(163,53,347)+label('MENDOZA',199,39,'font-family="Georgia,serif" font-weight="700" letter-spacing="2"')+label('TIERRA DEL VINO · ANDES',224,12,'letter-spacing="1.5"')+text(c.serial,53,81,10,'text-anchor="start"');
    default: if (c.kind === 'country') return standardComposition(c); if (c.kind === 'destination') return standardComposition(c, c.countryLabel); throw Error(`Missing composition: ${c.id}`);
  }
}
// Dated stamps reserve a separate date row inside every frame; assembleStamp() adds the row and scaling.
// Existing undated artwork is unchanged.
function stampArt(c) {
  const b = composition(c);
  const d = standardComposition({...c, kind:'destination'}, c.kind === 'country' ? c.code : c.countryLabel);
  return {c:c.color, s:c.shape, t:`${xml(c.name)} — ${xml(c.iconLabel)}`, b, ...(d === b ? {} : {d})};
}
// Single-quoted literals avoid escaping every attribute quote; JSON handles anything unusual.
const literal = value => typeof value === 'string' && !/['\\\n\r\u2028\u2029]/.test(value) ? `'${value}'` : JSON.stringify(value);
const artModule = art => 'export const art = {' + Object.entries(art).map(([key, value]) => `${key}:${literal(value)}`).join(',') + '};\n';
const files = new Map();
const seen = new Set();
const manifest = stamps.map(c => {
  if (!/^[A-Z]{2}$/.test(c.code) || !/^[a-z]{2}(?:-[a-z0-9]+)*$/.test(c.id) || (c.kind === 'country' ? c.id !== c.code.toLowerCase() : !c.id.startsWith(c.code.toLowerCase() + '-')) || seen.has(c.id) || !['country','destination'].includes(c.kind) || !frames[c.shape] || !icons[c.icon]) throw Error(`Invalid or duplicate stamp: ${c.id}`);
  if (c.kind === 'destination' && (!expectedMembers.has(c.code) || !c.countryLabel || !c.label)) throw Error(`Invalid destination metadata: ${c.id}`);
  seen.add(c.id);
  const filename = c.id;
  const art = stampArt(c);
  const clean = assembleStamp(c.id, art);
  const datedClean = assembleStamp(c.id, art, true);
  const datedWorn = finish(datedClean, c, catalogWornStyle);
  const textured = finish(clean, c, catalogWornStyle);
  const artwork = { clean, worn: textured, datedClean, datedWorn };
  for (const [variant, svg] of Object.entries(artwork)) {
    if (Buffer.byteLength(svg) > 10240) throw Error(`${c.id} (${variant}) exceeds the 10 KiB budget`);
  }
  files.set(`src/core/art/${c.id}.ts`, artModule(art));
  files.set(`svg/${filename}.svg`, textured);
  files.set(`svg/clean/${filename}.svg`, clean);
  return {...c, finish:'worn', file:`svg/${filename}.svg`, cleanFile:`svg/clean/${filename}.svg`, bytes:Buffer.byteLength(textured), cleanBytes:Buffer.byteLength(clean)};
});
validateCatalogAliases(manifest);
const countries = manifest.filter(c => c.kind === 'country');
const destinations = manifest.filter(c => c.kind === 'destination');
const compactCatalog = manifest.map(c=>({id:c.id,code:c.code,kind:c.kind,name:c.name,label:c.label,iconLabel:c.iconLabel,aliases:c.aliases??[]}));
const literalUnion = entries => entries.map(entry => JSON.stringify(entry)).sort().join(' | ');
files.set('src/core/generated/ids.ts', [
  `export type CountryCode = ${literalUnion(countries.map(country => country.code))};`,
  `export type StampId = ${literalUnion(manifest.map(stamp => stamp.id))};`,
  `export type DestinationId = ${literalUnion(destinations.map(destination => destination.id))};`
].join('\n') + '\n');
files.set('src/core/generated/catalog.ts', 'import type { CountryCode, StampId } from "./ids.js";\nexport const catalog: ReadonlyArray<{id:StampId;code:CountryCode;kind:string;name:string;label:string;iconLabel:string;aliases:readonly string[]}> = '+JSON.stringify(compactCatalog)+';\n');
files.set('src/core/generated/loaders.ts', 'import type { StampArt } from "../stamp-svg.mjs";\nexport const loaders: Record<string, () => Promise<{art:StampArt}>> = {\n'+manifest.map(c=>JSON.stringify(c.id)+': () => import("../art/'+c.id+'.js")').join(',\n')+'\n};\n');
files.set('manifest.json', JSON.stringify(countries,null,2)+'\n');
files.set('destinations.json', JSON.stringify(destinations,null,2)+'\n');
const destinationGroups = [...new Set(destinations.map(c=>c.code))];
files.set('docs/DESTINATIONS.md', `# Destination catalog\n\n${destinations.length} destinations across ${destinationGroups.length} countries. Every stamp includes worn and clean versions.\n\n` + destinationGroups.map(code=>{
  const group=destinations.filter(c=>c.code===code);
  return `## ${group[0].countryName} (${group.length})\n\n| Destination | Symbol | Worn | Clean |\n| --- | --- | --- | --- |\n`+group.map(c=>`| ${c.name} | ${c.iconLabel} | [SVG](../${c.file}) | [SVG](../${c.cleanFile}) |`).join('\n');
}).join('\n\n') + '\n\n## Surrounding-area references\n\n' + destinations.filter(c=>c.associationNote).map(c=>`- **${c.name}:** ${c.associationNote}`).join('\n') + '\n\nMont-Saint-Michel is classified as a landmark destination. Drawings are simplified interpretations; some landmarks represent the surrounding tourist area rather than the city center. See [sources](SOURCES.md).\n');
files.set('preview/index.html', galleryPage(countries, destinations));
files.set('preview/gallery.css', await readFile(resolve(root, 'scripts/gallery.css'), 'utf8'));
const heroStamp = stamps.find(c=>c.id==='ar-mendoza');
files.set('preview/hero-mendoza.svg', finish(assembleStamp(heroStamp.id, stampArt(heroStamp), true), heroStamp, catalogWornStyle).replaceAll('__PASSPORT_DATE__','07 NOV 2026'));
files.set('preview/gallery.js', await readFile(resolve(root, 'scripts/gallery-client.js'), 'utf8'));
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
const bytes = countries.map(c => c.bytes);
console.log(`Countries: ${countries.length}; worn SVGs: ${Math.min(...bytes)}–${Math.max(...bytes)} B; total: ${bytes.reduce((a,b)=>a+b,0)} B.`);
console.log(`${check ? 'Verified' : 'Built'} ${countries.length} countries + ${destinations.length} destinations, ${stamps.length*2} SVGs; all under 10 KiB.`);
if (destinations.length) console.log(`Destination worn SVGs: ${Math.min(...destinations.map(c=>c.bytes))}–${Math.max(...destinations.map(c=>c.bytes))} B; total: ${destinations.reduce((sum,c)=>sum+c.bytes,0)} B.`);
