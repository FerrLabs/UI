import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface SizeDim {
  readonly padding: string;
  readonly fontSize: string;
  readonly gap: string;
  readonly radius: string;
}

const SIZE: Record<ButtonSize, SizeDim> = {
  sm: { padding: '5px 10px', fontSize: '11px', gap: '6px', radius: '6px' },
  md: { padding: '8px 14px', fontSize: '12px', gap: '8px', radius: '8px' },
  lg: { padding: '12px 20px', fontSize: '14px', gap: '10px', radius: '10px' },
};

const DANGER = '#dc2626';

/**
 * Editorial app button — Angular 22 port of `@ferrlabs/ui-react`'s Button.
 * Mono label, accent-filled (primary), ghost-bordered, or danger. Renders an
 * `<a>` when `href` is set, otherwise a `<button>`. Styling reads the shared
 * tokens from `@ferrlabs/ui-foundation` (`--color-accent`, `--color-fg`,
 * `--color-rule-strong`, `--font-mono`).
 */
@Component({
  selector: 'flr-button',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (href(); as link) {
      <a
        class="flr-btn"
        [href]="link"
        [attr.target]="target()"
        [attr.rel]="rel()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-disabled]="inactive() || null"
        [style]="styles()"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </a>
    } @else {
      <button
        class="flr-btn"
        [type]="type()"
        [disabled]="inactive()"
        [attr.aria-busy]="loading() || null"
        [attr.aria-label]="ariaLabel()"
        [style]="styles()"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </button>
    }

    <ng-template #body>
      @if (loading()) {
        <span
          class="flr-btn__spinner"
          aria-hidden="true"
          [style.width]="dim().fontSize"
          [style.height]="dim().fontSize"
        ></span>
      }
      <ng-content />
    </ng-template>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-btn {
      font-family: var(--font-mono);
      letter-spacing: 0.04em;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      cursor: pointer;
      transition: background 160ms ease-out, opacity 160ms, box-shadow 160ms;
    }
    .flr-btn:disabled,
    .flr-btn[aria-disabled='true'] {
      cursor: not-allowed;
      opacity: 0.55;
    }
    .flr-btn__spinner {
      border: 1.5px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: flr-btn-spin 700ms linear infinite;
    }
    @keyframes flr-btn-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  /** Hex accent override. Bg on `primary`/`danger`, text on `ghost`. */
  readonly accent = input<string | null>(null);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly href = input<string | null>(null);
  readonly target = input<string | null>(null);
  readonly rel = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly pressed = output<MouseEvent>();

  protected readonly inactive = computed(() => this.disabled() || this.loading());
  protected readonly dim = computed(() => SIZE[this.size()]);

  protected readonly styles = computed<Record<string, string | null>>(() => {
    const accent = this.accent();
    let bg: string;
    let fg: string;
    let border: string;
    switch (this.variant()) {
      case 'danger':
        bg = accent ?? DANGER;
        fg = '#fff';
        border = bg;
        break;
      case 'ghost':
        bg = 'transparent';
        fg = accent ?? 'var(--color-fg)';
        border = 'var(--color-rule-strong)';
        break;
      default:
        bg = accent ?? 'var(--color-accent, var(--color-fg))';
        fg = '#fff';
        border = bg;
    }
    const d = this.dim();
    return {
      display: this.fullWidth() ? 'flex' : 'inline-flex',
      width: this.fullWidth() ? '100%' : null,
      padding: d.padding,
      'border-radius': d.radius,
      'font-size': d.fontSize,
      gap: d.gap,
      border: `1px solid ${border}`,
      background: bg,
      color: fg,
    };
  });

  protected handleClick(event: MouseEvent): void {
    if (this.inactive()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.pressed.emit(event);
  }
}
