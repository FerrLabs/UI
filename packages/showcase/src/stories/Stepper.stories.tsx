import { Button } from '@ferrlabs/ui-react/react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from '@ferrlabs/ui-react/primitives';

const meta: Meta<typeof Stepper> = {
  title: 'Forms/Stepper',
  component: Stepper,
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const steps = [
  { id: 'org', label: 'Create org', description: 'Pick a name + slug.' },
  { id: 'product', label: 'Pick a product', description: 'Free or paid trial.' },
  { id: 'invite', label: 'Invite teammates', description: 'Optional — skip and come back.' },
  { id: 'done', label: 'Ready', description: 'Land on app.ferrlabs.com.' },
];

export const Horizontal: Story = {
  render: () => {
    const [current, setCurrent] = useState(1);
    return (
      <div className="flex flex-col gap-6 w-[760px]">
        <Stepper steps={steps} current={current} />
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            ← Back
          </Button>
          <Button
            onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}
            disabled={current === steps.length - 1}
          >
            Next →
          </Button>
        </div>
      </div>
    );
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="w-[420px]">
      <Stepper steps={steps} current={2} orientation="vertical" />
    </div>
  ),
};

export const AllCompleted: Story = {
  render: () => (
    <div className="w-[760px]">
      <Stepper steps={steps} current={steps.length} />
    </div>
  ),
};
