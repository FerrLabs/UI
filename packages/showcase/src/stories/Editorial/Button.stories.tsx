import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@ferrlabs/ui-react';

const meta: Meta<typeof Button> = {
  title: 'Editorial/Button',
  component: Button,
  args: { children: 'Click me', variant: 'primary', size: 'md', loading: false, disabled: false },
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
export const AccentOverride: Story = {
  args: { accent: 'var(--color-ferrvault-emerald)', children: 'Custom accent' },
};
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button>Primary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button loading>Saving…</Button>
        <Button variant="ghost" loading>
          Loading
        </Button>
        <Button variant="danger" loading>
          Deleting
        </Button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
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
