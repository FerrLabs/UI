import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof ProgressBar> = {
  title: 'Data/ProgressBar',
  component: ProgressBar,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: { value: 42, label: 'Uploading…', showValue: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ProgressBar value={60} size="sm" label="Small" showValue />
      <ProgressBar value={60} size="md" label="Medium" showValue />
      <ProgressBar value={60} size="lg" label="Large" showValue />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ProgressBar value={70} variant="accent" label="Accent" showValue />
      <ProgressBar value={92} variant="success" label="Success" showValue />
      <ProgressBar value={45} variant="warning" label="Warning" showValue />
      <ProgressBar value={88} variant="danger" label="Danger" showValue />
    </div>
  ),
};

export const Animated: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 7)), 600);
      return () => clearInterval(id);
    }, []);
    return <ProgressBar value={value} label="Animated" showValue />;
  },
};

export const Indeterminate: Story = {
  render: () => <ProgressBar indeterminate label="Working…" />,
};
