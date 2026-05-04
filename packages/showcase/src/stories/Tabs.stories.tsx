import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tab, TabList, TabPanel, Tabs } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
};

export default meta;
type Story = StoryObj<typeof Tabs>;

function ControlledTabs(props: { initial?: string; variant?: 'underline' | 'pill' }) {
  const [value, setValue] = useState(props.initial ?? 'overview');
  return (
    <div className="w-[640px]">
      <Tabs value={value} onChange={setValue} variant={props.variant}>
        <TabList ariaLabel="Org sections">
          <Tab value="overview">Overview</Tab>
          <Tab value="members">Members</Tab>
          <Tab value="billing">Billing</Tab>
          <Tab value="audit">Audit log</Tab>
        </TabList>
        <TabPanel value="overview">
          <p className="text-sm text-slate-600">
            Top-level org status: 3 active products, 12 members, last activity 2 minutes ago.
          </p>
        </TabPanel>
        <TabPanel value="members">
          <p className="text-sm text-slate-600">12 members across 5 teams.</p>
        </TabPanel>
        <TabPanel value="billing">
          <p className="text-sm text-slate-600">€348 / mo across 3 active subscriptions.</p>
        </TabPanel>
        <TabPanel value="audit">
          <p className="text-sm text-slate-600">142 events in the last 7 days.</p>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export const Underline: Story = {
  render: () => <ControlledTabs />,
};

export const Pill: Story = {
  render: () => <ControlledTabs variant="pill" />,
};
