import type { Meta, StoryObj } from '@storybook/react';
import { Navbar, NavLink } from '@ferrlabs/ui/primitives';
import { Button } from '@ferrlabs/ui/react';

const meta: Meta<typeof Navbar> = {
  title: 'Layout/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

const FerrLabsBrand = () => (
  <>
    <svg width="48" height="28" viewBox="0 0 48 28" aria-hidden="true">
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
        fontSize: 22,
        letterSpacing: '-0.02em',
      }}
    >
      ferrlabs
    </span>
  </>
);

const LangPill = ({ active = 'en' as 'en' | 'fr' }) => (
  <div
    className="mono"
    style={{
      display: 'flex',
      alignItems: 'center',
      border: '1px solid var(--color-rule)',
      borderRadius: 999,
      overflow: 'hidden',
    }}
  >
    {(['en', 'fr'] as const).map((lang) => (
      <a
        key={lang}
        href={`#${lang}`}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '6px 12px',
          textDecoration: 'none',
          color: active === lang ? 'var(--color-paper)' : 'var(--color-ink-2)',
          background: active === lang ? 'var(--color-ink)' : 'transparent',
          transition: 'background 180ms, color 180ms',
        }}
      >
        {lang}
      </a>
    ))}
  </div>
);

/**
 * 1:1 mirror of the real ferrlabs.com navbar — `[FL]` SVG + ferrlabs
 * wordmark, Products / About links, EN/FR lang pill, GitHub button.
 */
export const FerrLabsHolding: Story = {
  args: {
    brand: <FerrLabsBrand />,
    links: (
      <>
        <NavLink href="#products">Products</NavLink>
        <NavLink href="#about">About</NavLink>
      </>
    ),
    actions: (
      <>
        <LangPill active="en" />
        <Button as="a" href="https://github.com/FerrLabs" size="sm" variant="ghost">
          GitHub ↗
        </Button>
      </>
    ),
  },
};

export const Minimal: Story = {
  args: {
    brand: <FerrLabsBrand />,
    actions: <LangPill />,
  },
};

export const NoSticky: Story = {
  args: {
    sticky: false,
    brand: <FerrLabsBrand />,
    links: (
      <>
        <NavLink href="#a">Section A</NavLink>
        <NavLink href="#b">Section B</NavLink>
        <NavLink href="#c" active>
          Section C
        </NavLink>
      </>
    ),
  },
};

export const ProductSite: Story = {
  args: {
    brand: (
      <>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'var(--color-ferrflow-orange)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          F
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: '-0.02em',
          }}
        >
          ferrflow
        </span>
      </>
    ),
    links: (
      <>
        <NavLink href="#features" active>
          Features
        </NavLink>
        <NavLink href="#docs">Docs</NavLink>
        <NavLink href="#pricing">Pricing</NavLink>
        <NavLink href="#changelog">Changelog</NavLink>
      </>
    ),
    actions: (
      <>
        <LangPill />
        <Button
          as="a"
          href="https://app.ferrflow.com"
          size="sm"
          accent="var(--color-ferrflow-orange)"
        >
          Sign in
        </Button>
      </>
    ),
  },
};
