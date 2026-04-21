import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

// The request endpoint always returns 202 — it leaks nothing about whether an
// account exists, so the page shows the same success copy unconditionally.
// Only network-level failures (rare) surface as errors.
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.auth.requestPasswordReset(email);
      setSent(true);
    } catch {
      setError('Could not send the reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we'll send you a link to choose a new password.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        {sent && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            If that email exists in our system, we've sent a reset link. Check your inbox.
          </div>
        )}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
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
          <button
            type="submit"
            disabled={submitting || !email}
            className="w-full py-2.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered it?{' '}
          <Link to="/login" className="text-orange-600 font-medium hover:text-orange-800 no-underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
