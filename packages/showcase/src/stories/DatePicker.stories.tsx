import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker, Field } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof DatePicker> = {
  title: 'Forms/DatePicker',
  component: DatePicker,
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Date: Story = {
  render: () => {
    const [v, setV] = useState('2026-05-03');
    return <DatePicker value={v} onChange={setV} />;
  },
};

export const DateTime: Story = {
  render: () => {
    const [v, setV] = useState('2026-05-03T14:30');
    return <DatePicker variant="datetime-local" value={v} onChange={setV} />;
  },
};

export const Time: Story = {
  render: () => {
    const [v, setV] = useState('14:30');
    return <DatePicker variant="time" value={v} onChange={setV} />;
  },
};

export const Month: Story = {
  render: () => {
    const [v, setV] = useState('2026-05');
    return <DatePicker variant="month" value={v} onChange={setV} />;
  },
};

export const InsideField: Story = {
  render: () => {
    const [v, setV] = useState('');
    return (
      <div className="w-72">
        <Field label="Trial end" hint="Will be locked once activated.">
          {({ id, describedBy, invalid }) => (
            <DatePicker
              id={id}
              value={v}
              onChange={setV}
              aria-describedby={describedBy}
              invalid={invalid}
              min="2026-01-01"
              max="2027-01-01"
            />
          )}
        </Field>
      </div>
    );
  },
};
