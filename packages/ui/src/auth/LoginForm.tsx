import { useState, type FormEvent } from 'react';
import { Button } from '../react';

export interface LoginSubmitPayload {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (payload: LoginSubmitPayload) => Promise<void>;
  /** Optional link to signup (defaults to hidden). */
  signupUrl?: string;
  /** Optional link to password reset. */
  forgotUrl?: string;
}

export function LoginForm({ onSubmit, signupUrl, forgotUrl }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          autoComplete="current-password"
        />
        {forgotUrl && (
          <a
            href={forgotUrl}
            className="text-xs text-primary-600 hover:text-primary-800 mt-1 inline-block"
          >
            Forgot password?
          </a>
        )}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button type="submit" loading={loading} fullWidth>
        Sign in
      </Button>

      {signupUrl && (
        <p className="text-sm text-center text-slate-600">
          No account?{' '}
          <a href={signupUrl} className="text-primary-600 hover:text-primary-800 font-medium">
            Sign up
          </a>
        </p>
      )}
    </form>
  );
}
