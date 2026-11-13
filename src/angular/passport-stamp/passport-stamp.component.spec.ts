import {afterEach,describe,it,expect} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideZonelessChangeDetection} from '@angular/core';
import {PassportStampComponent} from '@lucianopignotti/passport-stamps/angular';

describe('Angular PassportStampComponent',()=>{
  afterEach(()=>TestBed.resetTestingModule());
  it('updates country, city, date, variant and size through inputs',async()=>{
    TestBed.configureTestingModule({imports:[PassportStampComponent],providers:[provideZonelessChangeDetection()]});
    const fixture=TestBed.createComponent(PassportStampComponent);
    fixture.componentRef.setInput('country','AR');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').alt).toContain('Argentina');
    fixture.componentRef.setInput('city','Mendoza');
    fixture.componentRef.setInput('date','2026-11-07');
    fixture.componentRef.setInput('variant','clean');
    fixture.componentRef.setInput('size',320);
    await fixture.whenStable();
    const img:HTMLImageElement=fixture.nativeElement.querySelector('img');
    expect(img.alt).toContain('Mendoza');
    expect(img.alt).toContain('07 NOV 2026');
    expect(decodeURIComponent(img.src)).toContain('>07 NOV 2026</text>');
    expect(decodeURIComponent(img.src)).not.toContain('<filter');
    expect(fixture.nativeElement.style.width).toBe('320px');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    fixture.componentRef.setInput('loading', 'eager');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('loading')).toBe('eager');
    fixture.componentRef.setInput('dateFormat', 'numeric');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').alt).toContain('07/11/2026');
  });
  it('shows errors and recovers when the invalid input is corrected',async()=>{
    TestBed.configureTestingModule({imports:[PassportStampComponent],providers:[provideZonelessChangeDetection()]});
    const fixture=TestBed.createComponent(PassportStampComponent);
    fixture.componentRef.setInput('country','INVALID');await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Unknown country');
    fixture.componentRef.setInput('country','FR');await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').alt).toContain('France');
  });
  it('applies strict city matching when the input changes', async () => {
    TestBed.configureTestingModule({ imports: [PassportStampComponent], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(PassportStampComponent);
    fixture.componentRef.setInput('country', 'FR');
    fixture.componentRef.setInput('city', 'Mendoza');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').alt).toContain('France');
    fixture.componentRef.setInput('strictCity', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Unknown city in France: Mendoza');
  });
  it('shows an accessible size error and recovers with the latest properties', async () => {
    TestBed.configureTestingModule({ imports: [PassportStampComponent], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(PassportStampComponent);
    fixture.componentRef.setInput('country', 'AR');
    await fixture.whenStable();
    fixture.componentRef.setInput('country', 'FR');
    fixture.componentRef.setInput('size', -1);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('positive finite number');
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    fixture.componentRef.setInput('country', 'ES');
    fixture.componentRef.setInput('size', 320);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').alt).toContain('Spain');
    expect(fixture.nativeElement.style.width).toBe('320px');
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeNull();
  });
  it('renders a hosted undated stamp without a data URL', async () => {
    TestBed.configureTestingModule({ imports: [PassportStampComponent], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(PassportStampComponent);
    fixture.componentRef.setInput('country', 'AR');
    fixture.componentRef.setInput('assetBaseUrl', '/travel/assets');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/travel/assets/svg/ar.svg');
  });
  it('keeps random ink across input updates and explicit overrides', async () => {
    TestBed.configureTestingModule({ imports: [PassportStampComponent], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(PassportStampComponent);
    const ink = () => decodeURIComponent(fixture.nativeElement.querySelector('img').src).match(/<g[^>]* color="([^"]+)"/)?.[1];
    fixture.componentRef.setInput('country', 'AR');
    fixture.componentRef.setInput('randomColor', true);
    await fixture.whenStable();
    const original = ink();
    expect(original).toMatch(/^#[0-9a-f]{6}$/i);
    fixture.componentRef.setInput('country', 'FR');
    await fixture.whenStable();
    expect(ink()).toBe(original);
    fixture.componentRef.setInput('color', '#123456');
    await fixture.whenStable();
    expect(ink()).toBe('#123456');
    fixture.componentRef.setInput('color', undefined);
    await fixture.whenStable();
    expect(ink()).toBe(original);
  });

});
