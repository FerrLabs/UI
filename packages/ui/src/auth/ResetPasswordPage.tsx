import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError } from './lib/api';
import PasswordStrengthBar from '../react';
import type { StrengthScore } from './lib/passwordStrength';

/// Gate submit on score >= 3 ("strong"). Same threshold as Register — keeps
/// the UX consistent and prevents users from walking out of a reset with a
/// weaker password than they'd be allowed to sign up with.
const MIN_SCORE: StrengthScore = 3;

// Reset form. The token comes from the emailed link's query string; the user
// types a new password twice. On success the API hands us a fresh session so
// the user lands logged in on `/`.
export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<StrengthScore>(0);
  // Once the backend has told us the token is no good, flip to a terminal
  // state so the user stops retyping the password and requests a new link.
  const [terminal, setTerminal] = useState<null | 'invalid' | 'expired' | 'too_many'>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (score < MIN_SCORE) {
      setError('Please pick a stronger password.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.verifyPasswordReset(token, password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'AUTH_PASSWORD_RESET_TOKEN_INVALID') {
          setTerminal('invalid');
        } else if (err.code === 'AUTH_PASSWORD_RESET_TOKEN_EXPIRED') {
          setTerminal('expired');
        } else if (err.code === 'AUTH_VERIFICATION_TOO_MANY_ATTEMPTS') {
          setTerminal('too_many');
        } else if (err.code === 'USER_PASSWORD_IN_BREACH_CORPUS') {
          setError('This password has appeared in a public breach. Pick a different one.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Unexpected error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-orange-50/30">
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-4">This link is missing its token.</p>
          <Link
            to="/forgot-password"
            className="text-orange-600 font-medium hover:text-orange-800 no-underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (terminal) {
    const copy =
      terminal === 'expired'
        ? 'This reset link has expired. Request a new one.'
        : terminal === 'too_many'
          ? 'Too many attempts — request a new link.'
          : 'Invalid or already-used link. Request a new one.';
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-orange-50/30">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {copy}
          </div>
          <Link
            to="/forgot-password"
            className="text-orange-600 font-medium hover:text-orange-800 no-underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-orange-50/30">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="https://ferrflow.com" className="inline-flex items-center gap-2 no-underline mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ color: '#e8733a' }}>
              <circle cx="16" cy="16" r="4" fill="currentColor" />
              <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
            </svg>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Ferr<span style={{ color: '#e8733a' }}>Flow</span>
            </span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>
          <p className="mt-2 text-sm text-gray-500">
            All other signed-in sessions will be signed out.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
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
            <PasswordStrengthBar password={password} onScoreChange={setScore} />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !password || !confirm || score < MIN_SCORE}
            className="w-full py-2.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Save new password'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-gray-500 hover:text-gray-700 no-underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
