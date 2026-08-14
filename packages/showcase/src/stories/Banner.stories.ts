import { BannerComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<BannerComponent> = {
  title: 'Primitives/Banner',
  component: BannerComponent,
  decorators: [moduleMetadata({ imports: [BannerComponent] })],
  args: { variant: 'info', title: 'Rotation scheduled', dismissible: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <flr-banner [variant]="variant" [title]="title" [dismissible]="dismissible">
        The production signing key rotates on Friday at 02:00 UTC.
      </flr-banner>`,
  }),
};

export default meta;
type Story = StoryObj<BannerComponent>;

export const Info: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:grid; gap:12px">
        <flr-banner variant="info" title="Heads up">Scheduled maintenance on Friday.</flr-banner>
        <flr-banner variant="success" title="Deployed">v4.2.0 is live on all regions.</flr-banner>
        <flr-banner variant="warning" title="Quota at 85%">Runs reset on the 1st.</flr-banner>
        <flr-banner variant="danger" title="Sync failed">Three secrets could not be written.</flr-banner>
      </div>`,
  }),
};

export const Dismissible: Story = { args: { dismissible: true, variant: 'warning' } };
