import { Component, type ErrorInfo, type ReactNode } from 'react';

// Root-of-tree error boundary. Uncaught render/effect errors bubble here
// and render a full-page fallback. Kept intentionally class-based: React
// doesn't expose a hook equivalent, and a bare class with
// componentDidCatch is still the smallest sound implementation.

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  expanded: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, expanded: false };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the console output — it's the one piece of state the user can
    // copy-paste into a support ticket without reproducing the crash.
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render(): ReactNode {
    const { error, expanded } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600 break-words">
            {error.message || 'An unexpected error occurred.'}
          </p>

          <button
            type="button"
            onClick={() => this.setState({ expanded: !expanded })}
            className="mt-4 text-xs font-medium text-orange-600 hover:underline cursor-pointer"
          >
            {expanded ? 'Hide technical details' : 'Show technical details'}
          </button>
          {expanded && (
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-900 text-gray-100 p-3 text-xs whitespace-pre-wrap break-words">
              {error.stack ?? String(error)}
            </pre>
          )}

          <div className="mt-6 flex gap-2 justify-end">
            <a
              href="/"
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go home
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium cursor-pointer"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
