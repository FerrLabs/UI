import { ButtonComponent, PageHeaderComponent, TagComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<PageHeaderComponent> = {
  title: 'App chrome/PageHeader',
  component: PageHeaderComponent,
  decorators: [moduleMetadata({ imports: [PageHeaderComponent, ButtonComponent, TagComponent] })],
  args: {
    title: 'vault-rotator',
    eyebrow: 'Agent',
    sub: 'Rotates FerrVault secrets on a nightly schedule.',
    breadcrumbs: [
      { label: 'Agents', href: '/agents' },
      { label: 'First-party', href: '/agents/first-party' },
      { label: 'vault-rotator' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `
      <flr-page-header
        [title]="title"
        [eyebrow]="eyebrow"
        [count]="count"
        [sub]="sub"
        [breadcrumbs]="breadcrumbs"
      >
        <flr-tag page-header-badge variant="success" [soft]="true">Active</flr-tag>
        <div page-header-actions style="display:flex; gap:8px">
          <flr-button variant="ghost" size="sm">Edit</flr-button>
          <flr-button size="sm">Run now</flr-button>
        </div>
      </flr-page-header>`,
  }),
};

export default meta;
type Story = StoryObj<PageHeaderComponent>;

export const Full: Story = {};

export const TitleOnly: Story = {
  args: { eyebrow: null, sub: null, count: null, breadcrumbs: [] },
  render: (args) => ({
    props: args,
    template: `<flr-page-header [title]="title" [breadcrumbs]="breadcrumbs" />`,
  }),
};

export const WithCount: Story = {
  args: { eyebrow: null, sub: null, breadcrumbs: [], title: 'Secrets', count: 128 },
  render: (args) => ({
    props: args,
    template: `<flr-page-header [title]="title" [count]="count" [breadcrumbs]="breadcrumbs" />`,
  }),
};
