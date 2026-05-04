import type { Meta, StoryObj } from '@storybook/react';
import { Field, Select } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Select> = {
  title: 'Forms/Select',
  component: Select,
  args: {
    size: 'md',
    invalid: false,
    disabled: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <option value="">Pick a product…</option>
      <option value="ferrflow">FerrFlow</option>
      <option value="ferrvault">FerrVault</option>
      <option value="ferrtrack">FerrTrack</option>
      <option value="ferrgrowth">FerrGrowth</option>
      <option value="ferrfleet">FerrFleet</option>
    </Select>
  ),
};

export const InsideField: Story = {
  render: (args) => (
    <Field label="Default product" hint="Used as the landing destination after sign-in.">
      {({ id, describedBy, invalid }) => (
        <Select id={id} aria-describedby={describedBy} invalid={invalid} {...args}>
          <option value="ferrflow">FerrFlow</option>
          <option value="ferrvault">FerrVault</option>
          <option value="ferrtrack">FerrTrack</option>
        </Select>
      )}
    </Field>
  ),
};

export const Invalid: Story = {
  args: { invalid: true },
  render: (args) => (
    <Select {...args}>
      <option value="">— No product —</option>
      <option value="ferrflow">FerrFlow</option>
    </Select>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Select {...args} defaultValue="ferrflow">
      <option value="ferrflow">FerrFlow</option>
    </Select>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Select size="sm" defaultValue="ferrflow">
        <option value="ferrflow">Small — FerrFlow</option>
      </Select>
      <Select size="md" defaultValue="ferrflow">
        <option value="ferrflow">Medium — FerrFlow</option>
      </Select>
      <Select size="lg" defaultValue="ferrflow">
        <option value="ferrflow">Large — FerrFlow</option>
      </Select>
    </div>
  ),
};
