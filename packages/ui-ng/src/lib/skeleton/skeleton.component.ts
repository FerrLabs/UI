import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonShape = 'rect' | 'text' | 'circle';

const RADIUS: Record<SkeletonShape, string> = {
  rect: '8px',
  text: '4px',
  circle: '999px',
};

function toLength(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

@Component({
  selector: 'flr-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="flr-skeleton" aria-hidden="true" [style]="styles()"></div> `,
  styles: `
    :host {
      display: contents;
    }
    .flr-skeleton {
      display: inline-block;
      background: linear-gradient(
        90deg,
        var(--color-rule, rgba(30, 41, 59, 0.14)) 0%,
        var(--color-rule-strong, rgba(30, 41, 59, 0.28)) 50%,
        var(--color-rule, rgba(30, 41, 59, 0.14)) 100%
      );
      background-size: 200% 100%;
      animation: flr-skeleton-shine 1.6s linear infinite;
    }
    @keyframes flr-skeleton-shine {
      from {
        background-position: 200% 0;
      }
      to {
        background-position: -200% 0;
      }
    }
  `,
})
export class SkeletonComponent {
  readonly shape = input<SkeletonShape>('rect');
  readonly width = input<string | number | null>(null);
  readonly height = input<string | number | null>(null);

  protected readonly styles = computed<Record<string, string>>(() => {
    const shape = this.shape();
    const w = this.width();
    const h = this.height();
    return {
      'border-radius': RADIUS[shape],
      width: w != null ? toLength(w) : shape === 'circle' ? '32px' : '100%',
      height:
        h != null ? toLength(h) : shape === 'circle' ? '32px' : shape === 'text' ? '12px' : '16px',
    };
  });
}
