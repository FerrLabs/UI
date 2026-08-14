import { ComparisonTableComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const COLUMNS = [
  { name: 'FerrFlow', ours: true, accent: '#e8733a' },
  { name: 'semantic-release' },
  { name: 'release-please' },
];

const GROUPS = [
  {
    title: 'Versioning',
    rows: [
      { feature: 'Conventional commits', cells: [true, true, true] },
      {
        feature: 'Monorepo packages',
        hint: 'Independent versions',
        cells: [true, 'partial', true],
      },
      { feature: 'File formats', cells: ['14+', '2', '6'] },
    ],
  },
  {
    title: 'Release',
    rows: [
      { feature: 'GitHub releases', cells: [true, true, true] },
      { feature: 'Changelog generation', cells: [true, true, true] },
      { feature: 'Runs without Node', cells: [true, false, false] },
    ],
  },
];

const meta: Meta<ComparisonTableComponent> = {
  title: 'Primitives/ComparisonTable',
  component: ComparisonTableComponent,
  decorators: [moduleMetadata({ imports: [ComparisonTableComponent] })],
  args: {
    columns: COLUMNS,
    groups: GROUPS,
    eyebrow: 'Comparison',
    heading: 'How FerrFlow compares',
    headingAccent: 'compares',
    lead: 'One binary, every ecosystem.',
    caption: 'Feature comparison against common release tools',
  },
  render: (args) => ({
    props: args,
    template: `
      <flr-comparison-table
        [columns]="columns" [groups]="groups" [eyebrow]="eyebrow" [heading]="heading"
        [headingAccent]="headingAccent" [lead]="lead" [caption]="caption" />`,
  }),
};

export default meta;
type Story = StoryObj<ComparisonTableComponent>;

export const Default: Story = {};

export const Bare: Story = {
  args: { eyebrow: '', heading: '', headingAccent: '', lead: '' },
};
