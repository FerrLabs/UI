import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Switch> = {
  title: 'Primitives/Switch',
  component: Switch,
  args: {
    label: 'Telemetry',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

function ControlledSwitch(
  props: Omit<React.ComponentProps<typeof Switch>, 'checked' | 'onChange'>,
) {
  const [checked, setChecked] = useState(false);
  return <Switch {...props} checked={checked} onChange={setChecked} />;
}

export const Default: Story = {
  render: (args) => <ControlledSwitch {...args} />,
};

export const Checked: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
};

export const WithHint: Story = {
  args: {
    label: 'Anonymous telemetry',
    hint: 'Helps us prioritize features. See ferrlabs.com/telemetry.',
  },
  render: (args) => <ControlledSwitch {...args} />,
};

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => <ControlledSwitch {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <Switch {...args} checked={false} onChange={() => {}} />,
};

export const PreferencesPanel: Story = {
  render: () => {
    const [a, setA] = useState(true);
    const [b, setB] = useState(false);
    const [c, setC] = useState(true);
    return (
      <div className="flex flex-col gap-3 w-80">
        <Switch
          label="Email notifications"
          hint="Releases, security advisories, billing receipts."
          checked={a}
          onChange={setA}
        />
        <Switch
          label="Marketing updates"
          hint="Roughly one email per month. You can unsubscribe inline."
          checked={b}
          onChange={setB}
        />
        <Switch
          label="Anonymous telemetry"
          hint="Helps us prioritize features. Hashed identifiers, no PII."
          checked={c}
          onChange={setC}
        />
      </div>
    );
  },
};
