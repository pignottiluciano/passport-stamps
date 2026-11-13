import { createStampImage, getStampSizeError, pickStampColor, type StampDateFormat, type StampVariant } from '@lucianopignotti/passport-stamps';

const observed = ['country', 'city', 'strict-city', 'date', 'date-format', 'asset-base-url', 'variant', 'color', 'random-color', 'size', 'alt', 'loading'];

/**
 * Framework-free stamp element for Vue, Svelte, Astro, plain HTML and other hosts.
 * Attributes mirror the React and Angular properties in kebab case, for example `date-format`.
 */
export class PassportStampElement extends HTMLElement {
  static readonly observedAttributes = observed;
  #request = 0;
  #randomInk?: string;

  connectedCallback(): void {
    void this.#render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) void this.#render();
  }

  async #render(): Promise<void> {
    const request = ++this.#request;
    const size = Number(this.getAttribute('size') ?? 240);
    const sizeError = getStampSizeError(size);
    Object.assign(this.style, { display: 'inline-block', width: `${sizeError ? 240 : size}px`, maxWidth: '100%', aspectRatio: '4 / 3' });
    if (sizeError) return this.#message('alert', sizeError.message);
    if (!this.querySelector('img')) this.#message('status', 'Loading stamp…');
    this.setAttribute('aria-busy', 'true');
    try {
      const image = await createStampImage({
        country: this.getAttribute('country') ?? '',
        city: this.getAttribute('city') ?? undefined,
        strictCity: this.hasAttribute('strict-city'),
        date: this.getAttribute('date') ?? undefined,
        dateFormat: (this.getAttribute('date-format') ?? 'text') as StampDateFormat,
        assetBaseUrl: this.getAttribute('asset-base-url') ?? undefined,
        variant: (this.getAttribute('variant') ?? 'worn') as StampVariant,
        color: this.getAttribute('color') ?? (this.hasAttribute('random-color') ? (this.#randomInk ??= pickStampColor()) : undefined)
      });
      if (request !== this.#request) return;
      const img = document.createElement('img');
      const attributes = { src: image.src, alt: this.getAttribute('alt') ?? image.alt, width: '400', height: '300', decoding: 'async',
        loading: this.getAttribute('loading') === 'eager' ? 'eager' : 'lazy' };
      for (const [name, value] of Object.entries(attributes)) img.setAttribute(name, value);
      img.style.cssText = 'display:block;width:100%;height:auto';
      this.replaceChildren(img);
    } catch (error) {
      if (request === this.#request) this.#message('alert', error instanceof Error ? error.message : 'Could not load stamp.');
    } finally {
      if (request === this.#request) this.removeAttribute('aria-busy');
    }
  }

  #message(role: 'alert' | 'status', text: string): void {
    const span = document.createElement('span');
    span.setAttribute('role', role);
    span.textContent = text;
    this.replaceChildren(span);
  }
}

/**
 * Registers the element. Pick another tag when `passport-stamp` is taken, for example by the Angular component.
 * Registration is explicit so importing the module has no side effects.
 */
export function definePassportStamp(tagName = 'passport-stamp'): void {
  if (!customElements.get(tagName)) customElements.define(tagName, class extends PassportStampElement {});
}
