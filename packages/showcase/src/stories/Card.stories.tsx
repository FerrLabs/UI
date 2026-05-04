import { Button, Tag } from '@ferrlabs/ui-react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Card> = {
  title: 'Data Display/Card',
  component: Card,
  argTypes: {
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['flat', 'raised', 'outlined'] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: { children: 'Card content goes here.' },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const WithHeader: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader
        title="FerrFlow"
        description="Universal semantic versioning, free and open source."
        trailing={
          <Tag soft variant="success" dot>
            Active
          </Tag>
        }
      />
      <p className="mt-4 text-sm text-slate-600 leading-relaxed">
        A single Rust binary that reads your conventional commits, bumps versions, generates
        changelogs, tags, and ships GitHub releases.
      </p>
      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm">
          View →
        </Button>
      </div>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card variant="flat" className="w-48">
        Flat — no shadow, no border.
      </Card>
      <Card variant="raised" className="w-48">
        Raised — soft shadow.
      </Card>
      <Card variant="outlined" className="w-48">
        Outlined — slate ring.
      </Card>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card interactive className="w-72">
      <CardHeader
        title="Click me"
        description="Cards with `interactive` get cursor + hover shadow."
      />
    </Card>
  ),
};
