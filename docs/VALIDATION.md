# Validation notes

## Current collection

The collection contains 193 UN member states and 238 destinations across 40 countries: 431 designs and 862 SVGs including worn and clean versions.

- `npm run check` verifies exact regeneration and runs five catalog tests covering membership, separation of countries and destinations, all agreed destination IDs, metadata, resources, inventory, and file sizes.
- Country coverage matches the 193 unique codes in the fixed UN reference, with no extra countries or city fields in country entries.
- Destination coverage preserves the original 60 IDs and includes exactly the 178 European additions recorded in `tests/fixtures/europe-expanded.json`.
- Every SVG is self-contained, has an accessible title, and stays below 10 KiB.
- The 862 SVGs were parsed as XML during the European expansion. Before the English metadata update, all 506 earlier assets and the country catalog were confirmed unchanged against Git.
- The English update changes descriptive metadata and accessible SVG titles. Local-language artwork lettering, drawing geometry, colors, and ink filters are preserved.

Current worn country assets total 416,396 bytes, ranging from 1,976 to 2,831 bytes each. Worn destination assets total 524,242 bytes, ranging from 2,016 to 2,593 bytes each. Sizes are uncompressed; 1 KB means 1,000 bytes. Catalogs record exact per-file sizes.

## Visual and interaction review

The original country gallery was reviewed across nine pages. Three-line names were adjusted to avoid crossing the divider. The initial 60 destinations and all 178 European additions were reviewed in the browser. Tall landmarks in ticket frames and long country labels were adjusted to fit their borders.

Checks performed during development include country and region filters, search without diacritics, empty results, pagination, separate Córdoba destinations, direct destination URLs, and names such as Munich, Füssen, København, Wrocław, Tromsø, and Rothenburg. A 390 px mobile view showed no horizontal overflow.

The frozen ink experiment retains its own six-design baseline; catalog expansion does not replace that historical artwork. Its measurements do not describe the current catalog.

## Distribution and limits

The initial npm candidate was packed, installed in a disposable local project, and checked for both catalogs and the Mendoza SVG export. GitHub Pages runs the catalog checks before deploying the static gallery.

Visual review uses the integrated browser. It does not establish typography parity across platforms or rendering performance across devices. SVG filter cost has not been benchmarked in all browsers, design tools, PDF renderers, or React Native. Use clean alternatives when filters are unsuitable.

npm publication and website deployment are independent. This document is not evidence that a particular version is currently available in the registry.

## Gallery usability update

- Installation examples are available in an expandable section for React with Vite, Angular 20+, and HTML.
- Browser checks confirmed successful copy feedback for the install command, view link, and clean SVG.
- The Córdoba search with Spain selected was restored after reload. Opening its stamp link displayed only that stamp; Back returned to the earlier search.
- The Europe region and page 2 were restored after reload, showing 25–43 of 43 countries.
- A 390 px viewport showed no horizontal document overflow, including with usage examples expanded. Code samples scroll inside their containers.
- The manual-copy fallback and SVG loading-error message are implemented; denied clipboard permissions and network failures were not simulated in this browser review.

## Property-driven components

- Seven shared-core tests verify country and city selection, country-constrained aliases, unknown-city fallback, explicit errors, calendar dates including leap years, variants, sizes, unchanged undated SVG content, and date text inside SVG artwork.
- Four framework tests use the compiled Angular and React adapters in jsdom. They verify prop/input changes, dated images, clean treatment, sizing, invalid input feedback, and recovery. Angular uses zoneless TestBed and the public signal inputs.
- A packed consumer compiled an Angular template and React JSX against the installed package exports and strict TypeScript declarations. The installed core rendered Mendoza with an integrated date.
- Development versions: Angular 20.3.35, React 19.3.1, TypeScript 5.9.3. This is not a test matrix across every supported framework version.
- Framework dependencies are optional peers. SVG-only and core consumers do not need either framework. Dated compositions are generated into lazy modules; the 862 static SVG files remain unchanged.

## Travel journal design

The gallery uses the selected Travel journal layout and Warm Stone palette, with a stamp composition in the hero, country/destination catalog, framework code switcher, and complete Angular/React documentation. Browser checks confirmed React snippet switching, code and SVG copy feedback, destination search, stamp permalinks, documentation navigation, and the live dated preview. The existing asset paths and library component behavior are unchanged.

## Packed consumer compatibility

The compatibility workflow installs the same tarball in isolated Angular 20, 21 and 22 and React 18 and 19 projects. Each framework compiles a typed consumer and renders a dated Mendoza stamp. The SVG-only check verifies that neither optional framework is installed. Run the checks locally with `node scripts/check-consumer.mjs angular-20 path/to/package.tgz` after packing the library. The Angular 22 case uses TypeScript 6 and Node.js 22.22.3 in CI. See the [Angular version compatibility table](https://angular.dev/reference/versions).
