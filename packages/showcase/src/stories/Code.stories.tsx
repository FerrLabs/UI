import type { Meta, StoryObj } from '@storybook/react';
import { Code, CodeBlock } from '@ferrlabs/ui-react/primitives';

const meta: Meta = {
  title: 'Data Display/Code',
};

export default meta;
type Story = StoryObj;

export const Inline: Story = {
  render: () => (
    <p className="text-sm text-slate-700 max-w-md">
      Run <Code>FERRFLOW_TELEMETRY=0</Code> in your shell to opt out of CLI telemetry, or set{' '}
      <Code>DO_NOT_TRACK=1</Code> for the cross-tool standard.
    </p>
  ),
};

export const Block: Story = {
  render: () => (
    <div className="w-[640px]">
      <CodeBlock filename="global.css" language="css">
        {`@import 'tailwindcss';
@import '@ferrlabs/ui-foundation/tailwind/tokens';

@theme {
  --color-accent: var(--color-primary-600);
}

@source '../node_modules/@ferrlabs/ui-react/primitives/dist/**/*.js';`}
      </CodeBlock>
    </div>
  ),
};

export const NoHeader: Story = {
  render: () => (
    <div className="w-[480px]">
      <CodeBlock copyable={false}>
        {`pnpm --filter @ferrlabs/ui-showcase storybook
# → http://localhost:6006`}
      </CodeBlock>
    </div>
  ),
};

export const ShellSession: Story = {
  render: () => (
    <div className="w-[640px]">
      <CodeBlock filename="terminal" language="sh">
        {`$ ferrflow bump
✓ patch bump: 1.2.3 → 1.2.4
✓ tag created: v1.2.4
✓ pushed: origin v1.2.4
$ _`}
      </CodeBlock>
    </div>
  ),
};
