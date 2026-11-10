# Stamp performance

## Module loading and rendering

Baseline revision `8e9047e`. The npm tarball was 314.4 kB compressed. Measurements used Chrome 156 on macOS (Apple M3 Pro), with local HTTP and gzip.

Run `npm run build` and `node scripts/benchmark-stamps.mjs`, then open `http://127.0.0.1:4176/` and click **Run benchmark**. Keep the tab active. Each case measures the median of three runs using the same 96 px artwork, starting with Argentina. The 50-stamp grid adds the first 49 other countries from the manifest.

Cold runs use fresh module URLs. Warm runs reuse the loaded JavaScript modules in the same page. Gzip bytes exclude response headers. The elapsed time covers module loading, SVG creation, image decoding and two animation frames. It is a local page-readiness measure and includes frame scheduling.

The baseline loads 20,744 gzip bytes of shared code. The split prototype loads 25,194 gzip bytes of shared code because it has four loader entries per design. Warm runs reported zero transferred module bytes.

| Stamps | Finish | Date | Cold gzip B, baseline → split | Cold ms, baseline → split | Warm ms, baseline → split |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | worn | no | 22,169 → 26,406 | 17.3 → 16.5 | 16.6 → 16.7 |
| 1 | worn | yes | 22,169 → 26,375 | 16.6 → 16.6 | 16.6 → 16.6 |
| 1 | clean | no | 22,169 → 26,037 | 16.6 → 16.5 | 16.5 → 16.7 |
| 1 | clean | yes | 22,169 → 26,004 | 16.6 → 16.6 | 16.8 → 16.6 |
| 50 | worn | no | 80,951 → 77,828 | 49.4 → 31.2 | 26.1 → 32.1 |
| 50 | worn | yes | 80,951 → 79,630 | 48.6 → 35.1 | 19.2 → 24.4 |
| 50 | clean | no | 80,951 → 59,101 | 33.3 → 33.1 | 16.5 → 16.1 |
| 50 | clean | yes | 80,951 → 60,878 | 33.2 → 33.2 | 16.6 → 15.9 |

Keep one lazy module per design. The split prototype increased cold transfer for one stamp by 3.8–4.2 kB, even though it reduced the bytes for the 50-stamp grid. These timings represent one browser and device on a local connection.

## Catalog lookup

Run `node --expose-gc scripts/benchmark-catalog.mjs` after building. The script checks 2,116 equivalent queries across IDs, codes, names, aliases and misses before measuring. On the same Mac with Node.js 24.14.0, the median of seven batches of 16,928 lookups fell from 461.99 ms to 2.96 ms. The first index construction took 0.95 ms. Median construction took 0.23 ms after warmup, with approximately 60 kB of retained heap per index. The heap estimate averages 100 retained copies and varies by engine.

Build the index on the first lookup so applications that only enumerate countries or use the raw SVG files avoid that cost. Reuse the normalized names validated during the asset build.

## Small stamp legibility

Run `node scripts/review-stamp-legibility.mjs` after building. Serve the repository with `npm run preview` and open `http://127.0.0.1:4173/work/stamp-legibility.html`. The sheet compares six frames and long labels at 64, 96 and 140 CSS pixels. Dated examples show the previous worn artwork alongside the updated worn and clean versions.

The date row now uses a 16-unit font instead of 11, moved up four units and constrained to 96 units of width. Dropping the final Gaussian blur in dated worn stamps preserves the grain and makes the lettering sharper in Safari. The review confirmed that the date fits inside each sampled frame. For 64 px icons, use the clean finish and show the place or date separately if it must be readable. At 96 px, clean artwork improves the name, while dates and long names can still be hard to read. Start at 140 px when the date is important and check the actual design on the target display.

The follow-up Chrome measurement used the same procedure after the catalog index and date changes. A cold dated stamp transferred 22,448 gzip body bytes versus 22,169 in the earlier baseline. The dated grid transferred 81,448 versus 80,951. Worn cold times were 16.6 ms for one stamp and 55.4 ms for 50, versus 16.6 and 48.6 ms earlier. Clean times were 16.3 and 41.9 ms, versus 16.6 and 33.2 ms. These short local runs include frame timing and both code changes, so they do not isolate the effect of the artwork adjustment.

## Composed artwork modules

Artwork modules now hold only each stamp's color, frame name, title and compositions. The core assembles the frame, header, date row and worn filter with `src/core/stamp-svg.mjs` and `src/core/ink.mjs`, which the asset build also uses. Output for all 431 stamps in both finishes, with and without a date, matched the previous renderer byte for byte.

| Metric | Before | After |
| --- | ---: | ---: |
| Lazy artwork JS, raw | 3,265,879 B | 415,512 B |
| Lazy artwork JS, gzip per module | 491,514 B | 205,110 B |
| Mendoza module, raw | 9,061 B | 1,920 B |
| Shared core JS, gzip per module | 21,051 B | 23,754 B |
| Unpacked package | 5,163,766 B | 2,307,443 B |

One cold stamp now transfers about 2 kB more gzip because the shared assembler loads with the core. From about five distinct stamps onward, the smaller artwork modules outweigh it. The benchmark page measures the current build only; the four-module split prototype was retired. Browser timings have not been rerun for this change.

## Typography across browsers

The same comparison sheet was reviewed in Chrome and Safari on macOS. The clean samples showed matching line breaks and fit across the six sampled frames. The large difference in the original worn samples came from Safari's rendering of the Gaussian blur, reproduced by toggling only that filter primitive on the Mendoza stamp. The updated dated filter keeps the worn texture and improves its clarity in Safari.

Keep the existing text and font families. Converting labels to paths was unnecessary for the observed difference and would require a separate measurement of the resulting file sizes. Fonts may still vary across operating systems. The 0.2.0 undated worn files kept their original filter, which can appear softer in Safari. The revised catalog treatment uses grain and pressure to vary opacity in both dated and undated stamps. Removing blur and displacement keeps contours sharper, and a less aggressive grain helps preserve narrow strokes.

## Package size budgets

Pack the library with `npm pack --pack-destination work/packed` after creating that directory. Run `node scripts/check-package-size.mjs work/packed/*.tgz` on the resulting archive. The packed consumer workflow enforces these limits before running the framework matrix.

| Metric | Measured | Limit |
| --- | ---: | ---: |
| npm tarball | 253,309 B | 350 KiB |
| Shared core JS, gzip per module | 23,754 B | 24 KiB |
| Largest packaged SVG | 2,831 B | 10 KiB |

Shared core size includes all packaged JS outside the lazy artwork directory. The caps leave room for catalog growth and are intentionally above this measured build. The generator also checks the dated SVG templates against the individual SVG limit. A fixture with an inflated core module and SVG verified that the gate fails and identifies the exceeded limits.
