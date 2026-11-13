import {afterEach,describe,it,expect} from 'vitest';
import {waitFor} from '@testing-library/react';
import {definePassportStamp} from '@lucianopignotti/passport-stamps/element';

definePassportStamp('test-passport-stamp');
const mount = (attributes: Record<string, string>) => {
  const element = document.createElement('test-passport-stamp');
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  document.body.append(element);
  return element;
};

describe('passport stamp custom element',()=>{
  afterEach(()=>document.body.replaceChildren());
  it('renders, follows attribute changes and prints the date inside the SVG',async()=>{
    const element = mount({country: 'AR'});
    await waitFor(()=>expect(element.querySelector('img')?.alt).toContain('Argentina'));
    expect(element.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    element.setAttribute('city', 'Mendoza');
    element.setAttribute('date', '2026-11-07');
    element.setAttribute('variant', 'clean');
    element.setAttribute('size', '320');
    await waitFor(()=>expect(element.querySelector('img')?.alt).toContain('07 NOV 2026'));
    const img = element.querySelector('img')!;
    expect(decodeURIComponent(img.src)).toContain('>07 NOV 2026</text>');
    expect(decodeURIComponent(img.src)).not.toContain('<filter');
    expect(element.style.width).toBe('320px');
    expect(element.hasAttribute('aria-busy')).toBe(false);
  });
  it('shows errors and recovers when the attribute is corrected',async()=>{
    const element = mount({country: 'FR', city: 'Mendoza', 'strict-city': ''});
    await waitFor(()=>expect(element.querySelector('[role="alert"]')?.textContent).toContain('Unknown city in France'));
    element.removeAttribute('strict-city');
    await waitFor(()=>expect(element.querySelector('img')?.alt).toContain('France'));
    element.setAttribute('size', '-1');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('size must be');
    element.setAttribute('size', '200');
    await waitFor(()=>expect(element.querySelector('img')).not.toBeNull());
  });
  it('allows registration under several tags',()=>{
    definePassportStamp('test-passport-stamp');
    definePassportStamp('other-passport-stamp');
    expect(customElements.get('other-passport-stamp')).toBeDefined();
  });
  it('keeps random ink across attribute updates and explicit overrides', async () => {
    const element = mount({ country: 'AR', 'random-color': '' });
    const ink = () => decodeURIComponent(element.querySelector('img')?.src ?? '').match(/<g[^>]* color="([^"]+)"/)?.[1];
    await waitFor(() => expect(ink()).toMatch(/^#[0-9a-f]{6}$/i));
    const original = ink();
    element.setAttribute('country', 'FR');
    await waitFor(() => expect(element.querySelector('img')?.alt).toContain('France'));
    expect(ink()).toBe(original);
    element.setAttribute('color', '#123456');
    await waitFor(() => expect(ink()).toBe('#123456'));
    element.removeAttribute('color');
    await waitFor(() => expect(ink()).toBe(original));
  });

});
