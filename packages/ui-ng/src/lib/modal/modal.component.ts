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

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const MAX_WIDTH: Record<ModalSize, number> = {
  sm: 384,
  md: 448,
  lg: 512,
  xl: 672,
};

let modalCounter = 0;

/**
 * Centred modal dialog — Angular 22 port of `@ferrlabs/ui-react`'s Modal,
 * built on `@angular/cdk` Overlay. Declarative `[open]` / `(closed)`; the body
 * is the default slot, the footer the `[modal-footer]` slot. Focus is trapped
 * (`cdkTrapFocus`), Escape and backdrop click emit `closed`, and page scroll is
 * blocked while open. Requires the host app to import
 * `@angular/cdk/overlay-prebuilt.css` once.
 */
@Component({
  selector: 'flr-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [A11yModule],
  template: `
    <ng-template #panel>
      <div
        class="flr-modal__panel"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title() ? titleId : null"
        [attr.aria-describedby]="description() ? descId : null"
        [style.max-width.px]="maxWidth()"
      >
        @if (title() || description()) {
          <div class="flr-modal__head">
            @if (title(); as t) {
              <h2 class="flr-modal__title" [id]="titleId">{{ t }}</h2>
            }
            @if (description(); as d) {
              <p class="flr-modal__desc" [id]="descId">{{ d }}</p>
            }
          </div>
        }
        <div class="flr-modal__body"><ng-content /></div>
        <div class="flr-modal__footer"><ng-content select="[modal-footer]" /></div>
      </div>
    </ng-template>
  `,
  styles: `
    .flr-modal-backdrop {
      background: rgba(30, 41, 59, 0.45);
      backdrop-filter: blur(2px);
    }
    .flr-modal__panel {
      width: calc(100vw - 2rem);
      background: var(--color-card, #fff);
      border-radius: 14px;
      box-shadow: 0 20px 48px rgba(15, 23, 42, 0.18);
      border: 1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1));
      overflow: hidden;
      outline: none;
      animation: flr-modal-in 160ms ease-out;
    }
    @keyframes flr-modal-in {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .flr-modal__head {
      padding: 24px 24px 12px;
    }
    .flr-modal__title {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-size: 18px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--color-ink, #1e293b);
      margin: 0;
    }
    .flr-modal__desc {
      margin: 4px 0 0;
      font-size: 14px;
      line-height: 1.5;
      color: var(--color-ink-3, #64748b);
    }
    .flr-modal__body {
      padding: 12px 24px;
      font-size: 14px;
      line-height: 1.5;
      color: var(--color-ink-2, #475569);
    }
    .flr-modal__body:empty {
      display: none;
    }
    .flr-modal__footer {
      padding: 16px 24px;
      background: var(--color-paper-2, #f3efe7);
      border-top: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    /* Consumers project their actions inside a div carrying the modal-footer
       attribute. Without this rule the footer's flex layout applies to that
       single wrapper, so the gap above governs nothing and the buttons sit
       flush against each other. display:contents promotes the wrapper's
       children to be the footer's own flex items, which is what the rules
       above already assume. Scoped to the slot attribute so a footer that
       projects buttons directly is unaffected. */
    .flr-modal__footer > [modal-footer] {
      display: contents;
    }
    .flr-modal__footer:empty {
      display: none;
    }
  `,
})
export class ModalComponent implements OnDestroy {
  readonly open = input(false);
  readonly title = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly size = input<ModalSize>('md');
  readonly dismissOnBackdrop = input(true);

  readonly closed = output<void>();

  protected readonly titleId = `flr-modal-${++modalCounter}-title`;
  protected readonly descId = `flr-modal-${modalCounter}-desc`;
  protected readonly maxWidth = computed(() => MAX_WIDTH[this.size()]);

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

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      hasBackdrop: true,
      backdropClass: 'flr-modal-backdrop',
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
