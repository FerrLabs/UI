import {
  brandApps,
  BrandDropdownComponent,
  ProjectSwitcherComponent,
  SiteSwitcherComponent,
} from '@ferrlabs/ui-ng';
import { icons } from '@ferrlabs/ui-foundation/icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const PROJECTS = [
  { id: 'cloud', label: 'FerrLabs Cloud', meta: '12 agents' },
  { id: 'games', label: 'FerrGames', meta: '4 agents' },
  { id: 'infra', label: 'Infra', meta: '2 agents' },
];

const SITES = [
  { id: 'prod', label: 'ferrlabs.com', meta: 'Production' },
  { id: 'staging', label: 'staging.ferrlabs.com', meta: 'Staging' },
  { id: 'preview', label: 'preview.ferrlabs.com', meta: 'Preview' },
];

const meta: Meta = {
  title: 'App chrome/Switchers',
  decorators: [
    moduleMetadata({
      imports: [ProjectSwitcherComponent, SiteSwitcherComponent, BrandDropdownComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj;

export const ProjectSwitcher: Story = {
  render: () => ({
    props: { items: PROJECTS, current: PROJECTS[0] },
    template: `
      <div style="padding:16px">
        <flr-project-switcher [items]="items" [current]="current" title="Switch project"
                              createLabel="New project" viewAllLabel="View all" triggerEyebrow="Project" />
      </div>`,
  }),
};

export const SiteSwitcher: Story = {
  render: () => ({
    props: { items: SITES },
    template: `
      <div style="padding:16px">
        <flr-site-switcher [items]="items" activeId="prod" createLabel="Add a site" />
      </div>`,
  }),
};

export const BrandDropdown: Story = {
  render: () => ({
    template: `
      <div style="padding:16px; background:var(--color-app-bg-2, var(--color-paper-2)); width:280px">
        <flr-brand-dropdown current="ferrfleet" />
      </div>`,
  }),
};

export const BrandDropdownCollapsed: Story = {
  render: () => ({
    template: `
      <div style="padding:16px; background:var(--color-app-bg-2, var(--color-paper-2)); width:72px">
        <flr-brand-dropdown current="ferrvault" [collapsed]="true" />
      </div>`,
  }),
};

export const BrandDropdownInternal: Story = {
  render: () => ({
    props: {
      apps: brandApps({
        env: {
          apps: {
            ferrlabs: 'https://app.ferrlabs',
            ferrvault: 'https://app.ferrvault.ferrlabs',
            ferrtrack: 'https://app.ferrtrack.ferrlabs',
            ferrfleet: 'https://app.ferrfleet.ferrlabs',
            storybook: 'https://storybook.ferrlabs',
          },
        },
      }),
    },
    template: `
      <div style="padding:16px; background:var(--color-app-bg-2, var(--color-paper-2)); width:280px">
        <flr-brand-dropdown current="ferrvault" [apps]="apps" />
      </div>`,
  }),
};

const ICON_PROJECTS = [
  { id: 'svg', label: 'Allowed SVG', meta: 'library icon', icon: icons.overview },
  { id: 'emoji', label: 'Emoji glyph', meta: 'plain text', icon: '⌨' },
  {
    id: 'injection',
    label: 'Injection attempt',
    meta: 'rendered as text',
    icon: '<img src=x onerror="window.__iconXss = true">',
  },
];

export const ProjectSwitcherIconMarkup: Story = {
  render: () => ({
    props: { items: ICON_PROJECTS, current: ICON_PROJECTS[0] },
    template: `
      <div style="padding:16px">
        <flr-project-switcher [items]="items" [current]="current" title="Switch project"
                              triggerEyebrow="Project" />
      </div>`,
  }),
};
