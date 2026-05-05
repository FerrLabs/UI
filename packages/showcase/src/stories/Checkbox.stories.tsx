import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@ferrlabs/ui/primitives';

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  args: {
    label: 'Subscribe to release notes',
    disabled: false,
    invalid: false,
    indeterminate: false,
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const WithHint: Story = {
  args: {
    label: 'Send me product updates',
    hint: 'About one email per month. Unsubscribe anywhere.',
  },
};

export const Indeterminate: Story = {
  args: { label: 'Select all members', indeterminate: true },
};

export const Invalid: Story = { args: { invalid: true, label: 'Required field' } };

export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };

export const NoLabel: Story = { args: { label: undefined, defaultChecked: true } };

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="FerrFlow notifications" defaultChecked />
      <Checkbox label="FerrVault notifications" />
      <Checkbox label="FerrTrack notifications" defaultChecked />
      <Checkbox label="FerrGrowth notifications" />
      <Checkbox label="FerrFleet notifications" />
    </div>
  ),
};
