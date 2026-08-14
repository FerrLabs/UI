import { ContainerComponent, DividerComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta = {
  title: 'Primitives/Layout',
  decorators: [moduleMetadata({ imports: [ContainerComponent, DividerComponent] })],
};

export default meta;
type Story = StoryObj;

export const Container: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:12px">
        @for (size of ['sm', 'md', 'lg', 'xl']; track size) {
          <flr-container [size]="size" padding="sm">
            <div class="mono" style="background:var(--color-paper-2); border:1px solid var(--color-rule); border-radius:8px; padding:10px; font-size:11px">
              size={{ size }}
            </div>
          </flr-container>
        }
      </div>`,
  }),
};

export const Divider: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:20px; max-width:420px">
        <flr-divider />
        <flr-divider label="or" />
        <div style="display:flex; align-items:center; gap:16px; height:40px">
          <span>Left</span>
          <flr-divider orientation="vertical" />
          <span>Right</span>
        </div>
      </div>`,
  }),
};
