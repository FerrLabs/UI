import { ButtonComponent, DrawerComponent, ModalComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta = {
  title: 'Overlays/Modal & Drawer',
  decorators: [moduleMetadata({ imports: [ModalComponent, DrawerComponent, ButtonComponent] })],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

export const Modal: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:24px">
        <flr-button (pressed)="open = true">Open modal</flr-button>
        <flr-modal
          [open]="open"
          title="Delete this vault?"
          description="312 secrets will be destroyed. This cannot be undone."
          (closed)="open = false"
        >
          <p style="margin:0; color:var(--color-fg-2)">
            Type the vault name to confirm deletion in the real flow — this story only shows the shell.
          </p>
          <div modal-footer style="display:flex; gap:8px; justify-content:flex-end">
            <flr-button variant="ghost" (pressed)="open = false">Cancel</flr-button>
            <flr-button variant="danger" (pressed)="open = false">Delete vault</flr-button>
          </div>
        </flr-modal>
      </div>`,
  }),
};

export const ModalSizes: Story = {
  render: () => ({
    props: { size: 'lg', open: true },
    template: `
      <div style="padding:24px">
        <flr-modal [open]="open" [size]="size" title="Large modal" (closed)="open = false">
          <p style="margin:0">size="{{ size }}"</p>
        </flr-modal>
      </div>`,
  }),
};

export const ModalTallContent: Story = {
  render: () => ({
    props: { open: true, rows: Array.from({ length: 40 }, (_, i) => i + 1) },
    template: `
      <div style="padding:24px">
        <flr-button (pressed)="open = true">Open modal</flr-button>
        <flr-modal
          [open]="open"
          title="New API token"
          description="The body scrolls while the header and the footer stay in view."
          (closed)="open = false"
        >
          <ul style="margin:0; padding:0; list-style:none; display:grid; gap:12px">
            @for (row of rows; track row) {
              <li><flr-button variant="ghost">Scope {{ row }}</flr-button></li>
            }
          </ul>
          <div modal-footer style="display:flex; gap:8px; justify-content:flex-end">
            <flr-button variant="ghost" (pressed)="open = false">Cancel</flr-button>
            <flr-button (pressed)="open = false">Create token</flr-button>
          </div>
        </flr-modal>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('dialog');
    const body = dialog.querySelector<HTMLElement>('.flr-modal__body')!;
    const submit = page.getByRole('button', { name: 'Create token' });
    await waitFor(() => expect(body.scrollHeight).toBeGreaterThan(body.clientHeight));
    expect(dialog.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    expect(submit.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    body.scrollTop = body.scrollHeight;
    expect(
      page.getByRole('button', { name: 'Scope 40' }).getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(submit.getBoundingClientRect().top);
  },
};

export const Drawer: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:24px">
        <flr-button (pressed)="open = true">Open drawer</flr-button>
        <flr-drawer [open]="open" side="right" title="Run details" (closed)="open = false">
          <dl style="margin:0; display:grid; grid-template-columns:auto 1fr; gap:8px 16px; font-size:13px">
            <dt style="color:var(--color-fg-3)">Agent</dt><dd style="margin:0">vault-rotator</dd>
            <dt style="color:var(--color-fg-3)">Duration</dt><dd style="margin:0">48s</dd>
            <dt style="color:var(--color-fg-3)">Exit</dt><dd style="margin:0">0</dd>
          </dl>
          <div drawer-footer style="display:flex; justify-content:flex-end">
            <flr-button variant="ghost" (pressed)="open = false">Close</flr-button>
          </div>
        </flr-drawer>
      </div>`,
  }),
};

export const DrawerLeft: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <div style="padding:24px">
        <flr-drawer [open]="open" side="left" size="sm" title="Filters" (closed)="open = false">
          <p style="margin:0; color:var(--color-fg-2)">side="left", size="sm"</p>
        </flr-drawer>
      </div>`,
  }),
};

const closableDrawer = `
  <div style="padding:24px">
    <flr-button (pressed)="open = true">Open drawer</flr-button>
    <flr-drawer
      [open]="open"
      size="lg"
      title="Metadata"
      closeLabel="Close"
      (closed)="open = false"
    >
      <dl style="margin:0; display:grid; gap:4px; font-size:13px">
        <dt style="color:var(--color-fg-3)">ferrfleet.triage.fingerprint</dt>
        <dd style="margin:0; overflow-wrap:anywhere">9f2c41d07ab35e6618c0d4f2b7a9e3105c8d6f4471b2a0e9</dd>
      </dl>
    </flr-drawer>
  </div>`;

async function openClosableDrawer(canvasElement: HTMLElement) {
  const page = within(canvasElement.ownerDocument.body);
  const opener = within(canvasElement).getByRole('button', { name: 'Open drawer' });
  opener.focus();
  await userEvent.keyboard('{Enter}');
  const dialog = await page.findByRole('dialog', { name: 'Metadata' });
  const close = within(dialog).getByRole('button', { name: 'Close' });
  await waitFor(() => expect(close).toHaveFocus());
  return { page, opener, dialog, close };
}

export const DrawerWithClose: Story = {
  render: () => ({ props: { open: false }, template: closableDrawer }),
  play: async ({ canvasElement }) => {
    const { page, opener, close } = await openClosableDrawer(canvasElement);
    await expect(close.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
    await expect(close.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(opener).toHaveFocus();

    const reopened = await openClosableDrawer(canvasElement);
    reopened.close.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true, cancelable: true }),
    );
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
    await expect(opener).toHaveFocus();
  },
};

export const DrawerNarrow: Story = {
  globals: { viewport: { value: 'phoneNarrow', isRotated: false } },
  render: () => ({ props: { open: false }, template: closableDrawer }),
  play: async ({ canvasElement }) => {
    const { dialog, close } = await openClosableDrawer(canvasElement);
    await waitFor(() => expect(dialog.getAnimations()).toHaveLength(0));
    const panel = dialog.getBoundingClientRect();
    await expect(panel.left).toBe(0);
    await expect(panel.width).toBe(window.innerWidth);
    await expect(panel.height).toBe(window.innerHeight);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    await expect(close).toBeVisible();
  },
};

export const DrawerExitAnimation: Story = {
  render: () => ({ props: { open: false }, template: closableDrawer }),
  play: async ({ canvasElement }) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { page, dialog, close } = await openClosableDrawer(canvasElement);
    await waitFor(() => expect(dialog.getAnimations()).toHaveLength(0));
    await userEvent.click(close);
    await waitFor(() =>
      expect(getComputedStyle(dialog).animationName).toBe('flr-drawer-out-right'),
    );
    await expect(dialog.isConnected).toBe(true);
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  },
};

export const DrawerReducedMotion: Story = {
  parameters: { emulate: { reducedMotion: true } },
  render: () => ({ props: { open: false }, template: closableDrawer }),
  play: async ({ canvasElement }) => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { page, dialog, close } = await openClosableDrawer(canvasElement);
    await expect(getComputedStyle(dialog).animationName).toBe('flr-drawer-fade-in');
    await expect(getComputedStyle(close).transitionDuration).toBe('0s');
    await userEvent.click(close);
    await waitFor(() => expect(getComputedStyle(dialog).animationName).toBe('flr-drawer-fade-out'));
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  },
};

export const ModalReducedMotion: Story = {
  ...Modal,
  parameters: { emulate: { reducedMotion: true } },
  play: async ({ canvasElement }) => {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await expect(getComputedStyle(dialog).animationName).toBe('flr-modal-fade');
  },
};
