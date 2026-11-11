# Passport Stamps

This repository is a framework-independent SVG asset library. Keep the asset generator dependency-free; optional framework adapters use the locked development tools. The static preview is documentation, not an application.

- Country data lives in `data/stamps.json`; layouts live in `scripts/build.mjs`, country motifs in `scripts/icons.mjs`, destination motifs in `scripts/destination-icons.mjs` and `scripts/europe-icons.mjs`, and the gallery in `scripts/gallery.mjs`, `scripts/gallery-client.js` and `scripts/gallery-snippets.mjs`. The build also generates one static page per stamp in `preview/stamps/`, a sitemap and `preview/stamps.json`. `scripts/analytics.js` sends anonymous PostHog (EU) events only on the public site: keep it cookie-free, without autocapture or recordings, and loaded after the page is idle. Tag new user actions with `data-track` attributes or `track()` in the gallery client.
- Generated SVGs, the manifest and preview are checked into Git. Run `npm run build` after editing sources, then `npm run check`.
- Keep each SVG below 10 KiB. Use the approved worn treatment from `src/core/ink.mjs` (re-exported by `scripts/ink.mjs`) for main SVGs; retain clean alternatives. Avoid embedded images or external resources.
- Preserve transparent backgrounds and accessible SVG titles. Avoid external resources.
- Check new artwork visually in the preview. Keep country compositions distinct.
- Do not publish or push unless requested.

For future application code: use Angular 20+, standalone components, TypeScript strict mode, Signals when appropriate, and computed() before effect(). Avoid effect() unless necessary. Keep components focused, business logic in services, no duplicated code or unnecessary abstractions. Favor maintainability, clean architecture and SOLID; explain architectural decisions briefly.

Catalog IDs are unique: country IDs use lowercase ISO codes (`ar`); destination IDs prefix the parent country (`ar-mendoza`). `code` remains the parent country ISO code. Use `kind` to distinguish countries from destinations. Existing country asset paths must stay stable.

The primary `manifest.json` must contain exactly the 193 countries verified in `data/un-members.json`. No city fields or airport labels belong in country assets. The 238 agreed destinations (20 in Argentina and 218 in Europe across 39 countries) are exported separately as `destinations.json`. Keep the historical ink experiment bound to its frozen baseline, not the growing main catalog.

Keep public documentation, gallery controls, descriptive catalog metadata, and accessible SVG titles in English. Local-language artwork labels, proper place names, and multilingual search aliases are intentional.

Framework adapters live in src/angular, src/react and src/element and share the typed renderer in src/core. Run npm ci, npm run build, and npm run check for a clean checkout. Keep all existing asset paths and undated SVG output stable. Generated dist and core artwork sources are ignored and rebuilt. Dates must use the dated composition, never overlap original lettering.
