/**
 * @ferrlabs/ui-auth — React auth forms and flows for FerrLabs product apps.
 *
 * ## Standalone form components (callback-based, no API coupling)
 *
 *   - LoginForm — simple email/password form that calls your onSubmit
 *
 * ## Page-level components ported from FerrFlow-Cloud's app package
 *
 * Still couple to `lib/api` from the consumer — they exist as templates
 * for the unified FerrLabs-Cloud app rather than drop-in replacements:
 *
 *   - LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage,
 *     VerifyEmailPage
 *   - AuthGuard — HOC that guards routes behind an active session
 *
 * ## Utilities
 *
 *   - passwordStrength — zxcvbn-based strength metric + human message
 */

export { LoginForm } from './LoginForm';
export type { LoginFormProps, LoginSubmitPayload } from './LoginForm';

export { default as AuthGuard } from './AuthGuard';
export { default as LoginPage } from './LoginPage';
export { default as RegisterPage } from './RegisterPage';
export { default as ForgotPasswordPage } from './ForgotPasswordPage';
export { default as ResetPasswordPage } from './ResetPasswordPage';
export { default as VerifyEmailPage } from './VerifyEmailPage';

export * from './passwordStrength';
