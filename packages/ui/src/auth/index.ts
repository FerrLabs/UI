/**
 * @ferrlabs/ui/auth — React auth helpers shared across FerrLabs product apps.
 *
 * Currently exports:
 *   - LoginForm — simple email/password form that calls your onSubmit
 *
 * The page-level components (LoginPage, RegisterPage, ForgotPasswordPage,
 * ResetPasswordPage, VerifyEmailPage, AuthGuard) ported from FerrLabs-Cloud
 * still live in this folder as templates but are not exported — they
 * couple to `react-router-dom` and `@zxcvbn-ts/*` (peerDeps the meta
 * package shouldn't force on every consumer) and the page-level shape
 * needs a rewrite to match the unified FerrLabs-Cloud app patterns.
 * Tracked under UI#105 follow-up.
 */

export { LoginForm } from './LoginForm.js';
export type { LoginFormProps, LoginSubmitPayload } from './LoginForm.js';
