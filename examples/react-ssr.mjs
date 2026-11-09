import { createServer } from 'node:http';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStampImage } from '@lucianopignotti/passport-stamps';

const stamp = await createStampImage({
  country: 'AR',
  city: 'Mendoza',
  date: '2026-11-07',
  dateFormat: 'numeric'
});

const markup = renderToStaticMarkup(
  createElement('main', null,
    createElement('h1', null, 'Mendoza'),
    createElement('img', { src: stamp.src, alt: stamp.alt, width: 320, height: 240 })
  )
);

const port = Number(process.argv[2] ?? 4175);
createServer((request, response) => {
  if (request.url !== '/') {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Security-Policy': "default-src 'none'; img-src data:"
  });
  response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Server-rendered stamp</title></head><body>${markup}</body></html>`);
}).listen(port, '127.0.0.1', () => {
  console.log(`Open http://127.0.0.1:${port}/`);
});
