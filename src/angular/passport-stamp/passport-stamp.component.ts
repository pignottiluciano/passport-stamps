import { ChangeDetectionStrategy, Component, computed, input, resource } from '@angular/core';
import { createStampImage, getStampSizeError, type StampDateFormat, type StampVariant } from '@lucianopignotti/passport-stamps';

/** Displays a country or destination stamp with an optional date integrated into the artwork. */
@Component({
  selector: 'passport-stamp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passport-stamp.component.html',
  styleUrl: './passport-stamp.component.scss',
  host: { '[style.width.px]': 'width()', '[attr.aria-busy]': '!errorMessage() && image.isLoading()' }
})
export class PassportStampComponent {
  readonly country = input.required<string>();
  readonly city = input<string>();
  readonly strictCity = input(false);
  readonly date = input<string>();
  readonly dateFormat = input<StampDateFormat>('text');
  readonly assetBaseUrl = input<string>();
  readonly variant = input<StampVariant>('worn');
  readonly size = input(240);
  readonly alt = input<string>();
  /** Native image loading. Use eager for a stamp that is visible on first paint. */
  readonly loading = input<'lazy' | 'eager'>('lazy');
  private readonly sizeError = computed(() => getStampSizeError(this.size()));
  protected readonly width = computed(() => this.sizeError() ? 240 : this.size());
  protected readonly image = resource({
    params: () => ({ country: this.country(), city: this.city(), strictCity: this.strictCity(), date: this.date(), dateFormat: this.dateFormat(), assetBaseUrl: this.assetBaseUrl(), variant: this.variant() }),
    loader: ({params}) => createStampImage(params)
  });
  protected readonly errorMessage = computed(() => {
    const error = this.sizeError() ?? this.image.error();
    if (error === undefined) return undefined;
    return error instanceof Error ? error.message : 'Could not load stamp.';
  });
}
