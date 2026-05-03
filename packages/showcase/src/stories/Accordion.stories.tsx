import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem } from '@ferrlabs/ui-primitives';

const meta: Meta<typeof Accordion> = {
  title: 'Disclosure/Accordion',
  component: Accordion,
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const items = [
  {
    id: 'pricing',
    trigger: 'How does pricing work?',
    body: 'FerrLabs orgs are free containers. You only pay for the products you activate. Each product has its own per-seat or per-usage tier.',
  },
  {
    id: 'self-host',
    trigger: 'Can I self-host?',
    body: 'Only FerrFlow CLI is self-hostable today (open source, MIT). FerrVault, FerrTrack, FerrGrowth and FerrFleet are cloud-only.',
  },
  {
    id: 'eu',
    trigger: 'Where is my data hosted?',
    body: 'Production storage is exclusively in the European Union (France). A small set of subprocessors (Stripe for payments) may process billing data in the US under Standard Contractual Clauses.',
  },
  {
    id: 'cancel',
    trigger: 'How do I cancel?',
    body: 'From /settings/org → Subscriptions → Cancel. You keep access until the end of the current billing period. No prorated refund.',
  },
];

export const Multiple: Story = {
  render: () => (
    <Accordion>
      {items.map((item) => (
        <AccordionItem key={item.id} id={item.id} trigger={item.trigger}>
          {item.body}
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Single: Story = {
  render: () => (
    <Accordion type="single" defaultOpen={[items[0]!.id]}>
      {items.map((item) => (
        <AccordionItem key={item.id} id={item.id} trigger={item.trigger}>
          {item.body}
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
