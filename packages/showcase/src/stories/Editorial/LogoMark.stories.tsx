import type { Meta, StoryObj } from '@storybook/react';
import { LogoMark } from '@ferrlabs/ui-react';

const meta: Meta<typeof LogoMark> = {
  title: 'Editorial/LogoMark',
  component: LogoMark,
  args: { product: 'ferrflow', size: 32 },
  argTypes: {
    product: {
      control: 'select',
      options: ['ferrlabs', 'ferrflow', 'ferrvault', 'ferrtrack', 'ferrgrowth', 'ferrfleet'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof LogoMark>;

export const Default: Story = {};

const PRODUCTS = [
  'ferrlabs',
  'ferrflow',
  'ferrvault',
  'ferrtrack',
  'ferrgrowth',
  'ferrfleet',
] as const;
const ACCENTS: Record<(typeof PRODUCTS)[number], string> = {
  ferrlabs: 'var(--color-ferrlabs-slate)',
  ferrflow: 'var(--color-ferrflow-orange)',
  ferrvault: 'var(--color-ferrvault-emerald)',
  ferrtrack: 'var(--color-ferrtrack-indigo)',
  ferrgrowth: 'var(--color-ferrgrowth-violet)',
  ferrfleet: 'var(--color-ferrfleet-amber)',
};

export const AllProducts: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 24,
        alignItems: 'center',
      }}
    >
      {PRODUCTS.map((p) => (
        <div
          key={p}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <LogoMark product={p} size={48} accent={ACCENTS[p]} />
          <span
            className="mono"
            style={{
              fontSize: 10.5,
              color: 'var(--color-fg-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {p}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {[16, 24, 32, 48, 64, 96].map((s) => (
        <LogoMark key={s} product="ferrflow" size={s} accent={ACCENTS.ferrflow} />
      ))}
    </div>
  ),
};
