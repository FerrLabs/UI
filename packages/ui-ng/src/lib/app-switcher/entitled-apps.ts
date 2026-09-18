import type { AppRailItem } from '../app-rail/app-rail.component';

export interface ProductSubscription {
  readonly product: string;
  readonly tier: string;
  readonly status: string;
}

const ENTITLED_STATUSES: ReadonlySet<string> = new Set(['trialing', 'active', 'past_due']);
const ORG_HUB = 'ferrlabs';

export function entitledApps(
  apps: readonly AppRailItem[],
  subscriptions: readonly ProductSubscription[],
  current: string,
): AppRailItem[] {
  const held = new Map(
    subscriptions
      .filter((sub) => ENTITLED_STATUSES.has(sub.status))
      .map((sub) => [sub.product, sub]),
  );
  return apps.flatMap((app) => {
    const sub = held.get(app.id);
    if (sub) return [{ ...app, meta: tierLabel(sub.tier) }];
    return app.id === ORG_HUB || app.id === current ? [app] : [];
  });
}

function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
