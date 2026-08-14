// Cross-product links resolved at runtime instead of compiled in.
//
// Every product app ships one image that has to serve several worlds: the
// public SaaS, a VPN-only internal instance, and a customer hosting it
// themselves. Those differ only in *where the surrounding surfaces live* — the
// account pages, the admin app, the sibling products. Compiling `*.ferrlabs.com`
// into the bundle made the internal instances advertise the public SaaS, which
// is how an internal user ended up bounced out of the VPN.
//
// The contract is `globalThis.__ENV`, written at container start (see each
// app's `docker-entrypoint.d` script). A link that is not declared is not a
// broken link: the entry is dropped, so an instance only ever offers what it
// can actually reach.

import type {
  BrandDropdownApp,
  BrandDropdownAppId,
} from '../brand-dropdown/brand-dropdown.component';
import type { UserMenuItem } from '../user-menu/user-menu.component';

/** Shape written to `globalThis.__ENV` by the container entrypoint. */
export interface RuntimeEnv {
  /** BFF origin for cookie-based auth. Empty falls back to the compiled default. */
  readonly bffUrl?: string;
  /** FerrLabs account base — profile, preferences, org creation. */
  readonly accountUrl?: string;
  /** Marketing site behind the shell's product name. */
  readonly marketingUrl?: string;
  /** Sibling surfaces, keyed by app id. Absent or empty means "not here". */
  readonly apps?: Readonly<Partial<Record<BrandDropdownAppId, string>>>;
}

/** Brand identity, not deployment config — labels and accents stay in code. */
const PRODUCTS: readonly Omit<BrandDropdownApp, 'href'>[] = [
  { id: 'ferrlabs', label: 'FerrLabs', accent: '#1e293b' },
  { id: 'ferrgrowth', label: 'FerrGrowth', accent: '#7c3aed' },
  { id: 'ferrfleet', label: 'FerrFleet', accent: '#f59e0b' },
  { id: 'ferrtrack', label: 'FerrTrack', accent: '#6366f1' },
  { id: 'ferrvault', label: 'FerrVault', accent: '#10b981' },
  { id: 'ferrlens', label: 'FerrLens', accent: '#0ea5e9' },
];

// Surfaces that are not products: internal tooling, and anything else a
// deployment wants to hang off the switcher. They render under their own
// heading so nobody reads Storybook as something we sell, and they follow the
// same rule as the products — undeclared means absent, so the public SaaS
// never advertises a VPN-only host.
const TOOLS: readonly Omit<BrandDropdownApp, 'href'>[] = [
  { id: 'storybook', label: 'Storybook', accent: '#ff4785', section: 'Tools' },
];

export function readRuntimeEnv(): RuntimeEnv {
  return (globalThis as { __ENV?: RuntimeEnv }).__ENV ?? {};
}

/** Trim, drop trailing slashes, and treat blank as "not declared". */
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

/** Where "create an organisation" goes, or null when there is no account surface. */
export function orgCreateUrl(env: RuntimeEnv = readRuntimeEnv()): string | null {
  const base = accountUrl(env);
  return base ? `${base}/onboarding/org-create` : null;
}

/**
 * Sibling surfaces for the brand dropdown — products first, then tools, in the
 * order declared above.
 *
 * Only entries with a configured URL are returned, so an instance shows the
 * ones it actually has rather than linking out of its own world.
 */
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

/**
 * Standard user menu. Sign out is always there — it is local — while the
 * account links appear only when this deployment has account pages.
 *
 * `extra` items are appended before sign out, for anything product-specific.
 */
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
