import {
  CONTACT_FORM_LABELS_EN,
  CONTACT_FORM_LABELS_FR,
  ContactFormComponent,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<ContactFormComponent> = {
  title: 'Forms/ContactForm',
  component: ContactFormComponent,
  decorators: [moduleMetadata({ imports: [ContactFormComponent] })],
  args: {
    endpoint: 'https://api.ferrlabs.com/contact',
    product: 'ferrtrack',
    kind: 'question',
    email: '',
    locale: 'en',
    labels: CONTACT_FORM_LABELS_EN,
  },
  render: (args) => ({
    props: args,
    template: `<flr-contact-form [endpoint]="endpoint" [product]="product" [kind]="kind" [email]="email" [labels]="labels" [locale]="locale" />`,
  }),
};

export default meta;
type Story = StoryObj<ContactFormComponent>;

export const Default: Story = {};

export const PrefilledFromAnApp: Story = {
  args: { product: 'ferrfleet', kind: 'bug', email: 'ada@example.com' },
};

export const French: Story = {
  args: { labels: CONTACT_FORM_LABELS_FR, locale: 'fr' },
};
