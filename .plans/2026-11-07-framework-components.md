# Plan — property-driven stamp components

Status: complete. Execution: direct.

Add optional React and Angular entry points to the existing asset package, preserving all asset paths. A shared typed core resolves country and city inputs, validates calendar dates, and loads one stamp module on demand. Dates are integrated into a dedicated layout, not overlaid on existing lettering. No npm publication during the waiting period.

- [x] T1: Implement typed resolution, lazy artwork modules, and dated layouts. Verify country/city fallback, dates, errors, unchanged existing SVGs, and lazy import behavior.
- [x] T2: Build React and Angular 20+ components with country, city, date, variant, size, and alt properties. Verify compiled components and property updates in real consumers; no required asset-copy configuration.
- [x] T3: Add separate framework instructions and an interactive property demo to the gallery. Verify in browser, including mobile; run all package checks, pack/install checks, and deploy documentation.

Missing cities fall back to the country's stamp. Unknown countries and invalid dates produce explicit errors. Date format: YYYY-MM-DD, displayed as DD MON YYYY. Local artwork lettering remains unchanged unless the dated layout is requested. Angular's selector is passport-stamp as explicitly requested; compile against Angular 20 for forward-compatible partial compilation. Framework peers are optional so SVG-only consumers do not install Angular or React.

Evidence: 12 Node tests and 4 compiled framework tests pass; packed Angular/React consumer compilation and dated core rendering pass. Gallery preview shows the integrated date and separate framework examples.
