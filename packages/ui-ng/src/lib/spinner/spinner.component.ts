import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
export type SpinnerColor = 'accent' | 'current' | 'slate';

const SIZE: Record<SpinnerSize, { box: string; border: string }> = {
  xs: { box: '12px', border: '1.5px' },
  sm: { box: '16px', border: '2px' },
  md: { box: '20px', border: '2px' },
  lg: { box: '28px', border: '3px' },
};

/**
 * Indeterminate loading ring — Angular 22 port of `@ferrlabs/ui-react`'s
 * Spinner. `accent` reads `--color-accent`; `current` inherits text colour.
 */
@Component({
  selector: 'flr-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="flr-spinner" role="status" [attr.aria-label]="label()" [style]="styles()"></span>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-spinner {
      display: inline-block;
      border-radius: 999px;
      border-style: solid;
      animation: flr-spinner-rotate 0.8s linear infinite;
    }
    @keyframes flr-spinner-rotate {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly color = input<SpinnerColor>('accent');
  readonly label = input('Loading…');

  protected readonly styles = computed<Record<string, string>>(() => {
    const dim = SIZE[this.size()];
    const ring =
      this.color() === 'accent'
        ? 'var(--color-accent, #e8733a)'
        : this.color() === 'current'
          ? 'currentColor'
          : 'var(--color-ink-3, #64748b)';
    return {
      width: dim.box,
      height: dim.box,
      'border-width': dim.border,
      'border-color': ring,
      'border-right-color': 'transparent',
    };
  });
}
