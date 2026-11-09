import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://consumer.test/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Node = dom.window.Node;

let image;
try {
  if (process.argv[2] === 'angular') {
    await import('@angular/compiler');
    const { TestBed } = await import('@angular/core/testing');
    const { provideZonelessChangeDetection } = await import('@angular/core');
    const { BrowserTestingModule, platformBrowserTesting } = await import('@angular/platform-browser/testing');
    const { StampConsumer } = await import('./dist/angular.js');
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
    TestBed.configureTestingModule({ imports: [StampConsumer], providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(StampConsumer);
    await fixture.whenStable();
    image = fixture.nativeElement.querySelector('img');
    fixture.destroy();
    TestBed.resetTestEnvironment();
  } else {
    const { createElement } = await import('react');
    const { render, cleanup } = await import('@testing-library/react');
    const { StampConsumer } = await import('./dist/react.js');
    const view = render(createElement(StampConsumer));
    image = await view.findByRole('img', { name: /Mendoza.*07 NOV 2026/ });
    cleanup();
  }
  assert.ok(image);
  assert.match(image.alt, /Mendoza.*07 NOV 2026/);
  assert.match(decodeURIComponent(image.getAttribute('src')), />07 NOV 2026<\/text>/);
} finally {
  dom.window.close();
}
