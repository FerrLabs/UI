import {
  AppSwitcherComponent,
  DEFAULT_APPS,
  entitledApps,
  type ProductSubscription,
} from '@ferrlabs/ui-ng';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, waitFor } from 'storybook/test';

const SUBSCRIPTIONS: readonly ProductSubscription[] = [
  { product: 'ferrflow', tier: 'free', status: 'active' },
  { product: 'ferrgrowth', tier: 'team', status: 'trialing' },
  { product: 'ferrtrack', tier: 'pro', status: 'canceled' },
  { product: 'ferrvault', tier: 'pro', status: 'active' },
];

const ENTITLED = entitledApps(DEFAULT_APPS, SUBSCRIPTIONS, 'ferrvault');

const meta: Meta<AppSwitcherComponent> = {
  title: 'App chrome/AppSwitcher',
  component: AppSwitcherComponent,
  decorators: [moduleMetadata({ imports: [AppSwitcherComponent] })],
  args: { items: ENTITLED, current: 'ferrvault' },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:248px; padding:14px 12px; min-height:360px; background:var(--color-app-rail, #101012)">
        <flr-app-switcher [items]="items" [current]="current">
          <a switcher-footer href="/billing"
             style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; color:rgba(255,255,255,0.52); font-size:12.5px; text-decoration:none">
            Manage subscriptions
          </a>
        </flr-app-switcher>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<AppSwitcherComponent>;

export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('.flr-as__trigger')?.click();
    await waitFor(() => {
      const rows = [...canvasElement.querySelectorAll('.flr-as__item')].map((row) =>
        [row.querySelector('.flr-as__name'), row.querySelector('.flr-as__meta')].map(
          (el) => el?.textContent?.trim() ?? null,
        ),
      );
      expect(rows).toEqual([
        ['FerrLabs', null],
        ['FerrGrowth', 'Team'],
        ['FerrVault', 'Pro'],
      ]);
    });
  },
};

export const Collapsed: Story = {
  args: { collapsed: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:76px; padding:14px 8px; min-height:360px; background:var(--color-app-rail, #101012)">
        <flr-app-switcher [items]="items" [current]="current" [collapsed]="collapsed" />
      </div>`,
  }),
};

export const OneApp: Story = {
  args: { items: [ENTITLED[2]], current: 'ferrvault' },
};
