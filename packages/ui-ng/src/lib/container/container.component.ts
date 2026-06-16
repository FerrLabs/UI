import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

const MAX_WIDTH: Record<ContainerSize, string> = {
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1440px',
  '2xl': '1600px',
  full: '100%',
};

const PADDING: Record<ContainerPadding, string> = {
  none: '0',
  sm: '0 16px',
  md: '0 24px',
  lg: '0 40px',
};

/**
 * Centred max-width layout wrapper — Angular 22 port of
 * `@ferrlabs/ui-react`'s Container.
 */
@Component({
  selector: 'flr-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="flr-container" [style]="styles()"><ng-content /></div> `,
  styles: `
    :host {
      display: contents;
    }
    .flr-container {
      margin-left: auto;
      margin-right: auto;
      width: 100%;
    }
  `,
})
export class ContainerComponent {
  readonly size = input<ContainerSize>('lg');
  readonly padding = input<ContainerPadding>('md');

  protected readonly styles = computed<Record<string, string>>(() => ({
    'max-width': MAX_WIDTH[this.size()],
    padding: PADDING[this.padding()],
  }));
}
