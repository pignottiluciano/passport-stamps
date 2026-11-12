import { normalize } from './catalog-matching.mjs';
import { catalogWornStyle, finish } from './ink.mjs';
import { assembleStamp, DATE_PLACEHOLDER } from './stamp-svg.mjs';
import { createCatalogIndex, expandCatalog } from './catalog-index.js';
import { catalogRows } from './generated/catalog.js';
import { loaders } from './generated/loaders.js';
import type { CountryCode, StampId } from './generated/ids.js';

export type { CountryCode, StampId, DestinationId } from './generated/ids.js';

export type StampVariant = 'worn' | 'clean';
export type StampDateFormat = 'text' | 'numeric';
export interface StampOptions {
  /** ISO alpha-2 country code or a catalog country name. */
  country: string;
  /** City name, slug, alias, or full destination ID. Unknown cities use the country stamp. */
  city?: string;
  /** Reject an unknown city instead of using the country stamp. */
  strictCity?: boolean;
  /** Calendar date in YYYY-MM-DD format. No timezone conversion is performed. */
  date?: string;
  /** Controls the printed date. Defaults to text, for example 07 NOV 2026. */
  dateFormat?: StampDateFormat;
  variant?: StampVariant;
  /** Ink override as #RGB or #RRGGBB. Takes priority over randomColor. */
  color?: string;
  /** Pick an ink color per core call. Components retain their choice per instance. */
  randomColor?: boolean;
}
export interface StampImageOptions extends StampOptions {
  /** Directory containing the published svg/ folder, as a root-relative or HTTP(S) URL. */
  assetBaseUrl?: string;
}
export interface StampImage {
  id: string;
  src: string;
  alt: string;
  fallback: boolean;
}
export class PassportStampError extends Error {
  constructor(public readonly code: 'INVALID_COUNTRY' | 'INVALID_CITY' | 'INVALID_DATE' | 'INVALID_DATE_FORMAT' | 'INVALID_VARIANT' | 'INVALID_SIZE' | 'INVALID_ASSET_BASE_URL' | 'STATIC_DATE_UNSUPPORTED' | 'STATIC_COLOR_UNSUPPORTED' | 'INVALID_COLOR', message: string) {
    super(message);
    this.name = 'PassportStampError';
  }
}
/** Curated dark inks suitable for light paper backgrounds. */
export const stampInkColors: readonly string[] = Object.freeze([
  '#8b2252', '#24558a', '#286346', '#643c83', '#9a4132', '#292823'
]);

export function pickStampColor(): string {
  return stampInkColors[Math.floor(Math.random() * stampInkColors.length)]!;
}

function resolveColor(options: StampOptions): string | undefined {
  if (options.color === undefined) return options.randomColor ? pickStampColor() : undefined;
  if (typeof options.color !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(options.color)) {
    throw new PassportStampError('INVALID_COLOR', 'color must be a hexadecimal color in #RGB or #RRGGBB format.');
  }
  const color = options.color.toLowerCase();
  return color.length === 4 ? '#' + [...color.slice(1)].map(character => character.repeat(2)).join('') : color;
}

const catalog = expandCatalog(catalogRows);
const countries = catalog.filter(stamp => stamp.kind === 'country');
let catalogIndex: ReturnType<typeof createCatalogIndex> | undefined;
const getCatalogIndex = () => catalogIndex ??= createCatalogIndex(catalog);

export interface StampCatalogEntry {
  readonly id: StampId;
  readonly code: CountryCode;
  readonly name: string;
}

function findCountry(value: string) {
  const query = normalize(value);
  const country = getCatalogIndex().countries.get(query);
  if (!country) throw new PassportStampError('INVALID_COUNTRY', `Unknown country: ${value}`);
  return country;
}

function catalogEntries(stamps: readonly StampCatalogEntry[]): readonly StampCatalogEntry[] {
  return stamps.map(({ id, code, name }) => ({ id, code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en') || a.id.localeCompare(b.id, 'en'));
}

/** Lists countries in English display-name order without loading artwork. */
export function getCountries(): readonly StampCatalogEntry[] {
  return catalogEntries(countries);
}

/** Lists destinations for a country code, name, or alias without loading artwork. */
export function getCities(country: string): readonly StampCatalogEntry[] {
  const { code } = findCountry(country);
  return catalogEntries(catalog.filter(stamp => stamp.kind === 'destination' && stamp.code === code));
}

export function formatStampDate(value?: string, format: StampDateFormat = 'text'): string | undefined {
  if (format !== 'text' && format !== 'numeric') {
    throw new PassportStampError('INVALID_DATE_FORMAT', 'dateFormat must be text or numeric.');
  }
  if (value === undefined || value === '') return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new PassportStampError('INVALID_DATE', 'date must be a valid calendar date in YYYY-MM-DD format.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const days = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > (days[month - 1] ?? 0)) {
    throw new PassportStampError('INVALID_DATE', 'date must be a valid calendar date in YYYY-MM-DD format.');
  }
  if (format === 'numeric') return `${match[3]}/${match[2]}/${match[1]}`;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${match[3]} ${months[month - 1]} ${match[1]}`;
}

/** Returns a validation error that a component can display without throwing during rendering. */
export function getStampSizeError(value: number): PassportStampError | undefined {
  if (!Number.isFinite(value) || value <= 0) {
    return new PassportStampError('INVALID_SIZE', 'size must be a positive finite number of pixels.');
  }
  return undefined;
}

export function stampSize(value = 240): number {
  const error = getStampSizeError(value);
  if (error) throw error;
  return value;
}

export function resolveStamp(options: StampOptions) {
  const country = findCountry(options.country);
  const query = normalize(options.city ?? '');
  const city = query ? getCatalogIndex().destinations.get(country.code)?.get(query) : undefined;
  if (query && !city && options.strictCity) {
    throw new PassportStampError('INVALID_CITY', `Unknown city in ${country.name}: ${options.city}`);
  }
  const variant = options.variant ?? 'worn';
  if (variant !== 'worn' && variant !== 'clean') throw new PassportStampError('INVALID_VARIANT', 'variant must be worn or clean.');
  return { color: resolveColor(options), stamp: city ?? country, date: formatStampDate(options.date, options.dateFormat), variant, fallback: Boolean(query && !city) };
}

// Repeated stamps (lists, re-renders, React StrictMode) share one render, including requests in flight.
// ponytail: insertion-order LRU capped at 100 because dates are unbounded; raise the cap if long timelines miss.
const renderCache = new Map<string, Promise<string>>();
const renderCacheLimit = 100;

function renderStamp(resolved: ReturnType<typeof resolveStamp>): Promise<string> {
  const key = `${resolved.stamp.id}|${resolved.variant}|${resolved.date ?? ''}|${resolved.color ?? ''}`;
  let svg = renderCache.get(key);
  if (svg) renderCache.delete(key);
  else {
    svg = buildStamp(resolved);
    // A failed module load must not be cached, so a later request can retry it.
    svg.catch(() => { if (renderCache.get(key) === svg) renderCache.delete(key); });
  }
  renderCache.set(key, svg);
  if (renderCache.size > renderCacheLimit) renderCache.delete(renderCache.keys().next().value!);
  return svg;
}

async function buildStamp({ stamp, date, variant, color }: ReturnType<typeof resolveStamp>) {
  const load = loaders[stamp.id];
  if (!load) throw new PassportStampError('INVALID_COUNTRY', 'The requested artwork is unavailable.');
  const { art } = await load();
  const clean = assembleStamp(stamp.id, color ? { ...art, c: color } : art, Boolean(date));
  const svg = variant === 'worn' ? finish(clean, stamp, catalogWornStyle) : clean;
  return date ? svg.replaceAll(DATE_PLACEHOLDER, date) : svg;
}

/** Returns standalone SVG markup for saving or downloading a stamp. */
export async function createStampSvg(options: StampOptions): Promise<string> {
  return renderStamp(resolveStamp(options));
}

function hostedStampUrl(base: string, path: string): string {
  const rootRelative = base.startsWith('/') && !base.startsWith('//');
  const referenceOrigin = 'https://passport-stamps.invalid';
  const invalidBase = () => new PassportStampError(
    'INVALID_ASSET_BASE_URL',
    'assetBaseUrl must be a root-relative path or an HTTP(S) URL without credentials, query or fragment.'
  );
  let url: URL;
  try {
    url = new URL(base, referenceOrigin);
  } catch {
    throw invalidBase();
  }
  if ((!rootRelative && !/^https?:\/\//i.test(base)) || /[\\?#]/.test(base) ||
      url.username || url.password ||
      (rootRelative && (url.origin !== referenceOrigin || url.pathname.startsWith('//')))) {
    throw invalidBase();
  }
  url.pathname = url.pathname.replace(/\/+$/, '') + '/' + path;
  return rootRelative ? url.pathname : url.href;
}

/** Returns an SVG data URL or a hosted URL for an undated stamp. */
export async function createStampImage(options: StampImageOptions): Promise<StampImage> {
  const resolved = resolveStamp(options);
  const { stamp, date, variant, fallback } = resolved;
  let src: string;
  if (options.assetBaseUrl !== undefined) {
    if (date) throw new PassportStampError('STATIC_DATE_UNSUPPORTED', 'Hosted SVG files do not support a printed date.');
    if (resolved.color) throw new PassportStampError('STATIC_COLOR_UNSUPPORTED', 'Hosted SVG files do not support custom ink colors.');
    const file = variant === 'clean' ? `svg/clean/${stamp.id}.svg` : `svg/${stamp.id}.svg`;
    src = hostedStampUrl(options.assetBaseUrl, file);
  } else {
    const svg = await renderStamp(resolved);
    src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  return {
    id: stamp.id,
    src,
    alt: `${stamp.name} — ${stamp.iconLabel} passport stamp${date ? ', ' + date : ''}`,
    fallback
  };
}
