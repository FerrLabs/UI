import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@ferrlabs/ui-react/primitives';

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: {
    placeholder: 'Describe what changed…',
    rows: 4,
    invalid: false,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const Tall: Story = { args: { rows: 8 } };

export const Invalid: Story = {
  args: { invalid: true, defaultValue: 'Too short.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'This textarea is read-only.' },
};
