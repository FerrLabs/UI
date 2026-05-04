import type { Meta, StoryObj } from '@storybook/react';
import { Field, Input } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Field> = {
  title: 'Forms/Field',
  component: Field,
  args: {
    label: 'Work email',
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  args: {
    label: 'Work email',
    children: ({ id, describedBy, invalid }) => (
      <Input
        id={id}
        type="email"
        aria-describedby={describedBy}
        invalid={invalid}
        placeholder="ada@acme.com"
      />
    ),
  },
};

export const WithHint: Story = {
  args: {
    label: 'Org slug',
    hint: 'Lowercase, dashes allowed. Used in URLs.',
    children: ({ id, describedBy, invalid }) => (
      <Input id={id} aria-describedby={describedBy} invalid={invalid} placeholder="acme" />
    ),
  },
};

export const Required: Story = {
  args: {
    label: 'Work email',
    required: true,
    children: ({ id, describedBy, invalid }) => (
      <Input id={id} type="email" required aria-describedby={describedBy} invalid={invalid} />
    ),
  },
};

export const Optional: Story = {
  args: {
    label: 'Display name',
    optional: true,
    children: ({ id, describedBy, invalid }) => (
      <Input id={id} aria-describedby={describedBy} invalid={invalid} />
    ),
  },
};

export const WithError: Story = {
  args: {
    label: 'Work email',
    error: 'That email is already linked to an org.',
    children: ({ id, describedBy, invalid }) => (
      <Input
        id={id}
        type="email"
        aria-describedby={describedBy}
        invalid={invalid}
        defaultValue="ada@acme.com"
      />
    ),
  },
};

export const WithTrailingLabel: Story = {
  args: {
    label: 'Password',
    trailingLabel: (
      <a href="#" className="text-accent hover:underline">
        Forgot?
      </a>
    ),
    children: ({ id, describedBy, invalid }) => (
      <Input id={id} type="password" aria-describedby={describedBy} invalid={invalid} />
    ),
  },
};
