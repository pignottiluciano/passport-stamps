const escape = value => value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function componentDocs() {
  return `<section class="get-started" aria-label="Installation and components">
<div class="install-row"><code>npm install @lucianopignotti/passport-stamps</code><button type="button" id="copy-install" class="js-only">Copy command</button><a href="https://github.com/pignottiluciano/passport-stamps" data-track="outbound" data-track-target="github">GitHub ↗</a><a href="https://www.npmjs.com/package/@lucianopignotti/passport-stamps" data-track="outbound" data-track-target="npm">npm ↗</a></div>
<p class="component-intro">One component. Country, city, and an optional date — all through properties.</p>
<p class="release-note">The examples below use the 0.4.0 API. Check <a href="https://www.npmjs.com/package/@lucianopignotti/passport-stamps?activeTab=versions">npm</a> for published versions.</p>
<details><summary>Angular 20+ · &lt;passport-stamp&gt;</summary>
<p>Import the standalone component. No NgModule, image copying, or assets configuration is needed.</p>
<pre><code>${escape(`import { Component } from '@angular/core';
import { PassportStampComponent } from '@lucianopignotti/passport-stamps/angular';

@Component({
  selector: 'app-example',
  imports: [PassportStampComponent],
  template: \`
    <passport-stamp country="AR" />
    <passport-stamp country="AR" city="Mendoza" date="2026-11-07" />
    <passport-stamp
      [country]="selectedCountry"
      [city]="selectedCity"
      [date]="visitDate"
      variant="clean"
      [size]="280"
    />
  \`
})
export class ExampleComponent {
  selectedCountry = 'AR';
  selectedCity = 'Mendoza';
  visitDate = '2026-11-07';
}`)}</code></pre>
<p>Use property bindings such as <code>[country]</code> and <code>[date]</code> for changing values. <code>size</code> is a number in pixels: use <code>[size]="280"</code>.</p>
</details>
<details><summary>React 18+ · &lt;PassportStamp /&gt;</summary>
<p>Import the component and pass props. It works with standard React tooling; you do not need an SVG loader or a public assets folder.</p>
<pre><code>${escape(`import { PassportStamp } from '@lucianopignotti/passport-stamps/react';

export function Example() {
  const selectedCountry = 'AR';
  const selectedCity = 'Mendoza';
  const visitDate = '2026-11-07';

  return (
    <>
      <PassportStamp country="AR" />
      <PassportStamp country="AR" city="Mendoza" date="2026-11-07" />
      <PassportStamp
        country={selectedCountry}
        city={selectedCity}
        date={visitDate}
        variant="clean"
        size={280}
      />
    </>
  );
}`)}</code></pre>
<p>The component is a client entry point and loads artwork asynchronously. On server-rendered pages, the image appears after the client loads it.</p>
</details>
<details><summary>Properties and selection rules</summary>
<div class="properties-scroll"><table class="properties"><thead><tr><th>Property</th><th>Example</th><th>Behavior</th></tr></thead><tbody>
<tr><td>country</td><td><code>"AR"</code></td><td>Required. ISO alpha-2 code recommended. Country names and known aliases also work.</td></tr>
<tr><td>city</td><td><code>"Mendoza"</code></td><td>Optional. Name, slug, alias, or destination ID. Without it, show the country stamp.</td></tr>
<tr><td>strictCity</td><td><code>true</code></td><td>Optional. Report an error when the selected country does not have the requested city. Defaults to false.</td></tr>
<tr><td>date</td><td><code>"2026-11-07"</code></td><td>Optional calendar date in YYYY-MM-DD format. Printed inside the stamp as 07 NOV 2026.</td></tr>
<tr><td>dateFormat</td><td><code>"numeric"</code></td><td>Print 07/11/2026. The default, text, prints 07 NOV 2026.</td></tr>
<tr><td>variant</td><td><code>"worn"</code></td><td>Worn by default. Set to <code>"clean"</code> to remove ink effects.</td></tr>
<tr><td>color</td><td><code>"#8B2252"</code></td><td>Override ink with a #RGB or #RRGGBB color. Takes priority over randomColor.</td></tr>
<tr><td>randomColor</td><td><code>true</code></td><td>Choose a palette color once per component instance. Defaults to false.</td></tr>
<tr><td>assetBaseUrl</td><td><code>"/travel/assets/stamps"</code></td><td>Optional directory containing svg/ for undated stamps. Copy the package SVGs there first.</td></tr>
<tr><td>size</td><td><code>280</code></td><td>Width in pixels, default 240. Height follows the 4:3 artwork ratio.</td></tr>
<tr><td>alt</td><td><code>"My visit to Mendoza"</code></td><td>Optional image description. Otherwise generated from the selected stamp and date.</td></tr><tr><td>loading</td><td><code>"eager"</code></td><td>Native image loading, default lazy. Use eager for a stamp visible on first paint.</td></tr>
</tbody></table></div>
<p>If a city is not in the selected country's catalog, the component uses the country stamp. Unknown countries and invalid dates show an explicit error. Dates do not undergo timezone conversion. A dated layout reserves a dedicated row inside the frame so the date does not cover existing lettering.</p>
<p>Artwork loads on demand from the package, without a CDN. Components use isolated SVG data URLs, so repeated stamps do not share filter IDs. If your site sets a Content Security Policy, allow <code>data:</code> images or use <code>assetBaseUrl</code> for undated stamps.</p>
</details>
<details><summary>Web Component · Vue, Svelte, Astro and plain HTML</summary>
<p>Register the element once, then use it like any HTML tag. Attributes use kebab case, for example <code>date-format</code>, <code>strict-city</code> and <code>asset-base-url</code>.</p>
<pre><code>${escape(`<script type="module">
  import { definePassportStamp } from '@lucianopignotti/passport-stamps/element';
  definePassportStamp(); // or definePassportStamp('travel-stamp')
</script>

<passport-stamp country="AR" city="Mendoza" date="2026-11-07" size="280"></passport-stamp>`)}</code></pre>
<p>Registration is explicit, so importing the module has no side effects. Pass another tag name if <code>passport-stamp</code> is already used, for example by the Angular component in the same page.</p>
</details>
<details><summary>Plain HTML and direct SVG files</summary>
<p>Download a file from the gallery, or copy it from the npm package into your public/stamps folder.</p>
<pre><code>&lt;img src="/stamps/ar-mendoza.svg" alt="Mendoza — grapes and Andes Mountains" width="400" height="300"&gt;</code></pre>
<p>Static SVG files remain available at the same paths. Dynamic dates are provided by the components and core renderer.</p>
</details>
<p id="component-demo"><a href="#workshop">Try the stamp workshop</a> using the same renderer as the Angular and React components.</p>
</section>`;
}

export function stampWorkshop(countries, destinations) {
  const initial = destinations.find(stamp => stamp.id === 'ar-mendoza');
  const downloadLink = `<a data-workshop-download class="button" href="hero-mendoza.svg" download="ar-mendoza-2026-11-07.svg" data-track="svg_downloaded" data-track-source="workshop" data-track-id="ar-mendoza" data-track-finish="worn">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/></svg>
      Download SVG
    </a>`;
  return `<section id="workshop" class="workshop" aria-labelledby="workshop-heading">
  <div class="section-heading">
    <h2 id="workshop-heading">Make a stamp.</h2>
    <p>Choose a destination, add a date, and make it yours.</p>
  </div>
  <div class="workshop-editor">
    <form id="workshop-form" class="workshop-controls js-only">
      <h3>Customize</h3>
      <div class="workshop-fields">
        <div class="workshop-field"><label for="workshop-country">Country</label><select id="workshop-country">${countries.map(country => `<option value="${country.code}"${country.code === initial.code ? ' selected' : ''}>${escape(country.name)}</option>`).join('')}</select></div>
        <div class="workshop-field"><label for="workshop-city">City <span>(optional)</span></label><select id="workshop-city"><option value="">Country stamp</option><option value="${initial.id}" selected>${escape(initial.name)}</option></select></div>
        <div class="workshop-field"><label for="workshop-date">Date <span>(optional)</span></label><input id="workshop-date" type="date" value="2026-11-07" min="0001-01-01" max="9999-12-31"></div>
        <fieldset class="workshop-finish">
          <legend>Ink finish</legend>
          <div class="workshop-ink-options">
            <label><input type="radio" name="workshop-finish" value="worn" checked><span>Worn</span></label>
            <label><input type="radio" name="workshop-finish" value="clean"><span>Clean</span></label>
          </div>
        </fieldset>
        <div class="workshop-field workshop-color-field">
          <label for="workshop-color">Ink color</label>
          <div class="workshop-color-options">
            <input id="workshop-color" type="color" value="${initial.color}">
            <button id="workshop-random-color" type="button">Random ink</button>
            <button id="workshop-original-color" type="button" disabled>Original ink</button>
          </div>
        </div>
      </div>
      <div class="workshop-actions">
        <button id="workshop-open-paper" class="workshop-preview-button" type="button" aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7c-2-2-5-3-9-2v13c4-1 7 0 9 2 2-2 5-3 9-2V5c-4-1-7 0-9 2zm0 0v13"/></svg>
          Preview on paper
        </button>
        ${downloadLink}
        <button id="workshop-png" class="workshop-preview-button" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/></svg>
          Save image
        </button>
        <button id="workshop-share" class="workshop-preview-button" type="button" hidden>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8"/></svg>
          Share
        </button>
      </div>
    </form>
    <div class="workshop-live">
      <p class="workshop-live-label">Live preview</p>
      <div class="workshop-canvas">
        <img id="workshop-image" src="hero-mendoza.svg" width="400" height="300" alt="Mendoza passport stamp, 07 NOV 2026">
      </div>
      <div class="workshop-live-caption">
        <strong id="workshop-caption">${escape(initial.name)}, ${escape(initial.countryName)}</strong>
        <span>SVG · Transparent background</span>
      </div>
    </div>
  </div>
  <p id="workshop-status" class="workshop-status" role="status"></p>
  <noscript><p>Enable JavaScript to customize a stamp, or download an SVG from the collection.</p></noscript>
  <dialog id="workshop-paper" class="workshop-paper" aria-labelledby="workshop-paper-heading" aria-describedby="workshop-paper-caption">
    <form method="dialog">
      <div class="workshop-paper-header">
        <div>
          <h2 id="workshop-paper-heading">Preview on paper</h2>
          <p id="workshop-paper-caption">${escape(initial.name)}, ${escape(initial.countryName)} · 07 NOV 2026 · Worn ink</p>
        </div>
        <button type="submit" class="workshop-paper-close" aria-label="Close preview" autofocus>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
      </div>
      <div class="workshop-stage">
        <div class="workshop-book">
          <div class="workshop-page workshop-entry">
            <span class="workshop-imprint">Travel journal</span>
            <h3><span id="workshop-place">${escape(initial.name)}</span><span id="workshop-place-country">, <br>${escape(initial.countryName)}</span></h3>
            <dl class="workshop-details">
              <div><dt>Visit date</dt><dd id="workshop-printed-date">07 Nov 2026</dd></div>
              <div><dt>Motif</dt><dd id="workshop-motif">${escape(initial.iconLabel)}</dd></div>
            </dl>
            <span class="workshop-page-number" aria-hidden="true">01 · Destination</span>
          </div>
          <div class="workshop-page workshop-art">
            <span class="workshop-visa" aria-hidden="true">Visa / <span id="workshop-visa-country">${escape(initial.countryName)}</span></span>
            <img id="workshop-paper-image" width="400" height="300" alt="Mendoza passport stamp, 07 NOV 2026">
            <span class="workshop-page-number" aria-hidden="true">02 · Arrival</span>
          </div>
        </div>
      </div>
      <div class="workshop-paper-footer">
        <p>SVG export has a transparent background.</p>
        <div class="workshop-actions">
          <button type="submit" class="workshop-back-button">Back to editor</button>
          ${downloadLink}
        </div>
      </div>
    </form>
  </dialog>
</section>`;
}
