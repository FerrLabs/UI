import { SiteCardComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<SiteCardComponent> = {
  title: 'Primitives/SiteCard',
  component: SiteCardComponent,
  decorators: [moduleMetadata({ imports: [SiteCardComponent] })],
  args: { label: 'ferrlabs.com', showChevron: true, interactive: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:420px">
        <flr-site-card [label]="label" [showChevron]="showChevron" [interactive]="interactive">
          <span site-card-eyebrow>Production</span>
          <div site-card-meta>12 pages · 8.4k visits / mo</div>
        </flr-site-card>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<SiteCardComponent>;

export const Default: Story = {};

export const Static: Story = { args: { interactive: false, showChevron: false } };

export const List: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:8px; max-width:420px">
        <flr-site-card label="ferrlabs.com"><span site-card-eyebrow>Production</span><div site-card-meta>12 pages</div></flr-site-card>
        <flr-site-card label="staging.ferrlabs.com"><span site-card-eyebrow>Staging</span><div site-card-meta>12 pages</div></flr-site-card>
        <flr-site-card label="preview.ferrlabs.com"><span site-card-eyebrow>Preview</span><div site-card-meta>3 pages</div></flr-site-card>
      </div>`,
  }),
};
