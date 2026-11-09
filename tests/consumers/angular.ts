import { Component } from '@angular/core';
import { PassportStampComponent } from '@lucianopignotti/passport-stamps/angular';
import type { CountryCode, DestinationId } from '@lucianopignotti/passport-stamps';

@Component({
  selector: 'stamp-consumer',
  imports: [PassportStampComponent],
  template: '<passport-stamp [country]="country" [city]="city" date="2026-11-07" [strictCity]="true" />'
})
export class StampConsumer {
  readonly country: CountryCode = 'AR';
  readonly city: DestinationId = 'ar-mendoza';
}
