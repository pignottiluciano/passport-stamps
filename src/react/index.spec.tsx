import {afterEach,describe,it,expect} from 'vitest';
import {cleanup,render,screen,waitFor} from '@testing-library/react';
import {PassportStamp} from '@lucianopignotti/passport-stamps/react';

describe('React PassportStamp',()=>{
  afterEach(cleanup);
  it('reacts to property changes and renders a date inside the SVG',async()=>{
    const {rerender}=render(<PassportStamp country="AR" />);
    await screen.findByRole('img',{name:/Argentina/});
    rerender(<PassportStamp country="AR" city="Mendoza" date="2026-11-07" variant="clean" size={320} />);
    const img=await screen.findByRole('img',{name:/Mendoza.*07 NOV 2026/}) as HTMLImageElement;
    expect(decodeURIComponent(img.src)).toContain('>07 NOV 2026</text>');
    expect(decodeURIComponent(img.src)).not.toContain('<filter');
    expect(img.parentElement?.style.width).toBe('320px');
    rerender(<PassportStamp country="AR" city="Mendoza" date="2026-11-07" dateFormat="numeric" variant="clean" size={320} />);
    await screen.findByRole('img', { name: /Mendoza.*07\/11\/2026/ });
  });
  it('falls back to a country for unknown cities and exposes invalid dates',async()=>{
    const {rerender}=render(<PassportStamp country="FR" city="Unknown city" />);
    await screen.findByRole('img',{name:/France/});
    rerender(<PassportStamp country="FR" date="2026-02-30" />);
    await waitFor(()=>expect(screen.getByRole('alert').textContent).toContain('valid calendar date'));
  });
  it('applies strict city matching when the prop changes', async () => {
    const { rerender } = render(<PassportStamp country="FR" city="Mendoza" />);
    await screen.findByRole('img', { name: /France/ });
    rerender(<PassportStamp country="FR" city="Mendoza" strictCity />);
    expect((await screen.findByRole('alert')).textContent).toContain('Unknown city in France: Mendoza');
  });
  it('shows an accessible size error and recovers with the latest properties', async () => {
    const { rerender } = render(<PassportStamp country="AR" />);
    await screen.findByRole('img', { name: /Argentina/ });
    rerender(<PassportStamp country="FR" size={-1} />);
    expect(screen.getByRole('alert').textContent).toContain('positive finite number');
    expect(screen.queryByRole('img')).toBeNull();
    rerender(<PassportStamp country="ES" size={320} />);
    const image = await screen.findByRole('img', { name: /Spain/ });
    expect(image.parentElement?.style.width).toBe('320px');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('renders a hosted undated stamp without a data URL', async () => {
    render(<PassportStamp country="AR" city="Mendoza" assetBaseUrl="/travel/assets" variant="clean" />);
    const img = await screen.findByRole('img', { name: /Mendoza/ });
    expect(img.getAttribute('src')).toBe('/travel/assets/svg/clean/ar-mendoza.svg');
  });
});
