import { ChangeDetectionStrategy, Component, computed, input, resource } from '@angular/core';
import { createStampImage, stampSize, type StampVariant } from '@lucianopignotti/passport-stamps';

/** Displays a country or destination stamp with an optional date integrated into the artwork. */
@Component({
  selector: 'passport-stamp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passport-stamp.component.html',
  styleUrl: './passport-stamp.component.scss',
  host: { '[style.width.px]': 'width()', '[attr.aria-busy]': 'image.isLoading()' }
})
export class PassportStampComponent {
  readonly country = input.required<string>();
  readonly city = input<string>();
  readonly date = input<string>();
  readonly variant = input<StampVariant>('worn');
  readonly size = input(240);
  readonly alt = input<string>();
  protected readonly width = computed(() => stampSize(this.size()));
  protected readonly image = resource({
    params: () => ({ country: this.country(), city: this.city(), date: this.date(), variant: this.variant() }),
    loader: ({params}) => createStampImage(params)
  });
  protected readonly errorMessage = computed(() => {
    const error = this.image.error();
    return error instanceof Error ? error.message : 'Could not load stamp.';
  });
}
