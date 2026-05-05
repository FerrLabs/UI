import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from '@ferrlabs/ui/react';

const meta: Meta<typeof Stat> = {
  title: 'Data Display/Stat',
  component: Stat,
};

export default meta;
type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  args: { label: 'Active orgs', value: '12,847' },
};
export const WithDelta: Story = {
  args: { label: 'MRR', value: '€38,420', delta: '+12.4%', deltaType: 'up' },
};
export const NegativeDelta: Story = {
  args: { label: 'Churn', value: '2.1%', delta: '+0.4pp', deltaType: 'down' },
};
export const FlatDelta: Story = {
  args: { label: 'API uptime', value: '99.98%', delta: 'flat', deltaType: 'flat' },
};
export const Dashboard: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, width: 920 }}>
      <Stat label="Orgs" value="1,247" delta="+38" deltaType="up" />
      <Stat label="MRR" value="€38,420" delta="+12.4%" deltaType="up" />
      <Stat label="Churn" value="2.1%" delta="+0.4pp" deltaType="down" />
      <Stat label="API uptime" value="99.98%" delta="flat" deltaType="flat" />
    </div>
  ),
};
