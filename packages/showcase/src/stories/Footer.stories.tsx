import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '@ferrlabs/ui-react/primitives';

const meta: Meta<typeof Footer> = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Footer>;

const FerrLabsBrand = () => (
  <>
    <svg width="80" height="48" viewBox="0 0 48 28" aria-hidden="true">
      <text
        x="0"
        y="22"
        fontFamily="DM Mono, ui-monospace, monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.5"
      >
        [
      </text>
      <text
        x="10"
        y="22"
        fontFamily="Fraunces, Georgia, serif"
        fontWeight="900"
        fontSize="22"
        fill="currentColor"
        letterSpacing="-1"
      >
        FL
      </text>
      <text
        x="40"
        y="22"
        fontFamily="DM Mono, ui-monospace, monospace"
        fontSize="10"
        fill="currentColor"
        opacity="0.5"
      >
        ]
      </text>
    </svg>
    <span
      style={{
        fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
        fontWeight: 900,
        fontSize: 36,
        letterSpacing: '-0.03em',
      }}
    >
      ferrlabs
    </span>
  </>
);

const ferrlabsColumns = [
  {
    title: 'Products',
    links: [
      { label: 'FerrGrowth', href: 'https://ferrgrowth.com' },
      { label: 'FerrFleet', href: 'https://ferrfleet.com' },
      { label: 'FerrTrack', href: 'https://ferrtrack.com' },
      { label: 'FerrVault', href: 'https://ferrvault.com' },
      { label: 'FerrFlow', href: 'https://ferrflow.com' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Changelog', href: '/changelog/' },
      { label: 'Status', href: '#' },
      { label: 'GitHub', href: 'https://github.com/FerrLabs', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: 'mailto:hello@ferrlabs.com' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Legal notice', href: '/legal' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Cookie policy', href: '/cookies' },
      { label: 'DPA', href: '/dpa' },
      { label: 'Subprocessors', href: '/subprocessors' },
      { label: 'Security', href: '/security' },
      { label: 'Telemetry', href: '/telemetry' },
    ],
  },
];

/**
 * Mirrors the real ferrlabs.com holding footer 1:1 — same brand mark,
 * same colophon, same 4 columns, same bottom row.
 */
export const FerrLabsHolding: Story = {
  args: {
    brand: <FerrLabsBrand />,
    tagline:
      'Open-source tools and self-hostable backends for the parts of building software you should not have to think about.',
    columns: ferrlabsColumns,
    bottom: '© 2026 FerrLabs. All rights reserved.',
  },
};

export const Minimal: Story = {
  args: {
    brand: <FerrLabsBrand />,
    bottom: '© 2026 FerrLabs.',
  },
};

export const NoColumns: Story = {
  args: {
    brand: <FerrLabsBrand />,
    tagline: 'A short marketing site that does not need a 4-column legal jungle.',
    bottom: '© 2026 FerrLabs.',
  },
};
