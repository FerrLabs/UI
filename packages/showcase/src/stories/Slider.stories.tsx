import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@ferrlabs/ui-react/primitives';

const meta: Meta<typeof Slider> = {
  title: 'Forms/Slider',
  component: Slider,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => {
    const [v, setV] = useState(50);
    return <Slider value={v} onChange={setV} label="Volume" showValue />;
  },
};

export const Currency: Story = {
  render: () => {
    const [v, setV] = useState(2500);
    return (
      <Slider
        value={v}
        onChange={setV}
        min={0}
        max={10000}
        step={50}
        label="Monthly budget"
        showValue
        format={(n) => `€${n.toLocaleString('en-US')}`}
      />
    );
  },
};

export const Disabled: Story = {
  render: () => <Slider value={75} onChange={() => {}} disabled label="Disabled" showValue />,
};
