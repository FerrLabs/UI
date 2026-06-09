import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Combobox, type ComboboxOption } from '@ferrlabs/ui-react/primitives';

const meta: Meta<typeof Combobox> = {
  title: 'Forms/Combobox',
  component: Combobox as never,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

const PRODUCTS: ComboboxOption[] = [
  { value: 'ferrflow', label: 'FerrFlow', hint: 'OSS · CLI' },
  { value: 'ferrvault', label: 'FerrVault', hint: 'Soon' },
  { value: 'ferrtrack', label: 'FerrTrack', hint: 'Soon' },
  { value: 'ferrgrowth', label: 'FerrGrowth', hint: 'Soon' },
  { value: 'ferrfleet', label: 'FerrFleet', hint: 'Soon' },
  { value: 'ferrlabs', label: 'FerrLabs', hint: 'Holding' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Combobox
        options={PRODUCTS}
        value={value}
        onChange={setValue}
        placeholder="Type to search products…"
      />
    );
  },
};

const COUNTRIES = [
  'France',
  'Germany',
  'Spain',
  'Italy',
  'Belgium',
  'Netherlands',
  'Portugal',
  'Sweden',
  'Norway',
  'Finland',
  'Denmark',
  'Poland',
  'Romania',
  'Greece',
  'Ireland',
  'Austria',
  'Czechia',
  'Hungary',
  'Slovakia',
  'Bulgaria',
  'Croatia',
  'Slovenia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Cyprus',
].map<ComboboxOption>((c) => ({ value: c.toLowerCase(), label: c }));

export const LongList: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Combobox
        options={COUNTRIES}
        value={value}
        onChange={setValue}
        placeholder="Pick a country (28 EU member states)…"
      />
    );
  },
};

export const WithDisabled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Combobox
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
          { value: 'team', label: 'Team' },
          { value: 'enterprise', label: 'Enterprise', disabled: true, hint: 'Contact sales' },
        ]}
        value={value}
        onChange={setValue}
        placeholder="Pick a tier"
      />
    );
  },
};
