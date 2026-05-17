import type { ReactNode } from 'react';
import { LogoMark } from '../app/LogoMark.js';
import { AUTH_CLIENTS, type AuthClientKey } from './clients.js';

export type AuthMode = 'login' | 'signup';

export interface AuthLayoutProps {
  /** Which product the user is being redirected back to after sign-in. */
  client: AuthClientKey;
  mode: AuthMode;

  /** OAuth scopes being requested — shown as small pills on the dark panel. */
  scopes?: string[];

  /** Current language code (e.g. 'en', 'fr'). The toggle is rendered above
   * the form; the caller decides what `setLang` does (URL push, etc.). */
  lang: string;
  langs?: string[];
  onLangChange?: (lang: string) => void;

  /** Form area — typically `<form>...fields...</form>` rendered by the page. */
  children: ReactNode;
}

const DEFAULT_SCOPES = ['openid', 'profile', 'email'];

/**
 * Split-panel auth layout — dark editorial brand panel on the left,
 * form on the right. Per-product accent colour is set on `:root` via
 * inline style so child styles can pick it up via `--accent` /
 * `--accent-soft` (the bundle's contract).
 */
export function AuthLayout({
  client,
  mode,
  scopes,
  lang,
  langs = ['en', 'fr'],
  onLangChange,
  children,
}: AuthLayoutProps) {
  const c = AUTH_CLIENTS[client];
  return (
    <>
      {/* Inject accent overrides scoped to this layout so each instance
       * picks up the right colour without polluting the global :root. */}
      <style>{`
        .ferrlabs-auth { --accent: ${c.color}; --accent-soft: ${c.soft}; }
      `}</style>

      <div
        className="ferrlabs-auth"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
          minHeight: '100vh',
        }}
      >
        <BrandPanel client={client} mode={mode} scopes={scopes ?? DEFAULT_SCOPES} />

        <div
          style={{
            background: 'var(--color-bg)',
            padding: '48px 56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Lang switch top-right */}
          {onLangChange && langs.length > 1 && (
            <div
              className="mono"
              style={{
                position: 'absolute',
                top: 28,
                right: 32,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--color-rule)',
                borderRadius: 999,
                overflow: 'hidden',
                background: 'var(--color-card)',
              }}
            >
              {langs.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLangChange(l)}
                  style={{
                    background: lang === l ? 'var(--color-fg)' : 'transparent',
                    color: lang === l ? 'var(--color-bg)' : 'var(--color-fg-2)',
                    border: 'none',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          <div style={{ width: '100%', maxWidth: 440 }}>{children}</div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .ferrlabs-auth { grid-template-columns: 1fr !important; }
          .ferrlabs-auth > aside { display: none !important; }
        }
      `}</style>
    </>
  );
}

function BrandPanel({
  client,
  mode,
  scopes,
}: {
  client: AuthClientKey;
  mode: AuthMode;
  scopes: string[];
}) {
  const c = AUTH_CLIENTS[client];
  return (
    <aside
      style={{
        background: 'var(--accent)',
        color: '#fff',
        padding: '56px 56px 48px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(900px 600px at 110% 0%, color-mix(in oklab, var(--accent-soft) 14%, transparent), transparent 60%), radial-gradient(700px 500px at -10% 110%, rgba(255,255,255,0.06), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <FerrlabsMark size={26} />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: '-0.02em',
          }}
        >
          ferrlabs
        </span>
        <span
          className="mono"
          style={{
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.1em',
            marginLeft: 4,
            padding: '4px 8px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
          }}
        >
          AUTH
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          maxWidth: 460,
          position: 'relative',
          zIndex: 1,
          marginTop: 64,
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          № — One sign-in
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            fontSize: 48,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          One identity for <span style={{ fontStyle: 'italic', fontWeight: 300 }}>every</span> tool
          we make.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            fontSize: 16,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.78)',
            maxWidth: 420,
            margin: 0,
          }}
        >
          {mode === 'login'
            ? 'Sign in once. Your session works across FerrFlow, FerrVault, FerrTrack and FerrGrowth — and any third-party app you connect via OIDC.'
            : 'Your account follows you across every product. SCIM, SAML, and self-hosted available on the Team plan.'}
        </p>

        <Constellation activeClient={client} />
      </div>

      {/* OIDC client card — what's being authorized */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: 18,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          backdropFilter: 'blur(8px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {client === 'ferrlabs' ? (
            <FerrlabsMark size={22} />
          ) : (
            <LogoMark accent="#fff" product={client} size={22} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Signing in to
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 18,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              marginTop: 2,
            }}
          >
            {c.name}
            <span
              className="mono"
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.05em',
                marginLeft: 8,
                fontWeight: 400,
              }}
            >
              {c.hostHint}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {scopes.map((s) => (
              <span
                key={s}
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  padding: '5px 9px',
                  borderRadius: 999,
                  color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function FerrlabsMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <text x="3" y="22" fontFamily="DM Mono, monospace" fontSize="11" fill="#fff" opacity="0.5">
        [
      </text>
      <text
        x="9"
        y="23"
        fontFamily="Fraunces, serif"
        fontWeight="900"
        fontSize="20"
        fill="#fff"
        letterSpacing="-1"
      >
        FL
      </text>
      <text x="26" y="22" fontFamily="DM Mono, monospace" fontSize="11" fill="#fff" opacity="0.5">
        ]
      </text>
    </svg>
  );
}

const CONSTELLATION_PRODUCTS: { key: AuthClientKey; y: number }[] = [
  { key: 'ferrflow', y: 30 },
  { key: 'ferrvault', y: 90 },
  { key: 'ferrtrack', y: 150 },
  { key: 'ferrgrowth', y: 210 },
];

function Constellation({ activeClient }: { activeClient: AuthClientKey }) {
  const cx = 56;
  const cy = 120;
  const px = 280;
  return (
    <div style={{ marginTop: 8 }}>
      <span
        className="mono"
        style={{
          fontSize: 10.5,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        One account · four products
      </span>
      <svg
        viewBox="0 0 380 240"
        style={{ width: '100%', height: 'auto', marginTop: 14, display: 'block' }}
      >
        {CONSTELLATION_PRODUCTS.map((p) => {
          const isActive = p.key === activeClient;
          const midX = (cx + px) / 2;
          const d = `M ${cx} ${cy} C ${midX} ${cy}, ${midX} ${p.y}, ${px} ${p.y}`;
          return (
            <g key={p.key}>
              <path
                d={d}
                fill="none"
                stroke={isActive ? 'var(--accent-soft)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={isActive ? 1.6 : 0.9}
              />
              <circle
                cx={px}
                cy={p.y}
                r={isActive ? 9 : 6}
                fill={isActive ? 'var(--accent-soft)' : 'rgba(255,255,255,0.12)'}
                stroke={isActive ? '#fff' : 'rgba(255,255,255,0.4)'}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x={px + 18}
                y={p.y + 4}
                fontFamily="DM Mono, monospace"
                fontSize="11"
                fill={isActive ? '#fff' : 'rgba(255,255,255,0.55)'}
                letterSpacing="0.06em"
              >
                {AUTH_CLIENTS[p.key].name}
              </text>
            </g>
          );
        })}
        {/* Identity node (ferrlabs) */}
        <circle cx={cx} cy={cy} r="14" fill="rgba(255,255,255,0.14)" />
        <circle cx={cx} cy={cy} r="7" fill="#fff" />
        <text
          x={cx}
          y={cy + 28}
          textAnchor="middle"
          fontFamily="DM Mono, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.6)"
          letterSpacing="0.12em"
        >
          you
        </text>
      </svg>
    </div>
  );
}
