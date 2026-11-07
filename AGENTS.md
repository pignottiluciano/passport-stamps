# Passport Stamps

This repository is a framework-independent SVG asset library. Keep the asset build dependency-free. The static preview is documentation, not an application.

- Country data lives in `data/countries.json`; layouts and original vector art live in `scripts/build.mjs`.
- Generated SVGs, the manifest and preview are checked into Git. Run `npm run build` after editing sources, then `npm run check`.
- Keep each SVG below 10 KiB. Prefer simple paths and sparse ink gaps over embedded images or heavy filters.
- Preserve transparent backgrounds and accessible SVG titles. Avoid external resources.
- Check new artwork visually in the preview. Keep country compositions distinct.
- Do not publish or push unless requested.

For future application code: use Angular 20+, standalone components, TypeScript strict mode, Signals when appropriate, and computed() before effect(). Avoid effect() unless necessary. Keep components focused, business logic in services, no duplicated code or unnecessary abstractions. Favor maintainability, clean architecture and SOLID; explain architectural decisions briefly.
