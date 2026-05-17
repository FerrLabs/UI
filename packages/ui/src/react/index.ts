/**
 * @ferrlabs/ui-react — shared React components for FerrLabs product apps.
 *
 * Most components were ported from FerrFlow-Cloud's app package. Some still
 * reference the caller's API client / toast store — see individual component
 * docs for wiring.
 */

export { default as ConfirmDialog } from './components/ConfirmDialog.js';
export { default as FormDialog } from './components/FormDialog.js';
export { default as ErrorBoundary } from './components/ErrorBoundary.js';
export { Spinner, LoadingPage, ErrorBox } from './components/Loading.js';
export { default as PasswordStrengthBar } from './components/PasswordStrengthBar.js';
export { default as ToastContainer } from './components/ToastContainer.js';

export * from './lib/toast.js';
export * from './lib/passwordStrength.js';

/**
 * Product-app chrome (Shell, LogoMark, PageHeader, Stat, Tag, Avatar,
 * Button, CommandHint). Token-driven, router-agnostic. See
 * `./components/app/index.ts` for the token contract every consuming app
 * must satisfy in its global stylesheet.
 */
export * from './components/app/index.js';

/**
 * Auth chrome — used by `auth.ferrlabs.com` to render the sign-in /
 * register screens with a per-product accent driven by the OAuth
 * `client_id` query param.
 */
export * from './components/auth/index.js';
