import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  args: { children: 'Badge', variant: 'neutral', size: 'md', dot: false },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'outline'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success">Live</Badge>
      <Badge variant="warning">Beta</Badge>
      <Badge variant="danger">Failed</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" dot>
        Active
      </Badge>
      <Badge variant="warning" dot>
        Trial · 11 days left
      </Badge>
      <Badge variant="danger" dot>
        Past due
      </Badge>
      <Badge variant="neutral" dot>
        Canceled
      </Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm" variant="accent">
        Small
      </Badge>
      <Badge size="md" variant="accent">
        Medium
      </Badge>
    </div>
  ),
};
