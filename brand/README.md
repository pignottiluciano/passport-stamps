# Passport Stamps identity

The Classic identity uses a circular passport seal and an intertwined PS monogram. All SVG lettering is outlined; no font downloads, embedded images or external resources are required. SVG backgrounds are transparent.

| Asset | Use |
| --- | --- |
| `logo.svg` | Main seal with the catalog's approved worn ink finish |
| `logo-clean.svg` | Editable vector master; clean seal for small print or crisp reproduction |
| `mark.svg` | Single-ring monogram for the site header and compact placements |
| `favicon.svg` | Monogram with light ink in dark browser themes |
| `favicon-16.png`, `favicon-32.png`, `favicon.ico` | Browser fallbacks; transparent charcoal ink |
| `apple-touch-icon.png` | 180 px home screen icon on opaque ivory |
| `icon-192.png`, `icon-512.png` | Opaque ivory web manifest icons |
| `logo.png` | 1024 px transparent export of the main seal |
| `site.webmanifest` | Relative, subpath-safe browser metadata |

Ink: `#292823`. Paper: `#FAF8F3`. Use the monogram below 120 px; avoid shrinking the seal's circular lettering into a favicon. Leave clear space around the outer ring. The manifest uses browser display mode; this static site does not add a service worker or offline behavior.

`logo-clean.svg` and `mark.svg` are vector sources. `favicon.svg` shares the monogram with an additional dark-theme rule. Keep monogram geometry synchronized when editing these files. `npm run build` derives `logo.svg` with `src/core/ink.mjs` and copies the identity assets into `preview/brand/`. `npm run check` verifies those generated copies as well as the existing catalog.

For an intentional raster refresh, run `npm run build` after editing vector sources, then `python3 scripts/export-brand.py`, then `npm run build && npm run check`. Raster export is an optional authoring step requiring local Google Chrome and Python Pillow; the regular asset build stays dependency-free. Raster exports are checked in.

These are a vector interpretation of the approved Classic concept, refined for production use rather than a bitmap trace.
