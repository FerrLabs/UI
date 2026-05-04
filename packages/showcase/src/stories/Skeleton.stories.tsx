import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Skeleton> = {
  title: 'Data Display/Skeleton',
  component: Skeleton,
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { width: 240, height: 16 },
};

export const Circle: Story = {
  args: { shape: 'circle', width: 48, height: 48 },
};

export const TextLines: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <Skeleton shape="text" width="60%" />
      <Skeleton shape="text" />
      <Skeleton shape="text" />
      <Skeleton shape="text" width="80%" />
    </div>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <div className="w-80 p-5 rounded-xl ring-1 ring-slate-200 bg-white flex gap-4">
      <Skeleton shape="circle" width={48} height={48} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton shape="text" width="60%" height={14} />
        <Skeleton shape="text" />
        <Skeleton shape="text" width="40%" />
      </div>
    </div>
  ),
};
