import { PaginationComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<PaginationComponent> = {
  title: 'Primitives/Pagination',
  component: PaginationComponent,
  decorators: [moduleMetadata({ imports: [PaginationComponent] })],
  args: {
    page: 5,
    totalPages: 20,
    siblingCount: 1,
    showFirstLast: true,
    showSummary: false,
    size: 'md',
    variant: 'pages',
    align: 'center',
    disabled: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['pages', 'compact'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
    siblingCount: { control: { type: 'range', min: 0, max: 3, step: 1 } },
    page: { control: { type: 'range', min: 1, max: 20, step: 1 } },
  },
  render: (args) => ({
    props: args,
    template: `
      <flr-pagination
        [page]="page" [totalPages]="totalPages" [siblingCount]="siblingCount"
        [showFirstLast]="showFirstLast" [showSummary]="showSummary" [size]="size"
        [variant]="variant" [align]="align" [disabled]="disabled"
        (pageChange)="page = $event"
      />`,
  }),
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = {};

export const Compact: Story = { args: { variant: 'compact' } };

export const TableFooter: Story = {
  args: { page: 2, totalItems: 243, pageSize: 20, totalPages: null },
  render: (args) => ({
    props: args,
    template: `
      <div style="border:1px solid var(--color-rule); border-radius:10px; overflow:hidden; max-width:640px">
        <table style="width:100%; border-collapse:collapse; font-size:13px">
          <thead>
            <tr style="text-align:left; background:var(--color-paper-2)">
              <th style="padding:8px 12px; font-weight:600">Secret</th>
              <th style="padding:8px 12px; font-weight:600">Environment</th>
            </tr>
          </thead>
          <tbody>
            @for (row of [1, 2, 3]; track row) {
              <tr style="border-top:1px solid var(--color-rule)">
                <td style="padding:8px 12px">DATABASE_URL_{{ row }}</td>
                <td style="padding:8px 12px; color:var(--color-fg-3)">production</td>
              </tr>
            }
          </tbody>
        </table>
        <div style="padding:10px 12px; border-top:1px solid var(--color-rule)">
          <flr-pagination
            [page]="page" [totalItems]="totalItems" [pageSize]="pageSize"
            size="sm" align="between" [showSummary]="true" [showFirstLast]="false"
            (pageChange)="page = $event"
          />
        </div>
      </div>`,
  }),
};

export const LinkMode: Story = {
  args: { page: 3, totalPages: 12 },
  render: (args) => ({
    props: { ...args, pageHref: (p: number) => (p === 1 ? '/changelog/' : `/changelog/${p}/`) },
    template: `
      <flr-pagination [page]="page" [totalPages]="totalPages" [pageHref]="pageHref" align="center" />`,
  }),
};

export const French: Story = {
  args: { page: 4, totalItems: 240, pageSize: 20, totalPages: null, variant: 'compact' },
  render: (args) => ({
    props: {
      ...args,
      labels: {
        root: 'Pagination',
        first: 'Première page',
        previous: 'Page précédente',
        next: 'Page suivante',
        last: 'Dernière page',
        page: (p: number) => `Page ${p}`,
        status: (p: number, total: number) => `Page ${p} sur ${total}`,
        summary: (from: number, to: number, total: number) => `${from}–${to} sur ${total}`,
      },
    },
    template: `
      <flr-pagination
        [page]="page" [totalItems]="totalItems" [pageSize]="pageSize" [variant]="variant"
        [labels]="labels" [showSummary]="true" align="between"
        (pageChange)="page = $event"
      />`,
  }),
};

export const Widths: Story = {
  render: () => ({
    props: { pages: [1, 2, 5, 18, 20] },
    template: `
      <div style="display:grid; gap:10px">
        @for (p of pages; track p) {
          <flr-pagination [page]="p" [totalPages]="20" align="start" [aria-label]="'Pagination, width sample ' + p" />
        }
      </div>`,
  }),
};
