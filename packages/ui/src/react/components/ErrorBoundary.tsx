import { Component, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';

// Root-of-tree error boundary. Uncaught render/effect errors bubble here
// and render a full-page fallback. Kept intentionally class-based: React
// doesn't expose a hook equivalent, and a bare class with
// componentDidCatch is still the smallest sound implementation.

interface ErrorBoundaryProps {
  children: ReactNode;
  homeHref?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
  expanded: boolean;
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--color-paper, #faf8f4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 512,
  borderRadius: 14,
  border: '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.10))',
  background: 'var(--color-card, #fff)',
  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.12)',
  padding: 24,
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
  fontSize: 20,
  fontWeight: 600,
  color: 'var(--color-ink, #1e293b)',
  margin: 0,
};

const messageStyle: CSSProperties = {
  marginTop: 8,
  marginBottom: 0,
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--color-ink-2, #475569)',
  overflowWrap: 'break-word',
};

const detailsToggleStyle: CSSProperties = {
  marginTop: 16,
  background: 'transparent',
  border: 'none',
  padding: 0,
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--color-accent, var(--color-ink, #1e293b))',
  cursor: 'pointer',
  textDecoration: 'underline',
};

const stackStyle: CSSProperties = {
  marginTop: 8,
  maxHeight: 256,
  overflow: 'auto',
  borderRadius: 10,
  background: 'var(--color-ink, #1e293b)',
  color: 'var(--color-paper, #faf8f4)',
  padding: 12,
  fontSize: 12,
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word',
};

const actionsStyle: CSSProperties = {
  marginTop: 24,
  display: 'flex',
  gap: 8,
  justifyContent: 'flex-end',
};

const ghostActionStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 10,
  border: '1px solid var(--color-rule-strong, rgba(30, 41, 59, 0.28))',
  background: 'transparent',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--color-ink, #1e293b)',
  textDecoration: 'none',
};

const primaryActionStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--color-accent, var(--color-ink, #1e293b))',
  color: '#fff',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
};

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
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Something went wrong</h1>
          <p style={messageStyle}>{error.message || 'An unexpected error occurred.'}</p>

          <button
            type="button"
            onClick={() => this.setState({ expanded: !expanded })}
            style={detailsToggleStyle}
          >
            {expanded ? 'Hide technical details' : 'Show technical details'}
          </button>
          {expanded && <pre style={stackStyle}>{error.stack ?? String(error)}</pre>}

          <div style={actionsStyle}>
            <a href={this.props.homeHref ?? '/'} style={ghostActionStyle}>
              Go home
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={primaryActionStyle}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
