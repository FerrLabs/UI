/**
 * Auth chrome — used by `auth.ferrlabs.com` to render the sign-in /
 * register screens. Per-product accent is driven by the `client` prop
 * on `AuthLayout`. FerrAgents is intentionally absent from the client
 * list — it's an internal staff platform, never shown publicly.
 *
 * Token contract: same as the app chrome (--color-bg, --color-card,
 * --color-fg*, --color-rule*). The accent (`--accent`, `--accent-soft`)
 * is set per-instance by `AuthLayout` from the `client` prop.
 */

export { AuthLayout, type AuthLayoutProps, type AuthMode } from './AuthLayout';
export { AuthField } from './AuthField';
export { AuthSubmit } from './AuthSubmit';
export { AuthDivider } from './AuthDivider';
export {
  AUTH_CLIENTS,
  clientFromOauthId,
  type AuthClient,
  type AuthClientKey,
} from './clients';
