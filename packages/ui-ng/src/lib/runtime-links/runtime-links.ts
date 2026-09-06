import type {
  BrandDropdownApp,
  BrandDropdownAppId,
} from '../brand-dropdown/brand-dropdown.component';
import type { UserMenuItem } from '../user-menu/user-menu.component';

export interface RuntimeEnv {
  readonly bffUrl?: string;
  readonly accountUrl?: string;
  readonly marketingUrl?: string;
  readonly apps?: Readonly<Partial<Record<BrandDropdownAppId, string>>>;
}

const PRODUCTS: readonly Omit<BrandDropdownApp, 'href'>[] = [
  { id: 'ferrlabs', label: 'FerrLabs', accent: '#1e293b' },
  { id: 'ferrgrowth', label: 'FerrGrowth', accent: '#7c3aed' },
  { id: 'ferrfleet', label: 'FerrFleet', accent: '#f59e0b' },
  { id: 'ferrtrack', label: 'FerrTrack', accent: '#6366f1' },
  { id: 'ferrvault', label: 'FerrVault', accent: '#10b981' },
  { id: 'ferrlens', label: 'FerrLens', accent: '#0ea5e9' },
];

const TOOLS: readonly Omit<BrandDropdownApp, 'href'>[] = [
  { id: 'storybook', label: 'Storybook', accent: '#ff4785', section: 'Tools', newTab: true },
];

export function readRuntimeEnv(): RuntimeEnv {
  return (globalThis as { __ENV?: RuntimeEnv }).__ENV ?? {};
}

export function runtimeUrl(value: string | undefined): string | null {
  const v = value?.trim();
  return v ? v.replace(/\/+$/, '') : null;
}

export function accountUrl(env: RuntimeEnv = readRuntimeEnv()): string | null {
  return runtimeUrl(env.accountUrl);
}

export function marketingUrl(env: RuntimeEnv = readRuntimeEnv()): string | null {
  return runtimeUrl(env.marketingUrl);
}

export function orgCreateUrl(env: RuntimeEnv = readRuntimeEnv()): string | null {
  const base = accountUrl(env);
  return base ? `${base}/onboarding/org-create` : null;
}

export function brandApps(
  options: { readonly isStaff?: boolean; readonly env?: RuntimeEnv } = {},
): readonly BrandDropdownApp[] {
  const env = options.env ?? readRuntimeEnv();
  const configured = env.apps ?? {};
  const apps: BrandDropdownApp[] = [];

  for (const entry of [...PRODUCTS, ...TOOLS]) {
    const href = runtimeUrl(configured[entry.id]);
    if (href) {
      apps.push({ ...entry, href });
    }
  }

  return apps;
}

export function userMenuItems(
  options: { readonly extra?: readonly UserMenuItem[]; readonly env?: RuntimeEnv } = {},
): readonly UserMenuItem[] {
  const env = options.env ?? readRuntimeEnv();
  const base = accountUrl(env);
  const items: UserMenuItem[] = [];

  if (base) {
    items.push({ id: 'profile', label: 'Profile', href: `${base}/profile`, icon: '◯' });
    items.push({ id: 'prefs', label: 'Preferences', href: `${base}/prefs`, icon: '⚙' });
  }
  if (options.extra?.length) {
    items.push(...options.extra);
  }
  items.push({
    id: 'signout',
    label: 'Sign out',
    danger: true,
    separatorAbove: items.length > 0,
  });

  return items;
}
