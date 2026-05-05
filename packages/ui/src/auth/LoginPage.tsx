import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from './lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [locked, setLocked] = useState(false);
  // Count failed attempts in this browser session only — used to nudge
  // the forgot-password link after the 3rd miss. Server-side lockout is
  // the authoritative limit; this is pure UX.
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setLocked(false);
    setSubmitting(true);
    try {
      await api.auth.login(email, password);
      setFailedAttempts(0);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 423) {
        // Per-email lockout kicked in server-side. Distinct banner so the
        // user understands waiting won't help as fast as resetting.
        setLocked(true);
        setError(
          'Too many failed attempts. Please wait a few minutes or use Forgot password.',
        );
      } else if (err instanceof ApiError && err.status === 403 && err.message === 'email_not_verified') {
        // Backend tells us the password was correct but email is still
        // pending verification. Surface a resend option instead of the
        // generic wrong-password message.
        setUnverified(true);
        setError('Your email isn’t verified yet.');
      } else {
        const msg =
          err instanceof ApiError
            ? err.status === 401
              ? 'Invalid email or password'
              : err.message
            : 'Unexpected error';
        if (err instanceof ApiError && err.status === 401) {
          setFailedAttempts((n) => n + 1);
        }
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // After a few bad passwords, or once the server locks the account,
  // highlight the reset flow. Server lockout is 5 attempts; nudging at 3
  // gives the user a visible out before they get locked.
  const nudgeForgotPassword = locked || failedAttempts >= 3;

  const onResend = async () => {
    setResending(true);
    try {
      await api.auth.resendVerification(email);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      // Endpoint always returns 202; failures here are local/network only.
      setError('Could not request a new code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-orange-50/30">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="https://ferrflow.com" className="inline-flex items-center gap-2 no-underline mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ color: '#e8733a' }}>
              <circle cx="16" cy="16" r="4" fill="currentColor"/>
              <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7"/>
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4"/>
            </svg>
            <span className="text-xl font-black tracking-tight text-gray-900">Ferr<span style={{ color: '#e8733a' }}>Flow</span></span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Log in to your account</h1>
          <p className="mt-2 text-sm text-gray-500">Access your projects and issues</p>
        </div>

        {error && (
          <div
            className={`mb-4 px-3 py-2 rounded-lg border text-sm ${
              locked
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {error}
            {unverified && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resending || !email}
                  className="text-orange-600 font-medium hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0 p-0 underline"
                >
                  {resending ? 'Sending new code…' : 'Resend verification email'}
                </button>
              </div>
            )}
            {locked && (
              <div className="mt-2">
                <Link
                  to="/forgot-password"
                  className="text-orange-700 font-medium hover:text-orange-900 underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
        )}

        {nudgeForgotPassword && !locked && (
          <div className="mb-4 text-sm text-gray-600">
            Having trouble signing in?{' '}
            <Link
              to="/forgot-password"
              className="text-orange-600 font-medium hover:text-orange-800 underline"
            >
              Reset your password
            </Link>
            .
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-orange-600 font-medium hover:text-orange-800 no-underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          No account? <Link to="/register" className="text-orange-600 font-medium hover:text-orange-800 no-underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
