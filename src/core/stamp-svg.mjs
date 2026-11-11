// Shared by the asset build and the runtime renderer, so both emit identical markup.
// Artwork modules store only what is unique to a stamp; this module adds the frame, header and date row.

/**
 * @typedef {object} StampArt
 * @property {string} c Ink color.
 * @property {string} s Frame shape: ticket, oval, round, square, hexagon or diamond.
 * @property {string} t Escaped title text before " passport stamp".
 * @property {string} b Undated composition.
 * @property {string} [d] Dated composition before scaling; omitted when it equals `b`.
 */

/** @type {Record<string, string>} */
export const frames = {
  ticket: '<rect x="24" y="47" width="352" height="206" rx="27" stroke-width="5"/><rect x="33" y="56" width="334" height="188" rx="19" stroke-width="1.6"/><path d="M43 67H357M43 233H357" stroke-dasharray="1 11" stroke-linecap="round" stroke-width="3"/>',
  oval: '<ellipse cx="200" cy="150" rx="179" ry="115" stroke-width="5"/><ellipse cx="200" cy="150" rx="170" ry="106" stroke-width="1.5"/><ellipse cx="200" cy="150" rx="160" ry="97" stroke-dasharray="12 8" stroke-width="1.3"/>',
  round: '<circle cx="200" cy="150" r="130" stroke-width="6"/><circle cx="200" cy="150" r="120" stroke-width="1.5"/><circle cx="200" cy="150" r="113" stroke-dasharray="2 7" stroke-width="1"/>',
  square: '<rect x="81" y="23" width="238" height="254" rx="9" stroke-width="5"/><rect x="90" y="32" width="220" height="236" rx="3" stroke-width="1.5"/><path d="M99 64V42H121M279 42H301V64M99 236V258H121M279 258H301V236" stroke-width="3"/>',
  hexagon: '<path d="M200 17L354 75V225L200 283L46 225V75Z" stroke-width="5"/><path d="M200 27L344 82V218L200 273L56 218V82Z" stroke-width="1.5"/>',
  diamond: '<path d="M184 19Q200 8 216 19L365 134Q384 150 365 166L216 281Q200 292 184 281L35 166Q16 150 35 134Z" stroke-width="5"/><path d="M188 28Q200 20 212 28L357 140Q369 150 357 160L212 272Q200 280 188 272L43 160Q31 150 43 140Z" stroke-width="1.3"/>'
};

export const DATE_PLACEHOLDER = '__PASSPORT_DATE__';
const dateRow = `<text x="200" y="235" font-size="16" font-family="Arial,Helvetica,sans-serif" font-weight="700" textLength="96" lengthAdjust="spacingAndGlyphs">${DATE_PLACEHOLDER}</text>`;

/**
 * Builds clean stamp markup. Dated output keeps the placeholder for the caller to replace.
 * @param {string} id
 * @param {StampArt} art
 * @param {boolean} [dated]
 */
export function assembleStamp(id, art, dated = false) {
  // The dated frame drops the lower dotted rule to make room for the date row.
  const frame = dated ? frames[art.s].replace('M43 67H357M43 233H357', 'M43 67H357') : frames[art.s];
  const body = dated ? `<g transform="translate(0 -2) scale(1 .9)">${art.d ?? art.b}</g>${dateRow}` : art.b;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300" role="img" aria-labelledby="title-${id}"><title id="title-${id}">${art.t} passport stamp${dated ? ', ' + DATE_PLACEHOLDER : ''}</title><g color="${art.c}" fill="currentColor" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><g fill="none" stroke="currentColor">${frame}</g>${body}</g></svg>\n`;
}
