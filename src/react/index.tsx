'use client';

import { useEffect, useState } from 'react';
import { createStampImage, stampSize, type StampImage, type StampOptions } from '@lucianopignotti/passport-stamps';

export interface PassportStampProps extends StampOptions {
  size?: number;
  alt?: string;
  className?: string;
}

/** Resolves a country or city stamp and optionally prints a calendar date inside it. */
export function PassportStamp({ country, city, strictCity = false, date, variant = 'worn', size = 240, alt, className }: PassportStampProps) {
  const key = JSON.stringify([country, city, strictCity, date, variant]);
  const [state, setState] = useState<{key: string; image?: StampImage; error?: string}>();
  useEffect(() => {
    let active = true;
    createStampImage({ country, city, strictCity, date, variant }).then(
      image => { if (active) setState({key, image}); },
      error => { if (active) setState({key, error: error instanceof Error ? error.message : 'Could not load stamp.'}); }
    );
    return () => { active = false; };
  }, [country, city, strictCity, date, variant, key]);
  const current = state?.key === key ? state : undefined;
  return <span className={className} style={{display: 'inline-block', width: stampSize(size), maxWidth: '100%', aspectRatio: '4 / 3'}} aria-busy={!current}>
    {current?.error ? <span role="alert">{current.error}</span> : current?.image ?
      <img src={current.image.src} alt={alt ?? current.image.alt} width={400} height={300} style={{display: 'block', width: '100%', height: 'auto'}} /> :
      <span role="status">Loading stamp…</span>}
  </span>;
}
