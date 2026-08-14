import { ButtonComponent, DrawerComponent, ModalComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

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
