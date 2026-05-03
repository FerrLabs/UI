import type { Meta, StoryObj } from '@storybook/react';
import { AppFooter } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof AppFooter> = {
  title: 'Layout/AppFooter',
  component: AppFooter,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AppFooter>;

const defaultColumns = [
  {
    title: 'Product',
    links: [
      { label: 'FerrFlow', href: 'https://ferrflow.com' },
      { label: 'FerrVault', href: 'https://ferrvault.com' },
      { label: 'FerrTrack', href: 'https://ferrtrack.com' },
      { label: 'FerrGrowth', href: 'https://ferrgrowth.com' },
      { label: 'FerrFleet', href: 'https://ferrfleet.com' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Status', href: 'https://status.ferrlabs.com', external: true },
      { label: 'GitHub', href: 'https://github.com/FerrLabs', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: 'mailto:hello@ferrlabs.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Telemetry', href: '/telemetry' },
    ],
  },
];

const Brand = () => (
  <>
    <span className="font-mono text-sm opacity-50">[</span>
    <span className="font-bold text-2xl tracking-tight">FerrLabs</span>
    <span className="font-mono text-sm opacity-50">]</span>
  </>
);

export const Light: Story = {
  args: {
    brand: <Brand />,
    tagline: 'Tools for those who ship to production.',
    columns: defaultColumns,
    bottom: (
      <>
        <span>© 2026 FerrLabs. All rights reserved.</span>
        <span className="font-mono">All systems normal · ferrlabs.com</span>
      </>
    ),
  },
};

export const Dark: Story = {
  args: {
    variant: 'dark',
    brand: <Brand />,
    tagline: 'Tools for those who ship to production.',
    columns: defaultColumns,
    bottom: <span>© 2026 FerrLabs.</span>,
  },
};

export const Minimal: Story = {
  args: {
    brand: <Brand />,
    bottom: (
      <>
        <span>© 2026 FerrLabs.</span>
        <a href="/privacy" className="hover:text-slate-900">
          Privacy
        </a>
      </>
    ),
  },
};
