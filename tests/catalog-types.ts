import { getCities, getCountries, resolveStamp } from '@lucianopignotti/passport-stamps';
import type { CountryCode, DestinationId, StampId } from '@lucianopignotti/passport-stamps';

const country: CountryCode = 'AR';
const city: DestinationId = 'ar-mendoza';
const id: StampId = city;
const listedCode: CountryCode = getCountries()[0].code;
const listedId: StampId = getCities(country)[0].id;
resolveStamp({ country: 'Argentina', city: 'Mendoza' });
resolveStamp({ country: listedCode, city: listedId });
resolveStamp({ country, city: id });
// @ts-expect-error Unknown country code.
const unknownCountry: CountryCode = 'ZZ';
// @ts-expect-error A country ID is not a destination ID.
const countryAsCity: DestinationId = 'ar';
// @ts-expect-error Unknown stamp ID.
const unknownId: StampId = 'ar-unknown-city';
