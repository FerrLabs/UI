import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export type DrawerSide = 'left' | 'right';
export type DrawerSize = 'sm' | 'md' | 'lg';

const WIDTH: Record<DrawerSize, number> = {
  sm: 288,
  md: 384,
  lg: 448,
};

let drawerCounter = 0;

/**
 * Edge drawer / side sheet — Angular 22 port of `@ferrlabs/ui-react`'s Drawer,
 * built on `@angular/cdk` Overlay. Slides in from `left` or `right`, traps
 * focus, blocks scroll, and emits `closed` on Escape or backdrop click. Body is
 * the default slot, footer the `[drawer-footer]` slot. The overlay container
 * styles ship with the component, so the host app has nothing to import.
 */
@Component({
  selector: 'flr-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../overlay/cdk-overlay.css'],
  imports: [A11yModule],
  template: `
    <ng-template #panel>
      <div
        class="flr-drawer__panel"
        [class.flr-drawer__panel--left]="side() === 'left'"
        [class.flr-drawer__panel--right]="side() === 'right'"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title() ? titleId : null"
        [style.width.px]="width()"
      >
        @if (title(); as t) {
          <div class="flr-drawer__head">
            <h2 class="flr-drawer__title" [id]="titleId">{{ t }}</h2>
          </div>
        }
        <div class="flr-drawer__body"><ng-content /></div>
        <div class="flr-drawer__footer"><ng-content select="[drawer-footer]" /></div>
      </div>
    </ng-template>
  `,
  styles: `
    .flr-drawer-backdrop {
      background: rgba(30, 41, 59, 0.45);
    }
    .flr-drawer__panel {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--color-card, #fff);
      box-shadow: 0 20px 48px rgba(15, 23, 42, 0.18);
    }
    .flr-drawer__panel--right {
      border-left: 1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1));
      animation: flr-drawer-in-right 200ms ease-out;
    }
    .flr-drawer__panel--left {
      border-right: 1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1));
      animation: flr-drawer-in-left 200ms ease-out;
    }
    @keyframes flr-drawer-in-right {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }
    @keyframes flr-drawer-in-left {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }
    .flr-drawer__head {
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
    }
    .flr-drawer__title {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--color-ink, #1e293b);
      margin: 0;
    }
    .flr-drawer__body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      font-size: 14px;
      line-height: 1.5;
      color: var(--color-ink-2, #475569);
    }
    .flr-drawer__footer {
      padding: 12px 20px;
      background: var(--color-paper-2, #f3efe7);
      border-top: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .flr-drawer__footer:empty {
      display: none;
    }
  `,
})
export class DrawerComponent implements OnDestroy {
  readonly open = input(false);
  readonly side = input<DrawerSide>('right');
  readonly title = input<string | null>(null);
  readonly size = input<DrawerSize>('md');
  readonly dismissOnBackdrop = input(true);

  readonly closed = output<void>();

  protected readonly titleId = `flr-drawer-${++drawerCounter}-title`;
  protected readonly width = computed(() => WIDTH[this.size()]);

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly panelTpl = viewChild<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  constructor() {
    effect(() => {
      if (this.open()) this.attach();
      else this.detach();
    });
  }

  ngOnDestroy(): void {
    this.detach();
  }

  private attach(): void {
    const tpl = this.panelTpl();
    if (this.overlayRef || !tpl) return;

    const position = this.overlay.position().global().top('0');
    if (this.side() === 'right') position.right('0');
    else position.left('0');

    const overlayRef = this.overlay.create({
      positionStrategy: position,
      hasBackdrop: true,
      backdropClass: 'flr-drawer-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });
    overlayRef.attach(new TemplatePortal(tpl, this.viewContainerRef));
    overlayRef.backdropClick().subscribe(() => {
      if (this.dismissOnBackdrop()) this.closed.emit();
    });
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closed.emit();
      }
    });
    this.overlayRef = overlayRef;
  }

  private detach(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
