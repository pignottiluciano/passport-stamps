import { catalog } from './generated/catalog.js';
import { loaders } from './generated/loaders.js';

export type StampVariant = 'worn' | 'clean';
export interface StampOptions {
  /** ISO alpha-2 country code or a catalog country name. */
  country: string;
  /** City name, slug, alias, or full destination ID. Unknown cities use the country stamp. */
  city?: string;
  /** Reject an unknown city instead of using the country stamp. */
  strictCity?: boolean;
  /** Calendar date in YYYY-MM-DD format. No timezone conversion is performed. */
  date?: string;
  variant?: StampVariant;
}
export interface StampImage {
  id: string;
  src: string;
  alt: string;
  fallback: boolean;
}
export class PassportStampError extends Error {
  constructor(public readonly code: 'INVALID_COUNTRY' | 'INVALID_CITY' | 'INVALID_DATE' | 'INVALID_VARIANT' | 'INVALID_SIZE', message: string) {
    super(message);
    this.name = 'PassportStampError';
  }
}
const normalize = (value: string): string => value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const countries = catalog.filter(stamp => stamp.kind === 'country');
const matches = (value: string, names: readonly string[]): boolean => names.some(name => normalize(name) === value);

export interface StampCatalogEntry {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

function findCountry(value: string) {
  const query = normalize(value);
  const country = countries.find(stamp => matches(query, [stamp.id, stamp.code, stamp.name, ...stamp.aliases]));
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

export function formatStampDate(value?: string): string | undefined {
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
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${match[3]} ${months[month - 1]} ${match[1]}`;
}

export function stampSize(value = 240): number {
  if (!Number.isFinite(value) || value <= 0) throw new PassportStampError('INVALID_SIZE', 'size must be a positive finite number of pixels.');
  return value;
}

export function resolveStamp(options: StampOptions) {
  const country = findCountry(options.country);
  const query = normalize(options.city ?? '');
  const city = query ? catalog.find(stamp => stamp.kind === 'destination' && stamp.code === country.code &&
    matches(query, [stamp.id, stamp.id.slice(3), stamp.name, stamp.label, ...stamp.aliases])) : undefined;
  if (query && !city && options.strictCity) {
    throw new PassportStampError('INVALID_CITY', `Unknown city in ${country.name}: ${options.city}`);
  }
  const variant = options.variant ?? 'worn';
  if (variant !== 'worn' && variant !== 'clean') throw new PassportStampError('INVALID_VARIANT', 'variant must be worn or clean.');
  return { stamp: city ?? country, date: formatStampDate(options.date), variant, fallback: Boolean(query && !city) };
}

/** Loads one design on demand and returns an isolated SVG data URL suitable for an img element. */
export async function createStampImage(options: StampOptions): Promise<StampImage> {
  const { stamp, date, variant, fallback } = resolveStamp(options);
  const load = loaders[stamp.id];
  if (!load) throw new PassportStampError('INVALID_COUNTRY', 'The requested artwork is unavailable.');
  const { artwork } = await load();
  const template = date ? (variant === 'worn' ? artwork.datedWorn : artwork.datedClean) : artwork[variant];
  const svg = date ? template.replaceAll('__PASSPORT_DATE__', date) : template;
  return {
    id: stamp.id,
    src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
    alt: `${stamp.name} — ${stamp.iconLabel} passport stamp${date ? ', ' + date : ''}`,
    fallback
  };
}
