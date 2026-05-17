import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, ApiError } from './lib/api.js';

// Shared "enter your 6-digit code" step for both the register flow (right after
// POST /auth/register) and the login flow (when the backend reports
// `email_not_verified`). The email is passed via the `?email=` query param so
// navigation from either entry point is stateless — no reliance on router
// state that disappears on refresh.
export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const submittedFor = useRef<string>('');

  const submit = async (value: string) => {
    if (submittedFor.current === value) return;
    submittedFor.current = value;
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await api.auth.verifyEmail(email, value);
      navigate('/', { replace: true });
    } catch (err) {
      submittedFor.current = '';
      const msg =
        err instanceof ApiError
          ? err.status === 410
            ? 'That code has expired — request a new one below.'
            : err.status === 429
              ? 'Too many attempts — request a new code below.'
              : err.message
          : 'Unexpected error';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit once the user has entered all 6 digits.
  useEffect(() => {
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      submit(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const onResend = async () => {
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      await api.auth.resendVerification(email);
      setInfo('A new code is on its way. Check your inbox.');
      setCode('');
      submittedFor.current = '';
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Unexpected error';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    // No email context — shouldn't happen through the normal flow; nudge back
    // to login rather than silently accepting a blank form.
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-orange-50/30">
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-4">Missing email for verification.</p>
          <Link
            to="/login"
            className="text-orange-600 font-medium hover:text-orange-800 no-underline"
          >
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-orange-50/30">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a
            href="https://ferrflow.com"
            className="inline-flex items-center gap-2 no-underline mb-6"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ color: '#e8733a' }}>
              <circle cx="16" cy="16" r="4" fill="currentColor" />
              <circle
                cx="16"
                cy="16"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                opacity="0.7"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
            </svg>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Ferr<span style={{ color: '#e8733a' }}>Flow</span>
            </span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            {info}
          </div>
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) submit(code);
          }}
        >
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              autoFocus
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-center tracking-[0.5em] font-mono text-lg text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full py-2.5 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Verifying…' : 'Verify email'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Didn't get the code?{' '}
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="text-orange-600 font-medium hover:text-orange-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0 p-0"
          >
            {resending ? 'Resending…' : 'Resend'}
          </button>
        </p>
        <p className="mt-3 text-center text-sm text-gray-500">
          <Link to="/login" className="text-gray-500 hover:text-gray-700 no-underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
