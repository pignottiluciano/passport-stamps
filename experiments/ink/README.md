# Ink study 01

Comparison of six historical designs using the original subtle finish, a stamped finish, and a worn finish. **Worn is the selected finish for the main collection.**

These frozen examples include historical city labels. Their file sizes describe this experiment, not the current country and destination catalogs.

## Reproduce

```sh
node experiments/ink/build.mjs
npm run preview
```

Open `/experiments/ink/` on the local preview server. Generated variants and size measurements remain inside this experiment and are excluded from the npm package.

## Technique

SVG filters create pores, uneven pressure, slight displacement, and a small blur to suggest ink absorption. No paper background is embedded in the SVG. The paper texture belongs only to the comparison page.

Typography is unchanged from the frozen examples to isolate the ink effect and is not converted to outlines. Fixed seeds keep generation deterministic.

## Observations and limits

The six designs, thumbnails, and country selector were reviewed in the integrated browser. The stamped treatment preserves small details better; the worn treatment removes more secondary lettering. Worn was chosen for its appearance.

XML, titles, local filter references, and absence of embedded images and external resources were checked. The main catalog has its own regeneration and contract checks.

Rendering time and compatibility in Safari, Firefox, React Native, PDF, and design tools were not benchmarked. Smaller download size does not guarantee cheaper rendering. PNG or WebP exports remain an option when a fixed raster appearance is needed.
