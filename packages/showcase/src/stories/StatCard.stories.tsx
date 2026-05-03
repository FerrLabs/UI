import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof StatCard> = {
  title: 'Data/StatCard',
  component: StatCard,
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: { label: 'Active orgs', value: '12,847' },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const WithDelta: Story = {
  args: {
    label: 'MRR',
    value: '€38,420',
    delta: { value: '+12.4%', direction: 'up' },
    hint: 'vs last month',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const NegativeDelta: Story = {
  args: {
    label: 'Churn',
    value: '2.1%',
    delta: { value: '+0.4pp', direction: 'up', positive: false },
    hint: 'vs last month',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
};

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4 w-[920px]">
      <StatCard
        label="Orgs"
        value="1,247"
        delta={{ value: '+38', direction: 'up' }}
        hint="last 7d"
      />
      <StatCard
        label="MRR"
        value="€38,420"
        delta={{ value: '+12.4%', direction: 'up' }}
        hint="vs last month"
      />
      <StatCard
        label="Churn"
        value="2.1%"
        delta={{ value: '+0.4pp', direction: 'up', positive: false }}
        hint="vs last month"
      />
      <StatCard
        label="API uptime"
        value="99.98%"
        delta={{ value: 'flat', direction: 'flat' }}
        hint="rolling 30d"
      />
    </div>
  ),
};
