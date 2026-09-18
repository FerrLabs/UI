import {
  AppSwitcherComponent,
  DEFAULT_APPS,
  entitledApps,
  switcherState,
  type ProductSubscription,
  type SwitcherApp,
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
  args: { items: ENTITLED, current: 'ferrvault', hidden: [] },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:248px; padding:14px 12px; min-height:360px; background:var(--color-app-rail, #101012)">
        <flr-app-switcher [items]="items" [current]="current" [(hidden)]="hidden">
          <a switcher-footer href="/products">Manage subscriptions</a>
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

async function openPanel(canvasElement: HTMLElement): Promise<void> {
  const trigger = canvasElement.querySelector<HTMLButtonElement>('.flr-as__trigger');
  if (!trigger) throw new Error('app switcher trigger not found');
  trigger.click();
  await waitFor(() => expect(canvasElement.querySelector('.flr-as__panel')).not.toBeNull());
}

export const HiddenApp: Story = {
  args: { hidden: ['ferrgrowth', 'ferrlabs', 'ferrvault'] },
  play: async ({ canvasElement }) => {
    await openPanel(canvasElement);
    const names = [...canvasElement.querySelectorAll('.flr-as__item .flr-as__name')].map((el) =>
      el.textContent?.trim(),
    );
    expect(names).toEqual(['FerrLabs', 'FerrVault']);
  },
};

export const Customize: Story = {
  play: async ({ canvasElement }) => {
    await openPanel(canvasElement);
    const gear = canvasElement.querySelector<HTMLButtonElement>('.flr-as__customize');
    if (!gear) throw new Error('customize button not found');
    gear.click();
    await waitFor(() =>
      expect(document.querySelectorAll('.flr-as__toggles [role="switch"]').length).toBe(3),
    );
    const locked = document.querySelector<HTMLButtonElement>('.flr-as__toggles [role="switch"]');
    expect(locked?.disabled).toBe(true);
    expect(locked?.getAttribute('aria-checked')).toBe('true');
  },
};

const FROM_API: readonly SwitcherApp[] = [
  {
    id: 'ferrlabs',
    label: 'FerrLabs',
    href: 'https://app.ferrlabs.com',
    accent: '#1e293b',
    tier: null,
    hidden: true,
  },
  {
    id: 'ferrtrack',
    label: 'FerrTrack',
    href: 'https://app.ferrtrack.com',
    accent: '#6366f1',
    tier: 'team',
    hidden: true,
  },
  {
    id: 'ferrvault',
    label: 'FerrVault',
    href: 'https://app.ferrvault.com',
    accent: '#10b981',
    tier: 'enterprise',
    hidden: false,
  },
];

const FROM_API_STATE = switcherState(FROM_API);

export const FromApi: Story = {
  args: { items: FROM_API_STATE.items, hidden: FROM_API_STATE.hidden },
  play: async ({ canvasElement }) => {
    expect(FROM_API_STATE.hidden).toEqual(['ferrtrack']);
    expect(FROM_API_STATE.hubHref).toBe('https://app.ferrlabs.com');
    await openPanel(canvasElement);
    const rows = [...canvasElement.querySelectorAll('.flr-as__item')].map((row) =>
      [row.querySelector('.flr-as__name'), row.querySelector('.flr-as__meta')].map(
        (el) => el?.textContent?.trim() ?? null,
      ),
    );
    expect(rows).toEqual([
      ['FerrLabs', null],
      ['FerrVault', 'Enterprise'],
    ]);
  },
};
