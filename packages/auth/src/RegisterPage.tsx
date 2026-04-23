import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from './lib/api';
import PasswordStrengthBar from '@ferrlabs/ui-react';
import type { StrengthScore } from './lib/passwordStrength';

/// Minimum zxcvbn score we'll allow before enabling submit. Score 3
/// ("strong") corresponds to roughly 10^8 guesses — comfortably out of reach
/// for online attacks. The server-side HIBP check is a second layer.
const MIN_SCORE: StrengthScore = 3;

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<StrengthScore>(0);

  // Use the email local-part as an extra input so "bryan@foo.com" / "bryan"
  // won't pass as a password. zxcvbn treats it as a personal token and drops
  // the score accordingly.
  const userInputs = useMemo(() => {
    const local = email.split('@')[0]?.trim();
    return local ? [local] : [];
  }, [email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.auth.register(email, password);
      // Registration now gates on an emailed 6-digit code — hand off to the
      // shared VerifyEmail page rather than landing on the app.
      navigate(`/verify-email?email=${encodeURIComponent(res.email)}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'USER_PASSWORD_IN_BREACH_CORPUS') {
        setError('This password has appeared in a public breach. Pick a different one.');
      } else {
        const msg = err instanceof ApiError ? err.message : 'Unexpected error';
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const tooWeak = password.length > 0 && score < MIN_SCORE;

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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500">Start managing your projects with FerrFlow</p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <PasswordStrengthBar
              password={password}
              userInputs={userInputs}
              onScoreChange={setScore}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || tooWeak || !password}
            className="w-full py-2.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-orange-600 font-medium hover:text-orange-800 no-underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
