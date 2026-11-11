import { createServer } from 'node:http';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

const core = resolve('dist/core');
const assets = new Map();

async function loadModules(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await loadModules(path);
    else if (/\.m?js$/.test(entry.name)) assets.set(path.slice(core.length + 1).split(sep).join('/'), await readFile(path, 'utf8'));
  }
}
await loadModules(core);
const catalog = JSON.parse(await readFile('manifest.json', 'utf8'));
const codes = ['AR', ...catalog.filter(stamp => stamp.code !== 'AR').slice(0, 49).map(stamp => stamp.code)];
const html = (await readFile(new URL('./benchmark-stamps.html', import.meta.url), 'utf8')).replace('__STAMP_CODES__', JSON.stringify(codes));
for (const [path, source] of assets) assets.set(path, gzipSync(source));
const port = Number(process.argv[2] ?? 4176);
createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html);
    return;
  }
  const match = /^\/run\/\d+\/current\/(.+)$/.exec(request.url);
  const file = match && assets.get(match[1]);
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
