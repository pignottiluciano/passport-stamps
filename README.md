# Passport Stamps

Original, lightweight passport-style SVG stamps for **193 UN member states and 238 destinations**. Worn ink, transparent backgrounds, and a clean alternative for every stamp.

[Browse the gallery](https://pignottiluciano.github.io/passport-stamps/) · [Destinations](https://pignottiluciano.github.io/passport-stamps/preview/?collection=destinations) · [Source code](https://github.com/pignottiluciano/passport-stamps)

## Install

```sh
npm install @lucianopignotti/passport-stamps
```

The package provides standalone SVG assets, a framework-independent renderer, and optional Angular and React components. Import only the entry point you need; Angular and React are optional peers.

## Angular 20+

```ts
import { Component } from '@angular/core';
import { PassportStampComponent } from '@lucianopignotti/passport-stamps/angular';

@Component({
  selector: 'app-example',
  imports: [PassportStampComponent],
  template: `
    <passport-stamp country="AR" />
    <passport-stamp country="AR" city="Mendoza" date="2026-11-07" />
    <passport-stamp [country]="country" [city]="city" [date]="date" [size]="280" variant="clean" />
  `
})
export class ExampleComponent {
  country = 'AR';
  city = 'Mendoza';
  date = '2026-11-07';
}
```

No NgModule, assets configuration, HTTP provider, or SVG loader is needed. The component uses signal inputs, computed values, and a resource for asynchronous artwork loading. It is built with Angular 20 partial compilation for consumers on Angular 20–22.

## React 18+

```jsx
import { PassportStamp } from '@lucianopignotti/passport-stamps/react';

export function Example() {
  return (
    <>
      <PassportStamp country="AR" />
      <PassportStamp country="AR" city="Mendoza" date="2026-11-07" />
      <PassportStamp country="FR" city="Paris" variant="clean" size={280} />
    </>
  );
}
```

Props can come from state or your application's data. The component is a client entry point, loads asynchronously, and displays loading or error text. On server-rendered React pages, the image appears after client loading. React 18 and 19 are supported; behavior was tested with React 19.3.1.

## Properties

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `country` | `string` | Required | ISO alpha-2 code recommended, such as `AR`. Country names and known aliases also work. |
| `city` | `string` | None | Destination name, slug, alias, or full ID such as `ar-mendoza`. |
| `strictCity` | `boolean` | `false` | Reject a city that is unavailable for the selected country. |
| `date` | `string` | None | Valid calendar date in `YYYY-MM-DD` format, printed inside the stamp as `07 NOV 2026`. |
| `dateFormat` | `'text'` or `'numeric'` | `'text'` | Choose `07 NOV 2026` or `07/11/2026` for the printed date. |
| `variant` | `'worn'` or `'clean'` | `'worn'` | Ink treatment. |
| `size` | `number` | `240` | Width in pixels; height follows the 4:3 viewBox. In Angular, bind numbers with `[size]="280"`. |
| `alt` | `string` | Generated description | Optional accessible image text. |

Without a city, the country stamp is used. A city must belong to the selected country; an unknown city falls back to the country stamp by default. Enable `strictCity` in React or `[strictCity]="true"` in Angular to show an error instead. The core reports this as `INVALID_CITY`. Unknown countries, invalid dates, and invalid variants produce explicit errors. Size must be positive and finite. Both components display a validation message for an invalid size and recover when the size is corrected. The core error type, `PassportStampError`, includes a stable `code`.

Dates are calendar strings, not timestamps. No timezone conversion occurs. Omitting the date preserves the original artwork. A date selects an adapted composition with a dedicated date row inside the frame; dated country compositions may differ from their original undated layouts.

Components load a single design module on demand. Build tools may emit multiple lazy chunks, but only requested designs load at runtime. Each image uses an isolated SVG data URL, so repeated stamps do not share filter IDs. Sites with a Content Security Policy must allow `data:` in their image policy. Components do not require a CDN or public asset-copy configuration.

## Host static SVGs on your own origin

Copy the package's `svg/` directory into a public directory. Set `assetBaseUrl="/travel/assets/stamps"` on either component to load an undated stamp from that directory. For example, clean Mendoza resolves to `/travel/assets/stamps/svg/clean/ar-mendoza.svg`. HTTP and HTTPS URLs also work.

The default uses a data URL. A nonempty `date` combined with `assetBaseUrl` reports `STATIC_DATE_UNSUPPORTED` because the hosted file has a fixed design. A missing city follows the same fallback or strict matching rules in both modes.

## Plain HTML, Vue, or direct SVG assets

Copy only the files you need into your public assets:

```html
<img src="/stamps/ar-mendoza.svg" alt="Mendoza — grapes and Andes Mountains" width="400" height="300">
```

Vite also supports importing `@lucianopignotti/passport-stamps/svg/ar-mendoza.svg` as an asset URL. Direct SVG files retain their existing paths; dynamic dates belong to the component and renderer API.

## Build a country and city selector

Import `getCountries` and `getCities` from `@lucianopignotti/passport-stamps`. Both return entries with `id`, `code`, and `name`, ordered by English display name. Use `code` for a country option, `id` for a city option, and `name` for either label. The helpers do not load SVG artwork.

In Angular, use `const countries = getCountries()` for the country options and `computed(() => getCities(selectedCountry()))` for the city options, where `selectedCountry` is a signal holding a valid country code. In React, use `getCountries()` and derive the city options with `getCities(selectedCountry)` from your current state. Clear the selected city when the country changes.

A country with no destinations returns an empty list. An unknown country throws `PassportStampError` with code `INVALID_COUNTRY`.

## Catalog types in TypeScript

Import `CountryCode`, `StampId` or `DestinationId` to autocomplete and validate IDs in your own data.

```ts
import { getCities, type CountryCode, type DestinationId } from '@lucianopignotti/passport-stamps';

const country: CountryCode = 'AR';
const city: DestinationId = 'ar-mendoza';
const options = getCities(country);
```

The renderer and component properties also accept country and city names and aliases as strings.

## Framework-independent renderer

```js
import { createStampImage } from '@lucianopignotti/passport-stamps';

const image = await createStampImage({
  country: 'AR', city: 'Mendoza', date: '2026-11-07', variant: 'worn'
});
// image: { id, src, alt, fallback }
// Assign image.src and image.alt to an img element.
```

Use `createStampSvg(options)` when you need standalone SVG markup to save or download. It accepts the same country, city, date and finish options as `createStampImage()`.

```js
import { writeFile } from 'node:fs/promises';
import { createStampSvg } from '@lucianopignotti/passport-stamps';

const svg = await createStampSvg({ country: 'AR', city: 'Mendoza', date: '2026-11-07' });
await writeFile('mendoza.svg', svg);
```

`resolveStamp()` supports synchronous selection and validation; `formatStampDate()` validates date strings. Rendering does not require DOM access.

## Render a stamp on the server

For React pages that need the image in the initial HTML, call `createStampImage()` on the server and render the returned `src` and `alt` with an ordinary `img`. The framework component remains useful when visitors change the stamp interactively.

```jsx
import { createStampImage } from '@lucianopignotti/passport-stamps';

const stamp = await createStampImage({
  country: 'AR', city: 'Mendoza', date: '2026-11-07'
});
const image = <img src={stamp.src} alt={stamp.alt} width={320} height={240} />;
// Render image with your server framework or React DOM's server renderer.
```

Run the [React server example](examples/react-ssr.mjs) from the repository with `npm run build` and `node examples/react-ssr.mjs`. Open `http://127.0.0.1:4175/`. The page uses server-generated HTML and a content security policy that blocks scripts.

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

For small stamps, start with the clean finish. At 64 px, put important dates and long place names in adjacent text. At 140 px, the larger date row is easier to read. See the [visual comparison procedure](docs/PERFORMANCE.md#small-stamp-legibility).

Worn SVGs use deterministic filters to simulate pores, uneven pressure, and ink absorption. Small file size does not guarantee low rendering cost; performance has not been benchmarked across all devices. Clean variants omit these effects.

SVG files displayed with `<img>` do not inherit page text color. If you inline the same SVG more than once, assign unique IDs to titles, filters, and their references. Each `<img>` otherwise has its own document.

## Build and preview locally

Use Node.js 22.12+ for development and Python 3 for the optional local server. Run `npm ci` first to install the locked build and test tools. The asset generator itself remains dependency-free; component compilation uses TypeScript and ng-packagr.

```sh
npm ci
npm run build
npm run check
npm run preview
```

Open `http://127.0.0.1:4173/preview/` for local development. The public gallery is available on [GitHub Pages](https://pignottiluciano.github.io/passport-stamps/).

The gallery includes separate Angular and React component instructions, a property reference, a live preview, and direct HTML examples. Each card lets you choose a worn or clean finish and copy its SVG source, alongside the existing downloads. If clipboard access is denied, a dialog provides the text for manual copying. SVG copying requires HTTP or HTTPS; local file previews can still use download links.

Search, region or country filters, and pagination are encoded in the URL. Use **Copy view link** to share the current results. Examples:

- `?collection=destinations&country=AR&q=mendoza`: filtered destination results.
- `?region=Europe&page=2`: the second page of European countries.
- `?stamp=ar-mendoza`: a single stamp, with a button to return to the full collection.

The static gallery can also be opened from `preview/index.html`.

## Contributing

Update source files rather than generated SVGs:

- `data/stamps.json`: editorial metadata and visual decisions.
- `data/un-members.json`: verified membership reference, source, and date.
- `scripts/icons.mjs`: country motifs.
- `scripts/destination-icons.mjs` and `scripts/europe-icons.mjs`: destination motifs.
- `scripts/build.mjs`: layouts, SVG generation, catalogs, and destination documentation.
- `scripts/ink.mjs`: deterministic ink treatment.
- `src/core/index.ts`: shared typed selection, date validation, and lazy rendering.
- `src/angular/`: standalone Angular component and packaging configuration.
- `src/react/`: React component.
- `scripts/build-library.mjs`: component compiler. Generated `dist/` and core artwork modules are rebuilt and are not checked into Git.
- `scripts/gallery.mjs`: static gallery markup and styles.
- `scripts/gallery-client.js`: clipboard actions and shareable gallery state, copied to `preview/gallery.js` by the build.
- `tests/catalog.test.mjs`: coverage, metadata, resource, and size contracts.

Names, aliases and slugs must resolve unambiguously within a country. The generator reports both IDs when their normalized names collide. Names shared by cities in different countries are allowed.

Run `npm run build` and `npm run check`, then inspect your artwork in the gallery. Preserve stable IDs and paths, transparent backgrounds, accessible titles, clean alternatives, and the 10 KiB limit. Keep documentation and descriptive metadata in English; local-language artwork labels and proper names are intentional.

The primary catalog must match the verified UN membership reference exactly. Add cities and other destinations to the separate destination catalog. Update the membership reference explicitly before changing country coverage.

GitHub Pages verifies and deploys the gallery on pushes to `main`. npm releases are separate; changing repository documentation does not update an already published npm version.

## Historical ink study

The [ink experiment](experiments/ink/README.md) preserves six earlier compositions, including their historical city labels. Its measurements do not describe the current collection. Regenerate it with `node experiments/ink/build.mjs`. It is excluded from the npm package.

## Sources and license

Country coverage was checked on **November 7, 2026** against the [UN member states list](https://www.un.org/about-us/member-states). See [sources and scope](docs/SOURCES.md) and [validation notes](docs/VALIDATION.md).

Code and original artwork are licensed under [MIT](LICENSE), including commercial use. No UN graphics or third-party artwork were copied or traced. These decorative stamps do not represent official documents or border-control marks.
