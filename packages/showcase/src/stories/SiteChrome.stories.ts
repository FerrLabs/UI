import {
  provideSiteChrome,
  SiteFooterComponent,
  SiteNavbarComponent,
  SiteShellComponent,
  type SiteChromeConfig,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';

const CHROME: SiteChromeConfig = {
  origin: 'https://ferrflow.com',
  logoSvg:
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M4 6h16M4 12h10M4 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  wordmark: 'Ferr',
  wordmarkAccent: 'Flow',
  navLinks: [
    { label: 'Docs', href: '/docs' },
    { label: 'Playground', href: '/playground' },
    { label: 'Changelog', href: 'https://ferrlabs.com/changelog/', external: true },
  ],
  cta: { label: 'Get started', href: '/docs/getting-started' },
  footer: {
    tagline: 'Universal semantic versioning, one binary.',
    backLabel: 'a FerrLabs product',
    backHref: 'https://ferrlabs.com',
    columns: [
      {
        title: 'Product',
        links: [
          { label: 'Docs', href: '/docs' },
          { label: 'Playground', href: '/playground' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'FerrLabs', href: 'https://ferrlabs.com', external: true },
          { label: 'GitHub', href: 'https://github.com/FerrLabs', external: true },
        ],
      },
    ],
    bottomLeft: '© 2026 FerrLabs',
    bottomRight: 'MPL-2.0',
  },
  labels: { menu: 'Menu', close: 'Close', openMenu: 'Open menu' },
};

const meta: Meta = {
  title: 'Site chrome/Navbar & Footer',
  decorators: [
    applicationConfig({ providers: [provideSiteChrome(CHROME)] }),
    moduleMetadata({
      imports: [SiteNavbarComponent, SiteFooterComponent, SiteShellComponent],
    }),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj;

export const Navbar: Story = { render: () => ({ template: `<flr-site-navbar />` }) };

export const Footer: Story = { render: () => ({ template: `<flr-site-footer />` }) };

// A site that ships one language. The switcher is not rendered at all, because
// the locale it would offer was never built and the link goes to a 404.
export const NavbarSingleLocale: Story = {
  decorators: [
    applicationConfig({ providers: [provideSiteChrome({ ...CHROME, locales: ['en'] })] }),
  ],
  render: () => ({ template: `<flr-site-navbar />` }),
};

export const Shell: Story = {
  render: () => ({
    template: `
      <flr-site-shell title="FerrFlow" description="Universal semantic versioning CLI">
        <section style="padding:64px 24px; max-width:720px; margin:0 auto">
          <h1 style="margin:0 0 12px">One binary, every ecosystem.</h1>
          <p style="margin:0; color:var(--color-fg-2)">
            Reads your conventional commits, bumps 14+ file formats, tags, and publishes the release.
          </p>
        </section>
      </flr-site-shell>`,
  }),
};
