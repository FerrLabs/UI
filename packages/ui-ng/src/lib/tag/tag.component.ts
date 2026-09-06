import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type TagVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type TagSize = 'sm' | 'md';

const VARIANT_COLOR: Record<TagVariant, string> = {
  neutral: 'var(--color-fg-2, var(--color-ink-2, #475569))',
  accent: 'var(--color-accent, var(--accent, var(--color-ferrlabs-slate, #1e293b)))',
  success: 'var(--color-success, #10b981)',
  warning: 'var(--color-warning, #f59e0b)',
  danger: 'var(--color-danger, #dc2626)',
};

const VARIANT_TEXT: Record<TagVariant, string> = {
  neutral: VARIANT_COLOR.neutral,
  accent: VARIANT_COLOR.accent,
  success: 'var(--color-success-fg, #065f46)',
  warning: 'var(--color-warning-fg, #78350f)',
  danger: 'var(--color-danger-fg, #7f1d1d)',
};

const SIZE: Record<TagSize, { padding: string; fontSize: string; gap: string; dot: number }> = {
  sm: { padding: '2px 7px', fontSize: '9.5px', gap: '5px', dot: 4 },
  md: { padding: '3px 9px', fontSize: '10.5px', gap: '6px', dot: 5 },
};

@Component({
  selector: 'flr-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="flr-tag mono" [style]="styles()">
      @if (dot()) {
        <span class="flr-tag__dot" aria-hidden="true" [style]="dotStyles()"></span>
      }
      <ng-content select="[tag-icon]" />
      <ng-content />
      @if (removable()) {
        <button
          type="button"
          class="flr-tag__remove"
          aria-label="Remove"
          [style.width.px]="dim().dot * 2.4"
          [style.height.px]="dim().dot * 2.4"
          (click)="remove($event)"
        >
          <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
            <path
              d="m3 3 6 6M3 9 9 3"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      }
    </span>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-tag {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .flr-tag__dot {
      border-radius: 999px;
      flex-shrink: 0;
    }
    .flr-tag__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 0;
      opacity: 0.6;
    }
    .flr-tag__remove:hover {
      opacity: 1;
    }
  `,
})
export class TagComponent {
  readonly variant = input<TagVariant | null>(null);
  readonly color = input<string | null>(null);
  readonly soft = input(false);
  readonly dot = input(true);
  readonly size = input<TagSize>('md');
  readonly removable = input(false);

  readonly removed = output<void>();

  protected readonly dim = computed(() => SIZE[this.size()]);

  protected readonly resolvedColor = computed(() => {
    const explicit = this.color();
    if (explicit) return explicit;
    const variant = this.variant();
    return variant ? VARIANT_COLOR[variant] : VARIANT_COLOR.neutral;
  });

  protected readonly resolvedTextColor = computed(() => {
    const explicit = this.color();
    if (explicit) return explicit;
    const variant = this.variant();
    return variant ? VARIANT_TEXT[variant] : VARIANT_TEXT.neutral;
  });

  protected readonly styles = computed<Record<string, string>>(() => {
    const dim = this.dim();
    const c = this.resolvedColor();
    return {
      gap: dim.gap,
      padding: dim.padding,
      'font-size': dim.fontSize,
      background: this.soft() ? `color-mix(in oklab, ${c} 14%, transparent)` : 'transparent',
      border: this.soft() ? 'none' : '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
      color: this.resolvedTextColor(),
    };
  });

  protected readonly dotStyles = computed<Record<string, string>>(() => {
    const dim = this.dim();
    return { width: `${dim.dot}px`, height: `${dim.dot}px`, background: this.resolvedColor() };
  });

  protected remove(event: MouseEvent): void {
    event.stopPropagation();
    this.removed.emit();
  }
}
