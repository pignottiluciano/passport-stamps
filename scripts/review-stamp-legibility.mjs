import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { finish, styles } from './ink.mjs';
import { createStampSvg } from '../dist/core/index.js';

const date = '2026-11-07';
const legacyWorn = styles.find(style => style.key === 'worn');
const widths = [64, 96, 140];
const catalog = [];
for (const file of ['manifest.json', 'destinations.json']) {
  catalog.push(...JSON.parse(await readFile(file, 'utf8')));
}
const sample = [...new Set(catalog.map(stamp => stamp.shape))].map(shape =>
  catalog.filter(stamp => stamp.shape === shape).sort((a, b) => b.label.length - a.label.length)[0]
);
const image = (svg, width, label) =>
  `<img width="${width}" height="${width * 0.75}" src="data:image/svg+xml,${encodeURIComponent(svg)}" alt="${label}">`;

async function comparison(dated) {
  const styles = dated ? ['Previous worn', 'Updated worn', 'Updated clean'] : ['Worn', 'Clean'];
  const head = widths.map(width => styles.map(style => `<th>${width} px<br>${style}</th>`).join('')).join('');
  const rows = [];
  for (const stamp of sample) {
    const options = { country: stamp.code, city: stamp.kind === 'destination' ? stamp.id : undefined, date: dated ? date : undefined };
    const worn = await createStampSvg(options);
    const clean = await createStampSvg({ ...options, variant: 'clean' });
    const previous = finish(clean, stamp, legacyWorn).replace(/<text x="200" y="235" font-size="16"[^>]*>07 NOV 2026<\/text>/,
      '<text x="200" y="239" font-size="11" font-family="Arial,Helvetica,sans-serif" font-weight="700" letter-spacing="1">07 NOV 2026</text>');
    if (dated && !worn.includes('font-size="16"')) throw Error('The previous date row could not be reconstructed.');
    const designs = dated ? [previous, worn, clean] : [worn, clean];
    const cells = widths.map(width => designs.map((svg, i) =>
      `<td>${image(svg, width, `${stamp.id} ${styles[i]} at ${width} px`)}</td>`).join('')).join('');
    rows.push(`<tr><th>${stamp.shape}<br>${stamp.id}</th>${cells}</tr>`);
  }
  return `<h2>${dated ? 'Dated stamps' : 'Undated stamps'}</h2><table><thead><tr><th>Design</th>${head}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

await mkdir('work', { recursive: true });
await writeFile('work/stamp-legibility.html', `<!doctype html><html lang="en"><meta charset="utf-8"><title>Stamp legibility comparison</title>
<style>body{background:#faf8f3;color:#292823;font:13px system-ui;margin:16px}table{border-collapse:collapse;width:max-content}th,td{padding:4px;text-align:center;border-bottom:1px solid #b3a58e}img{display:block}tr th:first-child{text-align:left;min-width:100px;max-width:120px;overflow-wrap:anywhere}</style>
<h1>Stamp legibility comparison</h1>${await comparison(true)}${await comparison(false)}</html>`);
