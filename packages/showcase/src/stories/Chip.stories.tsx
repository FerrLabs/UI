import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Chip> = {
  title: 'Disclosure/Chip',
  component: Chip,
  args: { children: 'Chip', variant: 'neutral', size: 'md' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-1.5">
      <Chip variant="neutral">Neutral</Chip>
      <Chip variant="accent">Accent</Chip>
      <Chip variant="success">Success</Chip>
      <Chip variant="warning">Warning</Chip>
      <Chip variant="danger">Danger</Chip>
    </div>
  ),
};

export const Removable: Story = {
  render: () => {
    const [tags, setTags] = useState(['react', 'tailwind', 'typescript', 'storybook']);
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Chip
            key={t}
            variant="accent"
            onRemove={() => setTags((prev) => prev.filter((p) => p !== t))}
          >
            {t}
          </Chip>
        ))}
        {tags.length === 0 && <span className="text-xs text-slate-500">All chips dismissed.</span>}
      </div>
    );
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-1.5">
      <Chip variant="success" icon={<span aria-hidden>●</span>}>
        Active
      </Chip>
      <Chip variant="warning" icon={<span aria-hidden>!</span>}>
        Trial · 3 days
      </Chip>
      <Chip variant="danger" icon={<span aria-hidden>×</span>}>
        Failed
      </Chip>
    </div>
  ),
};
