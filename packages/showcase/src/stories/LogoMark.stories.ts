import { LogoMarkComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const PRODUCTS = [
  'ferrlabs',
  'ferrflow',
  'ferrvault',
  'ferrtrack',
  'ferrgrowth',
  'ferrfleet',
  'ferrlens',
] as const;

const meta: Meta<LogoMarkComponent> = {
  title: 'Foundation/LogoMark',
  component: LogoMarkComponent,
  decorators: [moduleMetadata({ imports: [LogoMarkComponent] })],
  args: { product: 'ferrlabs', size: 40, accent: 'var(--color-accent)' },
  argTypes: {
    product: { control: 'select', options: PRODUCTS },
    size: { control: { type: 'range', min: 16, max: 96, step: 4 } },
  },
  render: (args) => ({
    props: args,
    template: `<flr-logo-mark [product]="product" [size]="size" [accent]="accent" />`,
  }),
};

export default meta;
type Story = StoryObj<LogoMarkComponent>;

export const Default: Story = {};

export const EveryProduct: Story = {
  render: () => ({
    props: { products: PRODUCTS },
    template: `
      <div style="display:flex; gap:24px; flex-wrap:wrap; align-items:center">
        @for (p of products; track p) {
          <div style="display:grid; gap:6px; justify-items:center">
            <flr-logo-mark [product]="p" [size]="40" accent="currentColor" />
            <span class="mono" style="font-size:10px; color:var(--color-fg-3)">{{ p }}</span>
          </div>
        }
      </div>`,
  }),
};
