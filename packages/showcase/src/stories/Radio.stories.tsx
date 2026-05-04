import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioGroup } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/Radio',
  component: RadioGroup,
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

function ControlledRadioGroup(props: {
  initial?: string;
  orientation?: 'vertical' | 'horizontal';
}) {
  const [value, setValue] = useState(props.initial ?? 'pro');
  return (
    <RadioGroup
      ariaLabel="Pricing tier"
      value={value}
      onChange={setValue}
      orientation={props.orientation}
    >
      <Radio value="free" label="Free" hint="5 users, 100 events / mo." />
      <Radio value="pro" label="Pro" hint="50 users, 10K events / mo." />
      <Radio value="team" label="Team" hint="Unlimited users, 100K events / mo." />
      <Radio value="enterprise" label="Enterprise" hint="Custom limits, SSO, audit log." />
    </RadioGroup>
  );
}

export const Vertical: Story = {
  render: () => <ControlledRadioGroup />,
};

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = useState('auto');
    return (
      <RadioGroup ariaLabel="Theme" value={value} onChange={setValue} orientation="horizontal">
        <Radio value="auto" label="Auto" />
        <Radio value="light" label="Light" />
        <Radio value="dark" label="Dark" />
      </RadioGroup>
    );
  },
};

export const NoHints: Story = {
  render: () => {
    const [value, setValue] = useState('en');
    return (
      <RadioGroup ariaLabel="Locale" value={value} onChange={setValue}>
        <Radio value="en" label="English" />
        <Radio value="fr" label="Français" />
      </RadioGroup>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup ariaLabel="Disabled group" disabled value="pro">
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  ),
};
