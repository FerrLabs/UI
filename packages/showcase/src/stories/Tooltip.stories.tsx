import type { Meta, StoryObj } from '@storybook/react';
import { Button, Tooltip } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip content="Rotates the API key — current tokens still valid for 24h.">
      <Button variant="ghost">Rotate API key</Button>
    </Tooltip>
  ),
};

export const FourSides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-12 p-16">
      <div className="flex justify-center">
        <Tooltip content="Top side" side="top">
          <Button variant="ghost">Top</Button>
        </Tooltip>
      </div>
      <div className="flex justify-center">
        <Tooltip content="Right side" side="right">
          <Button variant="ghost">Right</Button>
        </Tooltip>
      </div>
      <div className="flex justify-center">
        <Tooltip content="Bottom side" side="bottom">
          <Button variant="ghost">Bottom</Button>
        </Tooltip>
      </div>
      <div className="flex justify-center">
        <Tooltip content="Left side" side="left">
          <Button variant="ghost">Left</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

export const OnTextSpan: Story = {
  render: () => (
    <p className="text-sm text-slate-700">
      Sessions live in an{' '}
      <Tooltip content="HttpOnly + Secure + SameSite=Lax cookie set by the API.">
        <span className="underline decoration-dotted underline-offset-4 cursor-help">
          httpOnly cookie
        </span>
      </Tooltip>{' '}
      that JS cannot read.
    </p>
  ),
};
