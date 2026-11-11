// Usage snippets for one stamp. Shared by the build (static stamp pages) and the gallery dialog,
// which loads the copy published as preview/snippets.js.
const attr = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** @param {{code: string, kind: string, name: string, id: string, iconLabel: string}} stamp */
export function stampSnippets(stamp) {
  const city = stamp.kind === 'destination' ? ` city="${attr(stamp.name)}"` : '';
  const props = `country="${stamp.code}"${city}`;
  return {
    angular: `import { PassportStampComponent } from '@lucianopignotti/passport-stamps/angular';\n\n// Add PassportStampComponent to imports.\n<passport-stamp ${props} date="2026-11-07" />`,
    react: `import { PassportStamp } from '@lucianopignotti/passport-stamps/react';\n\n<PassportStamp ${props} date="2026-11-07" />`,
    element: `<script type="module">\n  import { definePassportStamp } from '@lucianopignotti/passport-stamps/element';\n  definePassportStamp();\n</script>\n\n<passport-stamp ${props} date="2026-11-07"></passport-stamp>`,
    html: `<img src="/stamps/${stamp.id}.svg" alt="${attr(stamp.name)} — ${attr(stamp.iconLabel)}" width="400" height="300">`
  };
}

export const snippetLabels = { angular: 'Angular', react: 'React', element: 'Web Component', html: 'HTML' };
