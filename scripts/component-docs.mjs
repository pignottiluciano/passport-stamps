const escape = value => value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function componentDocs(countries) {
  return `<section class="get-started" aria-label="Installation and components">
<div class="install-row"><code>npm install @lucianopignotti/passport-stamps</code><button type="button" id="copy-install" class="js-only">Copy command</button><a href="https://github.com/pignottiluciano/passport-stamps">GitHub ↗</a><a href="https://www.npmjs.com/package/@lucianopignotti/passport-stamps">npm ↗</a></div>
<p class="component-intro">One component. Country, city, and an optional date — all through properties.</p>
<p class="release-note">The component API is prepared for the next npm release. Use the repository build until that version is published.</p>
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
<tr><td>date</td><td><code>"2026-11-07"</code></td><td>Optional calendar date in YYYY-MM-DD format. Printed inside the stamp as 07 NOV 2026.</td></tr>
<tr><td>variant</td><td><code>"worn"</code></td><td>Worn by default. Set to <code>"clean"</code> to remove ink effects.</td></tr>
<tr><td>size</td><td><code>280</code></td><td>Width in pixels, default 240. Height follows the 4:3 artwork ratio.</td></tr>
<tr><td>alt</td><td><code>"My visit to Mendoza"</code></td><td>Optional image description. Otherwise generated from the selected stamp and date.</td></tr>
</tbody></table></div>
<p>If a city is not in the selected country's catalog, the component uses the country stamp. Unknown countries and invalid dates show an explicit error. Dates do not undergo timezone conversion. A dated layout reserves a dedicated row inside the frame so the date does not cover existing lettering.</p>
<p>Artwork loads on demand from the package, without a CDN. Components use isolated SVG data URLs, so repeated stamps do not share filter IDs. If your site sets a Content Security Policy, its image policy must allow <code>data:</code> images.</p>
</details>
<details><summary>Plain HTML and direct SVG files</summary>
<p>Download a file from the gallery, or copy it from the npm package into your public/stamps folder.</p>
<pre><code>&lt;img src="/stamps/ar-mendoza.svg" alt="Mendoza — grapes and Andes Mountains" width="400" height="300"&gt;</code></pre>
<p>Static SVG files remain available at the same paths. Dynamic dates are provided by the components and core renderer.</p>
</details>
<details class="js-only" id="component-demo"><summary>Try the properties · live preview</summary>
<p>This preview uses the same renderer as the Angular and React components.</p>
<form id="stamp-demo" class="demo-controls">
<label>Country<select id="demo-country">${countries.map(c=>`<option value="${c.code}"${c.code==='AR'?' selected':''}>${escape(c.name)} (${c.code})</option>`).join('')}</select></label>
<label>City (optional)<input id="demo-city" value="Mendoza" placeholder="Leave empty for country stamp" list="demo-cities" autocomplete="off"><datalist id="demo-cities"></datalist></label>
<label>Date (optional)<input id="demo-date" type="date" value="2026-11-07" min="0001-01-01" max="9999-12-31"></label>
<label>Variant<select id="demo-variant"><option value="worn">Worn</option><option value="clean">Clean</option></select></label>
<button type="submit">Update stamp</button>
</form>
<div class="demo-result"><img id="demo-image" width="400" height="300" alt="Stamp preview" hidden><p id="demo-status" role="status" aria-live="polite">Open this preview to load a stamp.</p></div>
</details></section>`;
}
