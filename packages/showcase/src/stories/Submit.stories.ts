import { SubmitComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<SubmitComponent> = {
  title: 'Forms/Submit',
  component: SubmitComponent,
  decorators: [moduleMetadata({ imports: [SubmitComponent] })],
  args: { loading: false, disabled: false, fullWidth: false },
  render: (args) => ({
    props: args,
    template: `<flr-submit [loading]="loading" [disabled]="disabled" [fullWidth]="fullWidth">Create project</flr-submit>`,
  }),
};

export default meta;
type Story = StoryObj<SubmitComponent>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true } };

export const FullWidth: Story = { args: { fullWidth: true } };
