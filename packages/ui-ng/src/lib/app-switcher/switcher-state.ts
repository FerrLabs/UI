import type { AppRailItem } from '../app-rail/app-rail.component';
import { ORG_HUB, tierLabel } from './entitled-apps';

export interface SwitcherApp {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly accent: string;
  readonly tier: string | null;
  readonly hidden: boolean;
}

export interface SwitcherState {
  readonly items: AppRailItem[];
  readonly hidden: string[];
  readonly hubHref: string | null;
}

export function switcherState(apps: readonly SwitcherApp[]): SwitcherState {
  return {
    items: apps.map(({ id, label, href, accent, tier }) =>
      tier ? { id, label, href, accent, meta: tierLabel(tier) } : { id, label, href, accent },
    ),
    hidden: apps.filter((app) => app.hidden && app.id !== ORG_HUB).map((app) => app.id),
    hubHref: apps.find((app) => app.id === ORG_HUB)?.href ?? null,
  };
}
