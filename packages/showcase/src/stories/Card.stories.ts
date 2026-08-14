import { CardComponent, CardHeaderComponent } from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<CardComponent> = {
  title: 'Primitives/Card',
  component: CardComponent,
  decorators: [moduleMetadata({ imports: [CardComponent, CardHeaderComponent] })],
  args: { padding: 'md', variant: 'outlined', interactive: false },
  argTypes: {
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['flat', 'raised', 'outlined'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <flr-card [padding]="padding" [variant]="variant" [interactive]="interactive" style="max-width:360px">
        <flr-card-header title="Production" description="eu-west-1 · 3 replicas" />
        <p style="margin:12px 0 0; color:var(--color-fg-2)">Last deploy 4 minutes ago.</p>
      </flr-card>`,
  }),
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Outlined: Story = {};

export const Raised: Story = { args: { variant: 'raised' } };

export const Interactive: Story = { args: { interactive: true } };
