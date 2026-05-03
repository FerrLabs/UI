/**
 * The five user-facing FerrLabs products that can request authentication
 * from `auth.ferrlabs.com`. FerrAgents is intentionally absent — it's an
 * internal staff platform, never shown publicly on the auth page.
 *
 * Glyph is the small marker used in the dark left panel; the brand SVG
 * mark itself comes from `LogoMark` (re-exported via the app barrel).
 */

export type AuthClientKey = 'ferrlabs' | 'ferrflow' | 'ferrvault' | 'ferrtrack' | 'ferrgrowth';

export interface AuthClient {
  key: AuthClientKey;
  name: string;
  /** Hex accent — drives the form's primary button, focus rings, links. */
  color: string;
  /** Soft tint of the accent — used for hovers and the dark-panel glow. */
  soft: string;
  /** One-liner shown on the dark left panel. */
  tagline: string;
  /** Domain hint shown next to the product name in the OIDC "signing in to" card. */
  hostHint: string;
}

export const AUTH_CLIENTS: Record<AuthClientKey, AuthClient> = {
  ferrlabs: {
    key: 'ferrlabs',
    name: 'FerrLabs',
    color: '#1e293b',
    soft: '#f1f5f9',
    tagline: 'your operations cockpit',
    hostHint: 'app.ferrlabs.com',
  },
  ferrflow: {
    key: 'ferrflow',
    name: 'FerrFlow',
    color: '#e8733a',
    soft: '#fef0e8',
    tagline: 'workflows · semantic releases',
    hostHint: 'ferrflow.com',
  },
  ferrvault: {
    key: 'ferrvault',
    name: 'FerrVault',
    color: '#10b981',
    soft: '#ecfdf5',
    tagline: 'secrets without infra',
    hostHint: 'app.ferrvault.com',
  },
  ferrtrack: {
    key: 'ferrtrack',
    name: 'FerrTrack',
    color: '#6366f1',
    soft: '#eef2ff',
    tagline: 'issue tracking, keyboard-first',
    hostHint: 'app.ferrtrack.com',
  },
  ferrgrowth: {
    key: 'ferrgrowth',
    name: 'FerrGrowth',
    color: '#7c3aed',
    soft: '#f5f0ff',
    tagline: 'sites that ship and rank',
    hostHint: 'app.ferrgrowth.com',
  },
};

/**
 * Map an OAuth `client_id` (the value the IdP receives in the
 * `?client_id=…` query param) to one of the public products. Returns
 * `'ferrlabs'` as a sensible default when the caller is unknown or when
 * the requesting client is FerrAgents (which we never show publicly).
 */
export function clientFromOauthId(clientId: string | null | undefined): AuthClientKey {
  if (!clientId) return 'ferrlabs';
  const id = clientId.toLowerCase();
  if (id.startsWith('ferrflow')) return 'ferrflow';
  if (id.startsWith('ferrvault')) return 'ferrvault';
  if (id.startsWith('ferrtrack')) return 'ferrtrack';
  if (id.startsWith('ferrgrowth')) return 'ferrgrowth';
  return 'ferrlabs';
}
