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

@Component({
  selector: 'flr-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../overlay/cdk-overlay.css', './drawer.component.css'],
  imports: [A11yModule],
  templateUrl: './drawer.component.html',
})
export class DrawerComponent implements OnDestroy {
  readonly open = input(false);
  readonly side = input<DrawerSide>('right');
  readonly title = input<string | null>(null);
  readonly size = input<DrawerSize>('md');
  readonly dismissOnBackdrop = input(true);
  readonly closeLabel = input<string | null>(null);

  readonly closed = output<void>();

  protected readonly titleId = `flr-drawer-${++drawerCounter}-title`;
  protected readonly width = computed(() => WIDTH[this.size()]);

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly panelTpl = viewChild<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;
  private leaving = false;

  constructor() {
    effect(() => {
      if (this.open()) this.attach();
      else this.leave();
    });
  }

  ngOnDestroy(): void {
    this.detach();
  }

  private attach(): void {
    if (this.leaving) this.setLeaving(false);
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

  private leave(): void {
    const panel = this.overlayRef?.overlayElement.querySelector('.flr-drawer__panel');
    if (!panel || this.leaving) return;
    this.setLeaving(true);
    const exits = panel.getAnimations().map((animation) => animation.finished);
    void Promise.allSettled(exits).then(() => {
      if (this.leaving) this.detach();
    });
  }

  private setLeaving(leaving: boolean): void {
    this.leaving = leaving;
    const overlayRef = this.overlayRef;
    overlayRef?.overlayElement
      .querySelector('.flr-drawer__panel')
      ?.classList.toggle('flr-drawer__panel--leaving', leaving);
    overlayRef?.backdropElement?.classList.toggle('flr-drawer-backdrop--leaving', leaving);
  }

  private detach(): void {
    this.leaving = false;
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
