import { Component, inject, input, signal } from '@angular/core';
import { ButtonComponent, ToastContainerComponent, ToastService } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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

@Component({
  selector: 'flr-toast-undo-demo',
  imports: [ButtonComponent, ToastContainerComponent],
  template: `
    <div style="display:grid; gap:12px; justify-items:start; padding:16px">
      <flr-button variant="danger" (pressed)="remove()">Delete key</flr-button>
      <p style="margin:0; font-size:14px; color:var(--color-fg-2)">
        Deleted {{ deleted() }}, restored {{ restored() }}
      </p>
    </div>
    <flr-toast-container />
  `,
})
class ToastUndoDemoComponent {
  readonly duration = input(6000);

  protected readonly deleted = signal(0);
  protected readonly restored = signal(0);

  private readonly toasts = inject(ToastService);

  protected remove(): void {
    this.deleted.update((count) => count + 1);
    this.toasts.show({
      message: 'Deleted ferrfleet.triage.fingerprint',
      announcement: 'Deleted ferrfleet.triage.fingerprint. Press Control Z to undo.',
      duration: this.duration(),
      action: {
        label: 'Undo',
        shortcut: 'Ctrl+Z',
        run: () => this.restored.update((count) => count + 1),
      },
    });
  }
}

const meta: Meta = {
  title: 'Overlays/Toast',
  decorators: [moduleMetadata({ imports: [ToastDemoComponent, ToastUndoDemoComponent] })],
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<flr-toast-demo />` }),
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {};

export const WithAction: Story = {
  render: () => ({ template: `<flr-toast-undo-demo />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete key' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const undo = await canvas.findByRole('button', { name: /^Undo/ });
    const region = canvas.getByRole('region', { name: 'Notifications' });
    await expect(region).toContainElement(undo);
    await expect(
      region.parentElement?.querySelector(
        '[role="status"], [role="alert"], [role="log"], [aria-live]',
      ),
    ).toBeNull();

    undo.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('button', { name: /^Undo/ })).toBeNull());
    await expect(canvas.getByText('Deleted 1, restored 1')).toBeVisible();
    await expect(trigger).toHaveFocus();
  },
};

export const ActionPausesWhileFocused: Story = {
  render: () => ({ template: `<flr-toast-undo-demo [duration]="400" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete key' }));
    const undo = await canvas.findByRole('button', { name: /^Undo/ });
    undo.focus();
    await new Promise((resolve) => setTimeout(resolve, 900));
    await expect(undo).toBeVisible();

    undo.blur();
    await waitFor(() => expect(canvas.queryByRole('button', { name: /^Undo/ })).toBeNull());
    await expect(canvas.getByText('Deleted 1, restored 0')).toBeVisible();
  },
};

export const ActionNarrow: Story = {
  globals: { viewport: { value: 'phoneNarrow', isRotated: false } },
  render: () => ({ template: `<flr-toast-undo-demo [duration]="0" />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete key' }));
    const undo = await canvas.findByRole('button', { name: /^Undo/ });
    const toast = undo.closest<HTMLElement>('.flr-toast')!;
    await expect(toast.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
    await expect(toast.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

export const ReducedMotion: Story = {
  parameters: { emulate: { reducedMotion: true } },
  render: () => ({ template: `<flr-toast-undo-demo [duration]="0" />` }),
  play: async ({ canvasElement }) => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete key' }));
    const undo = await canvas.findByRole('button', { name: /^Undo/ });
    const toast = undo.closest<HTMLElement>('.flr-toast')!;
    await expect(getComputedStyle(toast).animationName).toMatch(/flr-toast-fade$/);
    await expect(getComputedStyle(undo).transitionDuration).toBe('0s');
  },
};
