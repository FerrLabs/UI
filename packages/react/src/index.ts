/**
 * @ferrlabs/ui-react — shared React components for FerrLabs product apps.
 *
 * Most components were ported from FerrFlow-Cloud's app package. Some still
 * reference the caller's API client / toast store — see individual component
 * docs for wiring.
 */

export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { default as ConfirmDialog } from './components/ConfirmDialog';
export { default as FormDialog } from './components/FormDialog';
export { default as ErrorBoundary } from './components/ErrorBoundary';
export { Spinner, LoadingPage, ErrorBox } from './components/Loading';
export { default as PasswordStrengthBar } from './components/PasswordStrengthBar';
export { default as ToastContainer } from './components/ToastContainer';

export * from './lib/toast';
export * from './lib/passwordStrength';

/**
 * Product-app chrome (AppShell, AppLogoMark, PageHeader, Stat, Tag, Avatar,
 * AppButton, CommandHint). Token-driven, router-agnostic. See
 * `./components/app/index.ts` for the token contract every consuming app
 * must satisfy in its global stylesheet.
 */
export * from './components/app';
