import { DocsLayoutComponent, type DocSection, type DocVersion } from '@ferrlabs/ui-ng/docs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const NAV: readonly DocSection[] = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Introduction', slug: 'introduction' },
      { label: 'Installation', slug: 'installation' },
      { label: 'Quick start', slug: 'quickstart' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Config reference', slug: 'configuration/config-file' },
      { label: 'Monorepo', slug: 'configuration/monorepo' },
      { label: 'Supported formats', slug: 'configuration/formats' },
    ],
  },
  {
    label: 'CI / CD',
    items: [
      { label: 'GitHub Actions', slug: 'ci/github-actions' },
      { label: 'Self-hosted runners', slug: 'ci/self-hosted' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'CLI', slug: 'reference/cli' },
      { label: 'Errors', slug: 'reference/errors' },
    ],
  },
];

const VERSIONS: readonly DocVersion[] = [
  { slug: 'current', label: 'v7' },
  { slug: 'v6', label: 'v6' },
  { slug: 'v5', label: 'v5' },
];

const BODY = `
  <h1>Installation</h1>
  <p>
    FerrFlow ships as a single binary. Install it with the script below, or grab a
    release archive from GitHub if you would rather pin the version yourself.
  </p>
  <h2>From the install script</h2>
  <p>The script detects your platform and drops the binary on your PATH.</p>
  <h2>From a release archive</h2>
  <p>Every release publishes archives for Linux, macOS and Windows.</p>
  <h3>Verifying the download</h3>
  <p>Each archive is published with a checksum beside it.</p>
`;

const meta: Meta<DocsLayoutComponent> = {
  title: 'Site chrome/DocsLayout',
  component: DocsLayoutComponent,
  decorators: [moduleMetadata({ imports: [DocsLayoutComponent] })],
  args: { nav: NAV, versions: VERSIONS, slug: 'installation', lang: 'en', version: 'current' },
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    props: args,
    template: `
      <flr-docs-layout
        [nav]="nav"
        [versions]="versions"
        [slug]="slug"
        [lang]="lang"
        [version]="version"
      >${BODY}</flr-docs-layout>
    `,
  }),
};

export default meta;
type Story = StoryObj<DocsLayoutComponent>;

/**
 * Every section renders expanded, so a reader can see the shape of the
 * documentation rather than only the branch they happen to be standing in.
 */
export const Default: Story = {};

/** A page in a later section, to check the active link and not just the first one. */
export const DeepInTheTree: Story = {
  args: { slug: 'reference/errors' },
};

/** A frozen version: the picker reflects it and the links carry the version prefix. */
export const OlderVersion: Story = {
  args: { slug: 'introduction', version: 'v6' },
};

/** French locale, which drives the sidebar toggle label and the table-of-contents heading. */
export const French: Story = {
  args: { lang: 'fr', slug: 'installation' },
};

/** No versions supplied, so the picker is absent. The common case for a product with one line of docs. */
export const WithoutVersionPicker: Story = {
  args: { versions: [] },
};
