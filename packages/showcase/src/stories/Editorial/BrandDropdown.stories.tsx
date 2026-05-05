import type { Meta, StoryObj } from '@storybook/react';
import { BrandDropdown, LogoMark } from '@ferrlabs/ui/react';

const meta: Meta<typeof BrandDropdown> = {
  title: 'Brand/BrandDropdown',
  component: BrandDropdown,
};

export default meta;
type Story = StoryObj<typeof BrandDropdown>;

export const FerrLabs: Story = {
  args: {
    current: 'ferrlabs',
    children: (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: 10,
          cursor: 'pointer',
        }}
      >
        <LogoMark product="ferrlabs" size={24} accent="var(--color-ferrlabs-slate)" />
        <span style={{ fontWeight: 600 }}>FerrLabs</span>
      </span>
    ),
  },
};

export const FerrFlow: Story = {
  args: {
    current: 'ferrflow',
    children: (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: 10,
          cursor: 'pointer',
        }}
      >
        <LogoMark product="ferrflow" size={24} accent="var(--color-ferrflow-orange)" />
        <span style={{ fontWeight: 600 }}>FerrFlow</span>
      </span>
    ),
  },
};

export const Collapsed: Story = {
  args: {
    current: 'ferrtrack',
    collapsed: true,
    children: (
      <span style={{ display: 'inline-flex', padding: 6, cursor: 'pointer' }}>
        <LogoMark product="ferrtrack" size={24} accent="var(--color-ferrtrack-indigo)" />
      </span>
    ),
  },
};
