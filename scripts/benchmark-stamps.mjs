import { createServer } from 'node:http';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const core = resolve('dist/core');
const assets = new Map();
const split = new Map();

async function loadModules(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await loadModules(path);
    else if (/\.m?js$/.test(entry.name)) assets.set(path.slice(core.length + 1).split(sep).join('/'), await readFile(path, 'utf8'));
  }
}
await loadModules(core);
const loaders = [];
for (const name of assets.keys()) {
  if (!name.startsWith('art/')) continue;
  const id = name.slice(4, -3);
  const { artwork } = await import(pathToFileURL(resolve(core, name)).href);
  const variants = [];
  for (const [variant, svg] of Object.entries(artwork)) {
    const path = `art/${id}-${variant}.js`;
    split.set(path, `export default ${JSON.stringify(svg)};\n`);
    variants.push(`${variant}: () => import("../${path}")`);
  }
  loaders.push(`${JSON.stringify(id)}: {${variants.join(', ')}}`);
}
for (const [path, source] of assets) {
  if (!path.startsWith('art/')) split.set(path, source);
}
split.set('generated/loaders.js', `export const loaders = {\n${loaders.join(',\n')}\n};\n`);
const index = assets.get('index.js');
const splitIndex = index
  .replace('loaders[stamp.id]', "loaders[stamp.id]?.[date ? (variant === 'worn' ? 'datedWorn' : 'datedClean') : variant]")
  .replace(/const \{ artwork \} = await load\(\);\s*const template = [^;]+;/, 'const { default: template } = await load();');
if (!splitIndex.includes('default: template') || !splitIndex.includes('loaders[stamp.id]?.[')) {
  throw Error('Update the split-artwork prototype to match the renderer.');
}
split.set('index.js', splitIndex);

const catalog = JSON.parse(await readFile('manifest.json', 'utf8'));
const codes = ['AR', ...catalog.filter(stamp => stamp.code !== 'AR').slice(0, 49).map(stamp => stamp.code)];
const html = (await readFile(new URL('./benchmark-stamps.html', import.meta.url), 'utf8')).replace('__STAMP_CODES__', JSON.stringify(codes));
for (const files of [assets, split]) {
  for (const [path, source] of files) files.set(path, gzipSync(source));
}
const port = Number(process.argv[2] ?? 4176);
createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html);
    return;
  }
  const match = /^\/run\/\d+\/(baseline|split)\/(.+)$/.exec(request.url);
  const files = match?.[1] === 'baseline' ? assets : split;
  const file = match && files.get(match[2]);
  if (!file) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'Content-Type': 'text/javascript; charset=utf-8',
    'Content-Encoding': 'gzip',
    'Content-Length': file.length,
    'Cache-Control': 'public, max-age=3600'
  }).end(file);
}).listen(port, '127.0.0.1', () => console.log(`Open http://127.0.0.1:${port}/ and keep the tab active while measuring.`));
