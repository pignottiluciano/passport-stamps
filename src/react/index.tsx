'use client';

import { useEffect, useState } from 'react';
import { createStampImage, getStampSizeError, type StampImage, type StampImageOptions } from '@lucianopignotti/passport-stamps';

export interface PassportStampProps extends StampImageOptions {
  size?: number;
  alt?: string;
  className?: string;
  /** Native image loading. Use eager for a stamp that is visible on first paint. */
  loading?: 'lazy' | 'eager';
}

/** Resolves a country or city stamp and optionally prints a calendar date inside it. */
export function PassportStamp({ country, city, strictCity = false, date, dateFormat, assetBaseUrl, variant = 'worn', size = 240, alt, className, loading = 'lazy' }: PassportStampProps) {
  const key = JSON.stringify([country, city, strictCity, date, dateFormat, assetBaseUrl, variant]);
  const [state, setState] = useState<{key: string; image?: StampImage; error?: string}>();
  useEffect(() => {
    let active = true;
    createStampImage({ country, city, strictCity, date, dateFormat, assetBaseUrl, variant }).then(
      image => { if (active) setState({key, image}); },
      error => { if (active) setState({key, error: error instanceof Error ? error.message : 'Could not load stamp.'}); }
    );
    return () => { active = false; };
  }, [country, city, strictCity, date, dateFormat, assetBaseUrl, variant, key]);
  const current = state?.key === key ? state : undefined;
  const sizeError = getStampSizeError(size);
  const error = sizeError?.message ?? current?.error;
  return (
    <span
      className={className}
      style={{ display: 'inline-block', width: sizeError ? 240 : size, maxWidth: '100%', aspectRatio: '4 / 3' }}
      aria-busy={!error && !current}
    >
      {error ? <span role="alert">{error}</span> : current?.image ? (
        <img
          src={current.image.src}
          alt={alt ?? current.image.alt}
          width={400}
          height={300}
          loading={loading}
          decoding="async"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      ) : <span role="status">Loading stamp…</span>}
    </span>
  );
}
