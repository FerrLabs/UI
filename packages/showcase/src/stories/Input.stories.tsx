import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  args: {
    placeholder: 'Type something…',
    size: 'md',
    invalid: false,
    disabled: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    type: { control: 'inline-radio', options: ['text', 'email', 'password', 'url', 'tel'] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Email: Story = { args: { type: 'email', placeholder: 'ada@acme.com' } };

export const Password: Story = { args: { type: 'password', placeholder: '•••••••••••' } };

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'not-a-valid-email' },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'read-only' } };

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};
