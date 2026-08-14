import { ButtonComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<ButtonComponent> = {
  title: 'Primitives/Button',
  component: ButtonComponent,
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  args: { variant: 'primary', size: 'md', loading: false, disabled: false, fullWidth: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => ({
    props: args,
    template: `<flr-button [variant]="variant" [size]="size" [loading]="loading" [disabled]="disabled" [fullWidth]="fullWidth">Deploy</flr-button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {};

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Danger: Story = { args: { variant: 'danger' } };

export const Loading: Story = { args: { loading: true } };

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; align-items:center; gap:12px">
        <flr-button size="sm">Small</flr-button>
        <flr-button size="md">Medium</flr-button>
        <flr-button size="lg">Large</flr-button>
      </div>`,
  }),
};

export const AsLink: Story = {
  render: () => ({
    template: `<flr-button href="https://ferrlabs.com" target="_blank" rel="noreferrer">Open ferrlabs.com</flr-button>`,
  }),
};
