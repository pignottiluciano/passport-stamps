// Shared deterministic ink treatments. No raster textures or external resources.
export const styles = [
  {key:'stamped', label:'Stamped', frequency:'.67', slope:'10', intercept:'-2.4', pressure:'.013 .021', pressureSlope:'1', pressureIntercept:'.5', displacement:'.85', blur:'.17'},
  {key:'worn', label:'Worn', frequency:'.5', slope:'10', intercept:'-3.3', pressure:'.019 .027', pressureSlope:'1.8', pressureIntercept:'-.05', displacement:'1.15', blur:'.12'}
];
export function finish(svg, country, s) {
  const id = `ink-${(country.id ?? country.code.toLowerCase())}-${s.key}`;
  // Local ink density at two scales: fine paper grain + broad pressure variation.
  // Grain modulates alpha only; the paper remains completely transparent.
  const defs = `<defs><filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${s.frequency}" numOctaves="3" seed="17" result="grain"/><feColorMatrix in="grain" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 0 0 0 0"/><feComponentTransfer><feFuncA type="linear" slope="${s.slope}" intercept="${s.intercept}"/></feComponentTransfer><feComposite in="SourceGraphic" operator="in" result="porous"/><feTurbulence type="fractalNoise" baseFrequency="${s.pressure}" numOctaves="2" seed="41" result="pressure"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 0 0 0 0"/><feComponentTransfer><feFuncA type="linear" slope="${s.pressureSlope}" intercept="${s.pressureIntercept}"/></feComponentTransfer><feComposite in="porous" operator="in" result="ink"/><feDisplacementMap in="ink" in2="pressure" scale="${s.displacement}" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="${s.blur}"/></filter></defs>`;
  if (!svg.includes('<g color=')) throw Error(`Unknown SVG structure: ${country.code}`);
  return svg.replace('<g color=', `${defs}<g filter="url(#${id})" color=`);
}
