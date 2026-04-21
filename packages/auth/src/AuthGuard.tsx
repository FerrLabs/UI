import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, ApiError, type ApiUser } from '../lib/api';

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: ApiUser }
  | { status: 'anonymous' };

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    api.auth
      .me()
      .then((user) => {
        if (!cancelled) setState({ status: 'authenticated', user });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setState({ status: 'anonymous' });
        } else {
          console.error('auth check failed', err);
          setState({ status: 'anonymous' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (state.status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
