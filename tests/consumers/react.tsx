import { PassportStamp } from '@lucianopignotti/passport-stamps/react';
import type { CountryCode, DestinationId } from '@lucianopignotti/passport-stamps';

export function StampConsumer() {
  const country: CountryCode = 'AR';
  const city: DestinationId = 'ar-mendoza';
  return <PassportStamp country={country} city={city} date="2026-11-07" strictCity />;
}
