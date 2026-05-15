import type { Meta, StoryObj } from '@storybook/react';
import { SiteFavicon } from '@ferrlabs/ui/react';

const meta: Meta<typeof SiteFavicon> = {
  title: 'App/SiteFavicon',
  component: SiteFavicon,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SiteFavicon>;

export const WithDomain: Story = {
  args: {
    domain: 'ferrlabs.com',
    name: 'ferrlabs.com',
  },
};

export const NoDomain: Story = {
  args: {
    name: 'Q5 launch',
  },
};

export const Larger: Story = {
  args: {
    domain: 'stripe.com',
    name: 'stripe.com',
    size: 32,
  },
};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <SiteFavicon domain="ferrlabs.com" name="ferrlabs.com" />
      <SiteFavicon domain="ferrflow.com" name="ferrflow.com" />
      <SiteFavicon domain="stripe.com" name="stripe.com" />
      <SiteFavicon domain="vercel.com" name="vercel.com" />
      <SiteFavicon domain="github.com" name="github.com" />
      <SiteFavicon name="Q5 launch" />
      <SiteFavicon name="prod-secrets" />
      <SiteFavicon name="deploy bot" />
    </div>
  ),
};
