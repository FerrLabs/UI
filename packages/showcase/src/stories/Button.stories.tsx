import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Danger: Story = { args: { variant: 'danger' } };

export const Loading: Story = { args: { loading: true, children: 'Saving…' } };

export const Disabled: Story = { args: { disabled: true } };

export const AsAnchor: Story = {
  args: { as: 'a', href: 'https://ferrlabs.com', children: 'Visit ferrlabs.com →' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div className="flex gap-3">
        <Button loading>Primary loading</Button>
        <Button variant="ghost" loading>
          Ghost loading
        </Button>
        <Button variant="danger" loading>
          Danger loading
        </Button>
      </div>
      <div className="flex gap-3">
        <Button disabled>Primary disabled</Button>
        <Button variant="ghost" disabled>
          Ghost disabled
        </Button>
        <Button variant="danger" disabled>
          Danger disabled
        </Button>
      </div>
    </div>
  ),
};
