import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SearchField } from '@ferrlabs/ui/primitives';

const meta: Meta<typeof SearchField> = {
  title: 'Forms/SearchField',
  component: SearchField,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
};

export default meta;
type Story = StoryObj<typeof SearchField>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <SearchField
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onClear={() => setValue('')}
        placeholder="Search members…"
      />
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [v, setV] = useState('orange');
    return (
      <div className="flex flex-col gap-3">
        <SearchField
          size="sm"
          value={v}
          onChange={(e) => setV(e.currentTarget.value)}
          onClear={() => setV('')}
          placeholder="Small"
        />
        <SearchField
          size="md"
          value={v}
          onChange={(e) => setV(e.currentTarget.value)}
          onClear={() => setV('')}
          placeholder="Medium"
        />
        <SearchField
          size="lg"
          value={v}
          onChange={(e) => setV(e.currentTarget.value)}
          onClear={() => setV('')}
          placeholder="Large"
        />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => <SearchField defaultValue="" placeholder="Type to search" />,
};
