import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type AvatarShape = 'circle' | 'square';

const SIZE_MAP: Record<Exclude<AvatarSize, number>, number> = {
  xs: 20,
  sm: 24,
  md: 28,
  lg: 40,
  xl: 56,
};

@Component({
  selector: 'flr-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && !errored()) {
      <img
        class="flr-avatar__img"
        [src]="src()"
        [alt]="alt() ?? name()"
        [title]="name()"
        [style.width.px]="px()"
        [style.height.px]="px()"
        [style.border-radius.px]="radius()"
        (error)="errored.set(true)"
      />
    } @else {
      <span
        class="flr-avatar__fallback"
        role="img"
        [attr.aria-label]="alt() ?? name()"
        [title]="name()"
        [style.width.px]="px()"
        [style.height.px]="px()"
        [style.border-radius.px]="radius()"
        [style.background]="accent() ?? 'var(--color-avatar-bg, var(--color-ink-2, #475569))'"
        [style.font-size.px]="px() * 0.4"
      >
        {{ initials() }}
      </span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
    }
    .flr-avatar__img {
      display: block;
      object-fit: cover;
    }
    .flr-avatar__fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-weight: 500;
      user-select: none;
    }
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly src = input<string | null>(null);
  readonly accent = input<string | null>(null);
  readonly size = input<AvatarSize>(28);
  readonly shape = input<AvatarShape>('circle');
  readonly alt = input<string | null>(null);

  protected readonly errored = signal(false);

  protected readonly px = computed(() => {
    const s = this.size();
    return typeof s === 'number' ? s : SIZE_MAP[s];
  });

  protected readonly radius = computed(() =>
    this.shape() === 'circle' ? this.px() / 2 : Math.max(4, this.px() * 0.18),
  );

  protected readonly initials = computed(
    () =>
      this.name()
        .split(' ')
        .map((s) => s[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || '?',
  );
}
