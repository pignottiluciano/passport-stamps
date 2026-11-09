# Changelog

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
