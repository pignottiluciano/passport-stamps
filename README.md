# Passport Stamps

Original, lightweight passport-style SVG stamps for **193 UN member states and 238 destinations**. Worn ink, transparent backgrounds, and a clean alternative for every stamp.

[Browse the gallery](https://pignottiluciano.github.io/passport-stamps/) · [Destinations](https://pignottiluciano.github.io/passport-stamps/preview/?collection=destinations) · [Source code](https://github.com/pignottiluciano/passport-stamps)

## Install

```sh
npm install @lucianopignotti/passport-stamps
```

One framework-independent asset package. No runtime dependencies. Works with React, Angular, Vue, or plain HTML.

## Use a stamp

Copy the SVG files you need into your application's public assets:

```html
<img src="/stamps/ar-mendoza.svg" alt="Mendoza — grapes and Andes Mountains" width="400" height="300">
```

With Vite, including React or Vue projects using Vite, import a file URL:

```jsx
import mendozaUrl from '@lucianopignotti/passport-stamps/svg/ar-mendoza.svg';

export function MendozaStamp() {
  return <img src={mendozaUrl} alt="Mendoza — grapes and Andes Mountains" width={400} height={300} />;
}
```

SVG import behavior depends on your build tool. An SVG asset is not a React component. Copying files into public assets works across frameworks.

For Angular 20+, add this entry to your build target's `assets` array in `angular.json`, alongside existing entries:

```json
{
  "glob": "**/*.svg",
  "input": "node_modules/@lucianopignotti/passport-stamps/svg",
  "output": "/stamps/"
}
```

Then use `<img src="stamps/ar-mendoza.svg" alt="Mendoza — grapes and Andes Mountains">`. Copy individual files instead if you only need a few stamps. Installing the library does not automatically send every SVG to the browser.

## Package contents

| Path | Contents |
| --- | --- |
| `svg/ar.svg` | Worn country stamp |
| `svg/ar-mendoza.svg` | Worn destination stamp |
| `svg/clean/ar-mendoza.svg` | Clean alternative |
| `manifest.json` | Exactly 193 UN member states |
| `destinations.json` | 238 destinations across 40 countries |

Countries and destinations have separate catalogs. Country stamps contain no city names or airport codes. The destination collection covers 20 places in Argentina and 218 in Europe. [Full destination list and individual downloads](docs/DESTINATIONS.md).

All 862 SVGs have a `400 × 300` viewBox. They contain no embedded bitmaps, scripts, or external resources. Every file stays below 10 KiB; exact uncompressed sizes are recorded in the catalogs. Worn files are typically around 2–3 KB each.

## Catalog fields

Use `id` as the unique key: `ar` for Argentina, `ar-mendoza` for Mendoza. `code` is the uppercase ISO country code, including for destinations. `kind` distinguishes `country` from `destination`.

- `name` and `countryName`: English display names; proper local names are retained where appropriate.
- `label` and `countryLabel`: lettering in the artwork, which may use a local language.
- `officialName`: country name from the membership reference.
- `region`: Africa, Americas, Asia, Europe, or Oceania; a navigation grouping, not an official political classification.
- `icon` and `iconLabel`: motif identifier and English description.
- `shape` and `color`: frame family and ink color.
- `file`, `cleanFile`, `bytes`, and `cleanBytes`: asset paths and uncompressed sizes.
- Destinations also include `adminArea` and `destinationType`; some include `aliases`, `associationNote`, or `landmarkLocality`.

Aliases include alternative spellings and some previous Spanish names. The two Córdoba destinations have separate IDs and symbols. Mont-Saint-Michel is a landmark destination; the Füssen entry explains that Neuschwanstein is in nearby Schwangau. Natural motifs may represent a destination's wider surroundings.

## Rendering notes

Artwork uses six frame families and original architectural, cultural, and natural motifs. Some motifs are shared. These are decorative designs, not official national emblems or immigration documents.

Text remains editable and uses system fonts, including Arial/Helvetica, Georgia, and an available Japanese font. It is not converted to outlines, so typography can vary between platforms.

Worn SVGs use deterministic filters to simulate pores, uneven pressure, and ink absorption. Small file size does not guarantee low rendering cost; performance has not been benchmarked across all devices. Clean variants omit these effects.

SVG files displayed with `<img>` do not inherit page text color. If you inline the same SVG more than once, assign unique IDs to titles, filters, and their references. Each `<img>` otherwise has its own document.

## Build and preview locally

Requires Node.js 20+; Python 3 is only needed for the optional local server. No dependency installation is required for the asset generator.

```sh
npm run build
npm run check
npm run preview
```

Open `http://127.0.0.1:4173/preview/` for local development. The public gallery is available on [GitHub Pages](https://pignottiluciano.github.io/passport-stamps/).

The gallery supports search, region or country filters, and pages of 24 stamps. Direct destination links accept `?collection=destinations&country=AR`. The static gallery can also be opened from `preview/index.html`.

## Contributing

Update source files rather than generated SVGs:

- `data/stamps.json`: editorial metadata and visual decisions.
- `data/un-members.json`: verified membership reference, source, and date.
- `scripts/icons.mjs`: country motifs.
- `scripts/destination-icons.mjs` and `scripts/europe-icons.mjs`: destination motifs.
- `scripts/build.mjs`: layouts, SVG generation, catalogs, and destination documentation.
- `scripts/ink.mjs`: deterministic ink treatment.
- `scripts/gallery.mjs`: static gallery.
- `tests/catalog.test.mjs`: coverage, metadata, resource, and size contracts.

Run `npm run build` and `npm run check`, then inspect your artwork in the gallery. Preserve stable IDs and paths, transparent backgrounds, accessible titles, clean alternatives, and the 10 KiB limit. Keep documentation and descriptive metadata in English; local-language artwork labels and proper names are intentional.

The primary catalog must match the verified UN membership reference exactly. Add cities and other destinations to the separate destination catalog. Update the membership reference explicitly before changing country coverage.

GitHub Pages verifies and deploys the gallery on pushes to `main`. npm releases are separate; changing repository documentation does not update an already published npm version.

## Historical ink study

The [ink experiment](experiments/ink/README.md) preserves six earlier compositions, including their historical city labels. Its measurements do not describe the current collection. Regenerate it with `node experiments/ink/build.mjs`. It is excluded from the npm package.

## Sources and license

Country coverage was checked on **November 7, 2026** against the [UN member states list](https://www.un.org/about-us/member-states). See [sources and scope](docs/SOURCES.md) and [validation notes](docs/VALIDATION.md).

Code and original artwork are licensed under [MIT](LICENSE), including commercial use. No UN graphics or third-party artwork were copied or traced. These decorative stamps do not represent official documents or border-control marks.
