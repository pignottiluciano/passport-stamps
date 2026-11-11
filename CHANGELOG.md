# Changelog

## Unreleased

### Added

- Use stamps in Vue, Svelte, Astro or plain HTML with the Web Component from `@lucianopignotti/passport-stamps/element`. Call `definePassportStamp()` to register `<passport-stamp>` or pass another tag name.

### Changed

- The gallery loads 40 kB of HTML instead of 511 kB and fetches the collection as compact JSON. Each stamp opens a detail dialog with downloads, copying and framework snippets, and has its own static page with social preview metadata, listed in a sitemap. The workshop saves and shares PNG images.

## 0.3.0

### Added

- React and Angular images use `decoding="async"` and native lazy loading by default. Set `loading` to `'eager'` for a stamp visible on first paint.
- Try the interactive stamp workshop in the gallery: choose a country, city, date and ink finish, preview the stamp on a passport page, and download the SVG.

### Changed

- Artwork modules store only the parts unique to each stamp. The renderer adds the shared frame, header, date row and worn ink filter at runtime with the same code the asset build uses. Rendered SVGs are byte-for-byte identical to 0.2.1.
- The unpacked package shrinks from 5.2 MB to 2.3 MB, and the tarball from 313 kB to 251 kB. Each lazy artwork module is about 80% smaller, so grids of stamps transfer much less.
- `createStampImage()` and `createStampSvg()` reuse the 100 most recent renders, including requests still in flight. Lists and re-renders with the same stamp, finish and date build the SVG once. Failed artwork loads are not cached.
- The runtime catalog ships as compact rows. Country codes and kinds come from the IDs, and artwork labels are omitted when they are the uppercase name. Shared core code drops from 24.1 kB to 19.6 kB gzip, below 0.2.1. Catalog lookups and `resolveStamp()` results are unchanged.

## 0.2.1

### Fixed

- Sharpened worn SVGs with and without dates, especially in Safari. The ink grain stays visible while lettering, borders, and illustrations keep clearer contours.
- Repositioned the Paris, Japan, and Mendoza stamps on the gallery cover so their names are easier to read on desktop and mobile.

## 0.2.0

### Added

- Browse countries and destinations with `getCountries()` and `getCities()`. Use the exported `CountryCode`, `StampId`, and `DestinationId` types in TypeScript.
- Set `strictCity` in the core API, React, or Angular to report an unknown city as `INVALID_CITY`. The default still falls back to the country stamp.
- Export personalized artwork as SVG markup with `createStampSvg()`. Set `dateFormat` to `'numeric'` for a numeric date. The default retains the text format.
- Set `assetBaseUrl` to serve undated SVGs from a hosted asset directory. Dated stamps use the generated SVG, and combining a date with `assetBaseUrl` reports `STATIC_DATE_UNSUPPORTED`.
- Follow the React server-rendering example to render a stamp without requiring client JavaScript.

### Changed

- Invalid component properties follow the same error handling in Angular and React. Stamps render again when the properties become valid.
- A lookup index is built on first use to speed up repeated catalog queries. The artwork stays grouped to keep single-stamp downloads smaller.
- Dated stamps use larger date lettering and a sharper worn finish for improved readability at small sizes, especially in Safari. Existing undated SVGs retain their asset paths and appearance.
- Catalog validation checks for alias collisions and oversized assets. CI verifies the packed library with Angular 20–22, React 18–19, and an SVG-only installation, and enforces package and SVG size budgets.

## 0.1.1

- Shipped 193 country stamps and 238 destination stamps with worn and clean SVGs.
- Added Angular and React components with an optional date integrated into the artwork.
- Documented installation, component usage, and the SVG catalog in English.
