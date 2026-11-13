const pageWidth = 800;
const pageHeight = 1000;
const rotations = [-7, 5, -4, 6, -5, 3];

export function composePassportPage(stamps: readonly string[]): string {
  const rows = Math.ceil(stamps.length / 2);
  const rowGap = rows === 3 ? 253 : 325;
  const scale = stamps.length === 1 ? 1.28 : 0.79;
  const descriptions: string[] = [];

  const artwork = stamps.map((svg, index) => {
    const row = Math.floor(index / 2);
    const isSingleInRow = stamps.length % 2 === 1 && index === stamps.length - 1;
    const x = isSingleInRow ? 400 : index % 2 === 0 ? 218 : 582;
    const y = 535 + (row - (rows - 1) / 2) * rowGap;
    const angle = rotations[index];
    // Stamp titles already contain XML-escaped catalog names and validated dates.
    const title = svg.match(/<title [^>]+>([^<]*)<\/title>/)?.[1];
    if (title) descriptions.push(title);
    // The renderer owns this markup. Scope every ID and its generated references
    // before embedding it so repeated stamps cannot pick up each other's filters.
    const scoped = svg.trimEnd().replace(
      /(\bid="|\baria-labelledby="|url\(#)([^")]+)/g,
      (_match, prefix, id) => `${prefix}stamp-${index + 1}-${id}`
    );
    return `  <g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale}) translate(-200 -150)">${scoped}</g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}" role="img" aria-labelledby="passport-page-title" aria-describedby="passport-page-description">
  <title id="passport-page-title">Passport stamp page</title>
  <desc id="passport-page-description">${descriptions.join('; ')}.</desc>
  <rect width="${pageWidth}" height="${pageHeight}" fill="#f7edda"/>
  <rect x="24" y="24" width="752" height="952" rx="18" fill="none" stroke="#c2ac87" stroke-width="2"/>
  <rect x="34" y="34" width="732" height="932" rx="12" fill="none" stroke="#d8c7a8"/>
  <path d="M92 120H708M92 932H708" stroke="#c2ac87"/>
  <text x="400" y="96" text-anchor="middle" fill="#584934" font-family="Georgia,serif" font-size="24" letter-spacing="6">PASSPORT STAMPS</text>
  <path d="M400 940l7 7-7 7-7-7Z" fill="#c2ac87"/>
${artwork.join('\n')}
</svg>
`;
}
