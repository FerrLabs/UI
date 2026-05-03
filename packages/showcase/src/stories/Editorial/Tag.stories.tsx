import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from '@ferrlabs/ui-react';

const meta: Meta<typeof Tag> = {
  title: 'Editorial/Tag',
  component: Tag,
  args: { children: 'Tag' },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {};
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag variant="neutral">Neutral</Tag>
      <Tag variant="accent">Accent</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="danger">Danger</Tag>
    </div>
  ),
};
export const Soft: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag variant="neutral" soft>
        Neutral
      </Tag>
      <Tag variant="accent" soft>
        Accent
      </Tag>
      <Tag variant="success" soft>
        Active
      </Tag>
      <Tag variant="warning" soft>
        Trial · 11 days
      </Tag>
      <Tag variant="danger" soft>
        Past due
      </Tag>
    </div>
  ),
};
export const NoDot: Story = {
  args: { variant: 'accent', soft: true, dot: false, children: 'No leading dot' },
};
export const Removable: Story = {
  render: () => {
    const [tags, setTags] = useState(['react', 'tailwind', 'typescript', 'storybook']);
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tags.map((t) => (
          <Tag
            key={t}
            variant="accent"
            soft
            onRemove={() => setTags((prev) => prev.filter((p) => p !== t))}
          >
            {t}
          </Tag>
        ))}
      </div>
    );
  },
};
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Tag size="sm" variant="accent" soft>
        Small
      </Tag>
      <Tag size="md" variant="accent" soft>
        Medium
      </Tag>
    </div>
  ),
};
