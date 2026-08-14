import { Component, inject } from '@angular/core';
import { ButtonComponent, ToastContainerComponent, ToastService } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

@Component({
  selector: 'flr-toast-demo',
  imports: [ButtonComponent, ToastContainerComponent],
  template: `
    <div style="display:flex; gap:8px; flex-wrap:wrap; padding:16px">
      <flr-button variant="ghost" (pressed)="fire('info')">Info</flr-button>
      <flr-button variant="ghost" (pressed)="fire('success')">Success</flr-button>
      <flr-button variant="ghost" (pressed)="fire('warning')">Warning</flr-button>
      <flr-button variant="danger" (pressed)="fire('error')">Error</flr-button>
    </div>
    <flr-toast-container />
  `,
})
class ToastDemoComponent {
  private readonly toasts = inject(ToastService);

  protected fire(variant: 'info' | 'success' | 'warning' | 'error'): void {
    this.toasts.show({
      variant,
      title: { info: 'Heads up', success: 'Deployed', warning: 'Quota', error: 'Sync failed' }[
        variant
      ],
      message: {
        info: 'The signing key rotates on Friday.',
        success: 'v4.2.0 is live on all regions.',
        warning: 'You have used 85% of this month’s runs.',
        error: 'Three secrets could not be written to the cluster.',
      }[variant],
      duration: 6000,
    });
  }
}

const meta: Meta = {
  title: 'Overlays/Toast',
  decorators: [moduleMetadata({ imports: [ToastDemoComponent] })],
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<flr-toast-demo />` }),
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {};
