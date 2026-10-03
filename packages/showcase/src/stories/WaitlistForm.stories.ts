import {
  WAITLIST_FORM_LABELS_EN,
  WAITLIST_FORM_LABELS_FR,
  WaitlistFormComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<WaitlistFormComponent> = {
  title: 'Forms/WaitlistForm',
  component: WaitlistFormComponent,
  decorators: [moduleMetadata({ imports: [WaitlistFormComponent] })],
  args: {
    endpoint: 'https://api.ferrlabs.com/waitlist',
    product: 'ferrtrack',
    locale: 'en',
    labels: WAITLIST_FORM_LABELS_EN,
  },
  render: (args) => ({
    props: args,
    template: `<flr-waitlist-form [endpoint]="endpoint" [product]="product" [labels]="labels" [locale]="locale" />`,
  }),
};

export default meta;
type Story = StoryObj<WaitlistFormComponent>;

export const Default: Story = {};

export const French: Story = {
  args: { labels: WAITLIST_FORM_LABELS_FR, locale: 'fr' },
};
