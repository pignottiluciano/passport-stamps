// Static documentation gallery. No framework or runtime dependencies.
document.body.classList.remove('no-js');
const $ = selector => document.querySelector(selector);
const catalog = $('#catalog');
const cardTemplate = $('#card-template').content.firstElementChild;
const tabs = [...document.querySelectorAll('button[data-kind]')];
const search = $('#search');
const filter = $('#region');
const previous = $('#previous');
const next = $('#next');
const status = $('#action-status');
const copyDialog = $('#copy-dialog');
const copyText = $('#copy-text');
const filterOptions = JSON.parse($('#filter-options').textContent);
const normalize = value => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const pageSize = 24;
// Analytics are optional: scripts/analytics.js defines psTrack on the public site only.
const track = (event, properties) => window.psTrack?.(event, properties);
const byId = new Map();
let stamps = [];
let kind = 'country';
let page = 1;

// The first page is server-rendered; the full collection loads as compact JSON instead of 431 hidden cards.
const ready = fetch('stamps.json')
  .then(response => {
    if (!response.ok) throw new Error('Collection request failed');
    return response.json();
  })
  .then(list => {
    stamps = list.map(stamp => ({...stamp, haystack: normalize(stamp.search)}));
    for (const stamp of stamps) byId.set(stamp.id, stamp);
  });

const svgPath = (id, finish) => '../svg/' + (finish === 'clean' ? 'clean/' : '') + id + '.svg';
const place = stamp => stamp.kind === 'country' ? stamp.name : stamp.name + ', ' + stamp.countryName;

function cardFor(stamp) {
  const card = cardTemplate.cloneNode(true);
  card.dataset.id = stamp.id;
  card.querySelector('a').href = 'stamps/' + stamp.id + '.html';
  const image = card.querySelector('img');
  image.src = svgPath(stamp.id, 'worn');
  image.alt = stamp.name + ': ' + stamp.iconLabel;
  card.querySelector('.stamp-name').textContent = stamp.name;
  card.querySelector('.stamp-motif').textContent = stamp.iconLabel;
  card.querySelector('.stamp-code').textContent = stamp.code;
  return card;
}

function configureFilter() {
  filter.replaceChildren(...filterOptions[kind].map(([value, label]) => new Option(label, value)));
  $('#filter-name').textContent = kind === 'country' ? 'Region' : 'Country';
  for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.kind === kind));
}

function restoreLocation() {
  const params = new URLSearchParams(location.search);
  kind = params.get('collection') === 'destinations' ? 'destination' : 'country';
  configureFilter();
  const requestedFilter = params.get(kind === 'country' ? 'region' : 'country');
  filter.value = filterOptions[kind].some(([code]) => code === requestedFilter) ? requestedFilter : '';
  search.value = params.get('q') ?? '';
  const requestedPage = Number(params.get('page'));
  page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  render();
  const requestedStamp = byId.get(params.get('stamp') ?? '');
  if (requestedStamp) openStamp(requestedStamp, 'link');
  else if (dialog.open) dialog.close();
}

function syncLocation() {
  const params = new URLSearchParams();
  if (kind === 'destination') params.set('collection', 'destinations');
  if (filter.value) params.set(kind === 'country' ? 'region' : 'country', filter.value);
  if (search.value.trim()) params.set('q', search.value.trim());
  if (page > 1) params.set('page', String(page));
  if (current) params.set('stamp', current.id);
  const query = params.toString();
  // replaceState keeps typing from filling the browser's Back history.
  history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
}

function render() {
  const query = normalize(search.value.trim());
  const matches = stamps.filter(stamp => stamp.kind === kind &&
    (!filter.value || (kind === 'country' ? stamp.region : stamp.code) === filter.value) &&
    stamp.haystack.includes(query));
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  page = Math.min(page, pages);
  catalog.replaceChildren(...matches.slice((page - 1) * pageSize, page * pageSize).map(cardFor));
  $('#empty').hidden = matches.length > 0;
  $('#result-count').textContent = matches.length ?
    ((page - 1) * pageSize + 1) + '–' + Math.min(page * pageSize, matches.length) + ' of ' + matches.length +
    (kind === 'country' ? (matches.length === 1 ? ' country' : ' countries') : (matches.length === 1 ? ' destination' : ' destinations')) : '0 results';
  $('#page-count').textContent = 'Page ' + page + ' of ' + pages;
  previous.disabled = page === 1;
  next.disabled = page === pages;
  $('#collection-size').textContent = 'Worn SVGs in these results: ' +
    (matches.reduce((sum, stamp) => sum + stamp.bytes, 0) / 1000).toFixed(1) + ' KB';
  syncLocation();
}

for (const tab of tabs) tab.addEventListener('click', () => {
  kind = tab.dataset.kind;
  page = 1;
  search.value = '';
  configureFilter();
  render();
});
for (const input of [search, filter]) input.addEventListener('input', () => {
  page = 1;
  render();
});
for (const [button, delta] of [[previous, -1], [next, 1]]) button.addEventListener('click', () => {
  page += delta;
  render();
  $('#result-count').scrollIntoView({block: 'start'});
});
window.addEventListener('popstate', restoreLocation);

async function copy(value, description) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(value);
    status.textContent = description + ' copied.';
  } catch {
    // Manual fallback also works when clipboard permissions are denied.
    $('#copy-description').textContent = 'Automatic copying is unavailable. Select and copy the ' + description.toLowerCase() + ' below.';
    copyText.value = value;
    copyDialog.showModal();
    copyText.focus();
    copyText.select();
    status.textContent = 'Ready to copy manually.';
  }
}

$('#copy-view').addEventListener('click', () => copy(location.href, 'View link'));
$('#copy-install').addEventListener('click', () => {
  track('install_copied');
  copy('npm install @lucianopignotti/passport-stamps', 'Install command');
});
const quickExamples = {
  angular: "import { PassportStampComponent } from\n  '@lucianopignotti/passport-stamps/angular';\n\n// Add PassportStampComponent to imports.\n<passport-stamp\n  country=\"AR\"\n  city=\"Mendoza\"\n  date=\"2026-11-07\"\n  [size]=\"280\"\n/>",
  react: "import { PassportStamp } from\n  '@lucianopignotti/passport-stamps/react';\n\n<PassportStamp\n  country=\"AR\"\n  city=\"Mendoza\"\n  date=\"2026-11-07\"\n  size={280}\n/>",
  element: "import { definePassportStamp } from\n  '@lucianopignotti/passport-stamps/element';\ndefinePassportStamp();\n\n<passport-stamp\n  country=\"AR\"\n  city=\"Mendoza\"\n  date=\"2026-11-07\"\n  size=\"280\"\n></passport-stamp>"
};
for (const button of document.querySelectorAll('[data-framework]')) button.addEventListener('click', () => {
  $('#quick-example').textContent = quickExamples[button.dataset.framework];
  for (const other of document.querySelectorAll('[data-framework]')) other.setAttribute('aria-pressed', String(other === button));
});
$('#copy-example').addEventListener('click', () => {
  track('example_copied', {framework: $('[data-framework][aria-pressed="true"]').dataset.framework});
  copy($('#quick-example').textContent, 'Code example');
});
$('#copy-close').addEventListener('click', () => copyDialog.close());

// Stamp details: one dialog for preview, downloads, copying and framework snippets.
const dialog = $('#stamp-dialog');
const dialogImage = $('#stamp-dialog-image');
const dialogDownload = $('#stamp-dialog-download');
const dialogCode = $('#stamp-dialog-code');
let current;
let opener;
let snippetKind = 'angular';
let snippets;
const dialogFinish = () => document.querySelector('input[name="stamp-dialog-finish"]:checked').value;

function updateDialogArt() {
  const finish = dialogFinish();
  dialogImage.src = svgPath(current.id, finish);
  dialogImage.alt = current.name + ' — ' + current.iconLabel + ' passport stamp, ' + finish + ' ink';
  dialogDownload.href = dialogImage.getAttribute('src');
  dialogDownload.download = current.id + (finish === 'clean' ? '-clean' : '') + '.svg';
  dialogDownload.dataset.trackId = current.id;
  dialogDownload.dataset.trackFinish = finish;
}

async function updateSnippet() {
  const stamp = current;
  snippets ??= import('./snippets.js');
  const {stampSnippets} = await snippets;
  if (stamp === current) dialogCode.textContent = stampSnippets(stamp)[snippetKind];
}

function openStamp(stamp, source) {
  if (current !== stamp) track('stamp_opened', {id: stamp.id, kind: stamp.kind, source});
  current = stamp;
  $('#stamp-dialog-kicker').textContent = stamp.kind === 'country' ? 'Country · ' + stamp.region : 'Destination · ' + stamp.countryName;
  $('#stamp-dialog-name').textContent = stamp.name;
  $('#stamp-dialog-motif').textContent = stamp.iconLabel;
  $('#stamp-dialog-page').href = 'stamps/' + stamp.id + '.html';
  updateDialogArt();
  dialogCode.textContent = '';
  updateSnippet().catch(() => { dialogCode.textContent = 'Could not load the code example.'; });
  if (!dialog.open) dialog.showModal();
  syncLocation();
}

catalog.addEventListener('click', event => {
  const link = event.target.closest('a.card-open');
  // Modified clicks keep the normal link behavior, such as opening the stamp page in a new tab.
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const stamp = byId.get(link.closest('article').dataset.id);
  if (!stamp) return;
  event.preventDefault();
  opener = link;
  openStamp(stamp, 'card');
});
for (const radio of document.querySelectorAll('input[name="stamp-dialog-finish"]')) radio.addEventListener('change', updateDialogArt);
for (const button of document.querySelectorAll('[data-snippet]')) button.addEventListener('click', () => {
  snippetKind = button.dataset.snippet;
  for (const other of document.querySelectorAll('[data-snippet]')) other.setAttribute('aria-pressed', String(other === button));
  updateSnippet();
});
$('#stamp-dialog-close').addEventListener('click', () => dialog.close());
// A click on the backdrop lands on the dialog element itself.
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => {
  current = undefined;
  syncLocation();
  opener?.focus();
  opener = undefined;
});
$('#stamp-dialog-copy-svg').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  status.textContent = 'Loading SVG…';
  try {
    const response = await fetch(dialogImage.getAttribute('src'));
    if (!response.ok) throw new Error('SVG request failed');
    track('svg_copied', {id: current.id, finish: dialogFinish()});
    await copy(await response.text(), dialogFinish() === 'clean' ? 'Clean SVG' : 'Worn SVG');
  } catch {
    status.textContent = 'Could not load the SVG. Try again or use the download link.';
  } finally {
    button.disabled = false;
  }
});
$('#stamp-dialog-copy-link').addEventListener('click', () => {
  track('link_copied', {id: current.id});
  copy(new URL('stamps/' + current.id + '.html', location.href).href, 'Stamp link');
});
$('#stamp-dialog-copy-code').addEventListener('click', () => {
  track('snippet_copied', {id: current.id, framework: snippetKind});
  copy(dialogCode.textContent, 'Code example');
});
$('#stamp-dialog-workshop').addEventListener('click', event => {
  event.preventDefault();
  const stamp = current;
  opener = undefined;
  dialog.close();
  makeInWorkshop(stamp, 'dialog');
});

// The workshop loads artwork through the same renderer as the framework adapters.
const workshop = $('#workshop');
const workshopForm = $('#workshop-form');
const workshopPaper = $('#workshop-paper');
const workshopOpenPaper = $('#workshop-open-paper');
const workshopCountry = $('#workshop-country');
const workshopCity = $('#workshop-city');
const workshopDate = $('#workshop-date');
const workshopFinish = workshopForm.elements.namedItem('workshop-finish');
const workshopImage = $('#workshop-image');
const workshopColor = $('#workshop-color');
const workshopRandomColor = $('#workshop-random-color');
const workshopOriginalColor = $('#workshop-original-color');
let workshopSelectedColor;
const workshopDownloads = workshop.querySelectorAll('[data-workshop-download]');
const workshopPng = $('#workshop-png');
const workshopShare = $('#workshop-share');
const workshopStatus = $('#workshop-status');
let workshopRequest = 0;
let workshopName = 'ar-mendoza-2026-11-07';
let workshopTrack = {id: 'ar-mendoza', dated: true};
let workshopPlace = 'Mendoza, Argentina';
function clearWorkshopDownload() {
  const previous = workshopDownloads[0].href;
  if (previous.startsWith('blob:')) URL.revokeObjectURL(previous);
  workshopOpenPaper.disabled = true;
  workshopPng.disabled = true;
  workshopShare.disabled = true;
  for (const link of workshopDownloads) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
  }
}

function updateWorkshopCities(selected = '') {
  const cities = stamps.filter(stamp => stamp.kind === 'destination' && stamp.code === workshopCountry.value)
    .map(stamp => new Option(stamp.name, stamp.id))
    .sort((a, b) => a.text.localeCompare(b.text, 'en'));
  workshopCity.replaceChildren(new Option('Country stamp', ''), ...cities);
  workshopCity.value = selected;
  workshopCity.disabled = cities.length === 0;
}

async function updateWorkshop() {
  const request = ++workshopRequest;
  const options = {
    country: workshopCountry.value,
    city: workshopCity.value,
    date: workshopDate.value,
    variant: workshopFinish.value,
    color: workshopSelectedColor
  };
  const countryName = workshopCountry.selectedOptions[0].text;
  clearWorkshopDownload();

  if (!workshopDate.validity.valid) {
    workshopImage.hidden = true;
    workshopStatus.textContent = 'Enter a valid date or clear it to make a stamp without a date.';
    return;
  }

  workshopStatus.textContent = 'Updating stamp…';
  try {
    const {createStampSvg, resolveStamp} = await import('../dist/core/index.js');
    const {stamp, date} = resolveStamp(options);
    const svg = await createStampSvg(options);
    if (request !== workshopRequest) return;
    const svgUrl = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
    workshopImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    workshopImage.alt = stamp.name + ' — ' + stamp.iconLabel + ' passport stamp' + (date ? ', ' + date : '');
    workshopImage.hidden = false;
    workshopColor.value = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('g[color]').getAttribute('color');
    workshopOriginalColor.disabled = options.color === undefined;
    workshopPlace = stamp.kind === 'country' ? stamp.name : stamp.name + ', ' + countryName;
    $('#workshop-caption').textContent = workshopPlace;
    const ink = options.variant === 'clean' ? 'Clean ink' : 'Worn ink';
    $('#workshop-paper-caption').textContent = [workshopPlace, date ?? 'Undated', ink].join(' · ');
    $('#workshop-place').textContent = stamp.name;
    const placeCountry = $('#workshop-place-country');
    placeCountry.hidden = stamp.kind === 'country';
    placeCountry.replaceChildren(', ', document.createElement('br'), countryName);
    $('#workshop-printed-date').textContent = date ?? 'Undated';
    $('#workshop-motif').textContent = stamp.iconLabel;
    $('#workshop-visa-country').textContent = countryName;
    workshopName = stamp.id + (options.date ? '-' + options.date : '') + (options.variant === 'clean' ? '-clean' : '');
    workshopTrack = {id: stamp.id, dated: Boolean(date)};
    for (const link of workshopDownloads) {
      link.href = svgUrl;
      link.download = workshopName + '.svg';
      link.dataset.trackId = stamp.id;
      link.dataset.trackFinish = options.variant;
      link.removeAttribute('aria-disabled');
    }
    workshopOpenPaper.disabled = false;
    workshopPng.disabled = false;
    workshopShare.disabled = false;
    workshopStatus.textContent = '';
  } catch {
    if (request !== workshopRequest) return;
    workshopImage.hidden = true;
    workshopStatus.textContent = 'Could not load the stamp preview. Reload the page to try again.';
  }
}

function makeInWorkshop(stamp, source) {
  track('workshop_started', {id: stamp.id, source});
  workshopCountry.value = stamp.code;
  updateWorkshopCities(stamp.kind === 'destination' ? stamp.id : '');
  updateWorkshop();
  workshop.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  workshopDate.focus({preventScroll: true});
}

// Social apps accept PNG, not SVG: rasterize at 3× with a transparent background.
async function workshopPngFile() {
  const image = new Image();
  image.src = workshopImage.src;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('PNG export failed')), 'image/png'));
  return new File([blob], workshopName + '.png', {type: 'image/png'});
}

workshopPng.addEventListener('click', async () => {
  try {
    const file = await workshopPngFile();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    track('workshop_png_saved', workshopTrack);
    workshopStatus.textContent = 'Image saved.';
  } catch {
    workshopStatus.textContent = 'Could not create the image. Download the SVG instead.';
  }
});
// Only offered where the browser can share image files, such as mobile Safari and Chrome.
workshopShare.hidden = !navigator.canShare?.({files: [new File([''], 'stamp.png', {type: 'image/png'})]});
workshopShare.addEventListener('click', async () => {
  try {
    const file = await workshopPngFile();
    await navigator.share({files: [file], title: workshopPlace + ' passport stamp'});
    track('workshop_shared', workshopTrack);
  } catch (error) {
    if (error?.name !== 'AbortError') workshopStatus.textContent = 'Could not share the image. Use Save image instead.';
  }
});

workshopForm.addEventListener('input', () => {
  workshopRequest++;
  clearWorkshopDownload();
});
workshopForm.addEventListener('change', event => {
  if (event.target === workshopCountry) updateWorkshopCities();
  if (event.target === workshopColor) {
    workshopSelectedColor = workshopColor.value;
    track('workshop_color_changed', {source: 'picker'});
  }
  updateWorkshop();
});
workshopForm.addEventListener('submit', event => event.preventDefault());
workshopRandomColor.addEventListener('click', async () => {
  const request = ++workshopRequest;
  clearWorkshopDownload();
  try {
    const {pickStampColor} = await import('../dist/core/index.js');
    if (request !== workshopRequest) return;
    workshopSelectedColor = pickStampColor();
    track('workshop_color_changed', {source: 'random'});
    updateWorkshop();
  } catch {
    if (request !== workshopRequest) return;
    workshopStatus.textContent = 'Could not choose an ink color. Try again.';
  }
});
workshopOriginalColor.addEventListener('click', () => {
  workshopSelectedColor = undefined;
  track('workshop_color_changed', {source: 'original'});
  updateWorkshop();
});

workshopOpenPaper.addEventListener('click', () => {
  const paperImage = $('#workshop-paper-image');
  paperImage.src = workshopImage.src;
  paperImage.alt = workshopImage.alt;
  workshopPaper.showModal();
});
workshopPaper.addEventListener('close', () => workshopOpenPaper.focus());

ready.then(() => {
  // Read before restoreLocation() rewrites the query string; stamp pages link here with ?make=<id>.
  const make = byId.get(new URLSearchParams(location.search).get('make') ?? '');
  updateWorkshopCities(workshopCity.value);
  restoreLocation();
  if (make) makeInWorkshop(make, 'page');
}).catch(() => {
  status.textContent = 'Could not load the collection. Reload the page or browse all stamps on one page.';
});
