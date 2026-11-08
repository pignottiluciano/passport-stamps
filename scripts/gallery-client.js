// Static documentation gallery. No framework or runtime dependencies.
document.body.classList.remove('no-js');
const articles = [...document.querySelectorAll('#catalog article')];
const tabs = [...document.querySelectorAll('button[data-kind]')];
const search = document.querySelector('#search');
const filter = document.querySelector('#region');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const status = document.querySelector('#action-status');
const copyDialog = document.querySelector('#copy-dialog');
const copyText = document.querySelector('#copy-text');
const filterOptions = JSON.parse(document.querySelector('#filter-options').textContent);
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const searchable = new Map(articles.map(card => [card, normalize(card.dataset.search)]));
const pageSize = 24;
let kind = 'country';
let page = 1;
let selectedStamp = '';

function configureFilter() {
  filter.replaceChildren(...filterOptions[kind].map(([value, label]) => new Option(label, value)));
  document.querySelector('#filter-name').textContent = kind === 'country' ? 'Region' : 'Country';
  for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.kind === kind));
}

function restoreLocation() {
  const params = new URLSearchParams(location.search);
  selectedStamp = params.get('stamp') ?? '';
  const selectedCard = articles.find(card => card.dataset.id === selectedStamp);
  if (!selectedCard) selectedStamp = '';
  kind = selectedCard?.dataset.kind ?? (params.get('collection') === 'destinations' ? 'destination' : 'country');
  configureFilter();
  const requestedFilter = params.get(kind === 'country' ? 'region' : 'country');
  filter.value = !selectedStamp && filterOptions[kind].some(([code]) => code === requestedFilter) ? requestedFilter : '';
  search.value = selectedStamp ? '' : params.get('q') ?? '';
  const requestedPage = Number(params.get('page'));
  page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && !selectedStamp ? requestedPage : 1;
  render();
}

function syncLocation() {
  const params = new URLSearchParams();
  if (kind === 'destination') params.set('collection', 'destinations');
  if (filter.value) params.set(kind === 'country' ? 'region' : 'country', filter.value);
  if (search.value.trim()) params.set('q', search.value.trim());
  if (page > 1) params.set('page', String(page));
  if (selectedStamp) params.set('stamp', selectedStamp);
  const query = params.toString();
  // replaceState keeps typing from filling the browser's Back history.
  history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
}

function render() {
  const query = normalize(search.value.trim());
  const matches = articles.filter(card => card.dataset.kind === kind &&
    (!selectedStamp || card.dataset.id === selectedStamp) &&
    (!filter.value || (kind === 'country' ? card.dataset.region : card.dataset.code) === filter.value) &&
    searchable.get(card).includes(query));
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  page = Math.min(page, pages);
  const visible = new Set(matches.slice((page - 1) * pageSize, page * pageSize));
  for (const card of articles) card.hidden = !visible.has(card);
  document.querySelector('#empty').hidden = matches.length > 0;
  document.querySelector('#result-count').textContent = matches.length ?
    ((page - 1) * pageSize + 1) + '–' + Math.min(page * pageSize, matches.length) + ' of ' + matches.length +
    (kind === 'country' ? (matches.length === 1 ? ' country' : ' countries') : (matches.length === 1 ? ' destination' : ' destinations')) : '0 results';
  document.querySelector('#page-count').textContent = 'Page ' + page + ' of ' + pages;
  previous.disabled = page === 1;
  next.disabled = page === pages;
  document.querySelector('#collection-size').textContent = 'Worn SVGs in these results: ' +
    (matches.reduce((sum, card) => sum + Number(card.dataset.bytes), 0) / 1000).toFixed(1) + ' KB';
  const selection = document.querySelector('#stamp-selection');
  selection.hidden = !selectedStamp;
  document.querySelector('#selected-name').textContent = matches[0]?.querySelector('.stamp-name').textContent ?? '';
  syncLocation();
}

for (const tab of tabs) tab.addEventListener('click', () => {
  kind = tab.dataset.kind;
  page = 1;
  selectedStamp = '';
  search.value = '';
  configureFilter();
  render();
});
for (const input of [search, filter]) input.addEventListener('input', () => {
  page = 1;
  selectedStamp = '';
  render();
});
for (const [button, delta] of [[previous, -1], [next, 1]]) button.addEventListener('click', () => {
  page += delta;
  render();
  document.querySelector('#result-count').scrollIntoView({block: 'start'});
});
document.querySelector('#show-all').addEventListener('click', () => {
  selectedStamp = '';
  page = 1;
  render();
});
window.addEventListener('popstate', restoreLocation);

async function copy(value, description) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(value);
    status.textContent = description + ' copied.';
  } catch {
    // Manual fallback also works when clipboard permissions are denied.
    document.querySelector('#copy-description').textContent = 'Automatic copying is unavailable. Select and copy the ' + description.toLowerCase() + ' below.';
    copyText.value = value;
    copyDialog.showModal();
    copyText.focus();
    copyText.select();
    status.textContent = 'Ready to copy manually.';
  }
}

document.querySelector('#copy-view').addEventListener('click', () => copy(location.href, 'View link'));
document.querySelector('#copy-install').addEventListener('click', () => copy('npm install @lucianopignotti/passport-stamps', 'Install command'));
document.querySelector('#copy-close').addEventListener('click', () => copyDialog.close());
document.querySelector('#catalog').addEventListener('click', async event => {
  const button = event.target.closest('button[data-copy-svg]');
  if (!button) return;
  const card = button.closest('article');
  const finish = card.querySelector('select').value;
  const path = card.dataset[finish === 'clean' ? 'cleanFile' : 'file'];
  button.disabled = true;
  status.textContent = 'Loading SVG…';
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('SVG request failed');
    await copy(await response.text(), finish === 'clean' ? 'Clean SVG' : 'Worn SVG');
  } catch {
    status.textContent = 'Could not load the SVG. Try again or use the download link.';
  } finally {
    button.disabled = false;
  }
});
restoreLocation();

// The interactive example uses the same lazy core renderer as both framework adapters.
const demo = document.querySelector('#stamp-demo');
const demoCountry = document.querySelector('#demo-country');
function updateCitySuggestions() {
  document.querySelector('#demo-cities').replaceChildren(...articles
    .filter(card => card.dataset.kind === 'destination' && card.dataset.code === demoCountry.value)
    .map(card => new Option(card.querySelector('.stamp-name').textContent.slice(5))));
}
let demoRequest = 0;
async function updateDemo(event) {
  event?.preventDefault();
  const request = ++demoRequest;
  const message = document.querySelector('#demo-status');
  const image = document.querySelector('#demo-image');
  const button = demo.querySelector('button');
  image.hidden = true;
  button.disabled = true;
  message.textContent = 'Loading stamp…';
  try {
    const {createStampImage} = await import('../dist/core/index.js');
    const result = await createStampImage({country:demoCountry.value,city:document.querySelector('#demo-city').value,date:document.querySelector('#demo-date').value,variant:document.querySelector('#demo-variant').value});
    if (request !== demoRequest) return;
    image.src = result.src;
    image.alt = result.alt;
    image.hidden = false;
    message.textContent = result.fallback ? 'This city is not in the catalog yet. Showing the country stamp.' : result.alt;
  } catch (error) {
    if (request === demoRequest) message.textContent = error instanceof Error ? error.message : 'Could not load the stamp.';
  } finally {
    if (request === demoRequest) button.disabled = false;
  }
}
demo.addEventListener('submit', updateDemo);
demoCountry.addEventListener('change',()=>{document.querySelector('#demo-city').value='';updateCitySuggestions();});
document.querySelector('#component-demo').addEventListener('toggle',event=>{if(event.target.open && !demoRequest) updateDemo();});
updateCitySuggestions();
