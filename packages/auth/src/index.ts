/**
 * @ferrlabs/ui-auth — auth forms as reusable React components.
 *
 * Every component takes an `onSubmit` callback that gets the validated
 * payload — the consuming app wires it to its own API client (usually
 * `/api/auth/login` on FerrLabs-Cloud). No transport logic lives here.
 */

export { LoginForm } from './LoginForm';
export type { LoginFormProps, LoginSubmitPayload } from './LoginForm';

// TODO: SignupForm, ResetPasswordForm, VerifyEmailPrompt, OAuthButton,
// TotpSetup, TotpChallenge, RecoveryCodes
