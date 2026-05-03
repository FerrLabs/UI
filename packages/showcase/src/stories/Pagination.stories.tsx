import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Pagination> = {
  title: 'Data/Pagination',
  component: Pagination,
};

export default meta;
type Story = StoryObj<typeof Pagination>;

function Controlled({
  totalPages,
  initial = 1,
  ...rest
}: {
  totalPages: number;
  initial?: number;
  siblingCount?: number;
  showFirstLast?: boolean;
}) {
  const [page, setPage] = useState(initial);
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="text-xs text-slate-500 font-mono">
        page {page} / {totalPages}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} {...rest} />
    </div>
  );
}

export const FewPages: Story = {
  render: () => <Controlled totalPages={5} />,
};

export const ManyPages: Story = {
  render: () => <Controlled totalPages={20} initial={10} />,
};

export const Edge: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Controlled totalPages={20} initial={1} />
      <Controlled totalPages={20} initial={20} />
    </div>
  ),
};

export const NoFirstLast: Story = {
  render: () => <Controlled totalPages={20} initial={5} showFirstLast={false} />,
};

export const LargeSiblingCount: Story = {
  render: () => <Controlled totalPages={30} initial={15} siblingCount={3} />,
};
