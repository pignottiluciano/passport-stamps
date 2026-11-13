#!/usr/bin/env python3
"""Export brand PNG/ICO files locally: python3 scripts/export-brand.py.

Requires Python Pillow and Google Chrome (or CHROME_BIN pointing to Chromium).
These authoring-only tools are not required by npm run build/check. SVG masters
remain the source of truth; rerun this after editing brand/mark.svg or logo.svg.
"""
import base64
import html
import io
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / 'brand'
CHROME = os.environ.get('CHROME_BIN') or shutil.which('google-chrome') or shutil.which('chromium') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'


def render_svg(source: Path, size: int) -> Image.Image:
    """Let Chromium rasterize SVG paths, masks and the shared ink filter."""
    encoded = base64.b64encode(source.read_bytes()).decode('ascii')
    document = f'''<!doctype html><html><body><pre id="result"></pre><script>
const image = new Image();
image.onload = () => {{
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = {size};
  canvas.getContext('2d').drawImage(image, 0, 0, {size}, {size});
  document.getElementById('result').textContent = canvas.toDataURL('image/png');
}};
image.src = 'data:image/svg+xml;base64,{encoded}';
</script></body></html>'''
    with tempfile.TemporaryDirectory(prefix='passport-brand-') as temporary:
        directory = Path(temporary)
        page = directory / 'render.html'
        page.write_text(document)
        result = subprocess.run([
            CHROME, '--headless', '--disable-gpu', '--no-first-run',
            '--no-default-browser-check', '--disable-background-networking',
            f'--user-data-dir={directory / "profile"}', '--dump-dom',
            '--virtual-time-budget=5000', page.as_uri(),
        ], capture_output=True, text=True, timeout=30, check=True)
    match = re.search(r'<pre id="result">data:image/png;base64,([^<]+)</pre>', result.stdout)
    if not match:
        raise RuntimeError(f'Chrome did not render {source.name}: {result.stderr[-1000:]}')
    return Image.open(io.BytesIO(base64.b64decode(html.unescape(match[1])))).convert('RGBA')


def main() -> None:
    mark = render_svg(BRAND / 'mark.svg', 1024)
    for size in (16, 32):
        mark.resize((size, size), Image.Resampling.LANCZOS).save(BRAND / f'favicon-{size}.png')
    mark.save(BRAND / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    for filename, size in [('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)]:
        icon = Image.new('RGBA', (size, size), '#FAF8F3')
        inset = round(size * .12)
        drawing = mark.resize((size - inset * 2, size - inset * 2), Image.Resampling.LANCZOS)
        icon.alpha_composite(drawing, (inset, inset))
        icon.convert('RGB').save(BRAND / filename)
    render_svg(BRAND / 'logo.svg', 1024).save(BRAND / 'logo.png')
    print('Exported transparent logo and favicons, ICO 16/32/48, and opaque touch/app icons.')


if __name__ == '__main__':
    main()
