import type { Meta, StoryObj } from '@storybook/react';
import { Field, Input, Submit } from '@ferrlabs/ui/primitives';

const meta: Meta<typeof Submit> = {
  title: 'Forms/Submit',
  component: Submit,
  args: {
    children: 'Sign in',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof Submit>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true, children: 'Signing in…' } };

export const Disabled: Story = { args: { disabled: true } };

export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const InsideForm: Story = {
  render: () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="flex flex-col gap-4 w-80"
    >
      <Field label="Work email" required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            required
            aria-describedby={describedBy}
            invalid={invalid}
            placeholder="ada@acme.com"
          />
        )}
      </Field>
      <Field label="Password" required>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="password"
            required
            aria-describedby={describedBy}
            invalid={invalid}
          />
        )}
      </Field>
      <Submit fullWidth>Sign in</Submit>
    </form>
  ),
};
