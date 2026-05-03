import type { CSSProperties, ReactNode } from 'react';

export interface Step {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  current: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: CSSProperties;
}

const accent = 'var(--color-accent, var(--color-fg, #1e293b))';
const rule = 'var(--color-rule, rgba(30, 41, 59, 0.14))';

function bubbleStyle(state: 'completed' | 'active' | 'future', size = 28): CSSProperties {
  const base: CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
    fontSize: 12,
    fontWeight: 500,
    flexShrink: 0,
  };
  if (state === 'completed') {
    return { ...base, background: accent, color: '#ffffff' };
  }
  if (state === 'active') {
    return {
      ...base,
      background: 'var(--color-card, #ffffff)',
      color: accent,
      border: `2px solid ${accent}`,
    };
  }
  return {
    ...base,
    background: 'var(--color-paper-2, #f4f4f2)',
    color: 'var(--color-ink-3, #64748b)',
  };
}

function labelStyle(state: 'completed' | 'active' | 'future'): CSSProperties {
  return {
    fontFamily: 'var(--font-serif, "Fraunces", Georgia, ui-serif, serif)',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.3,
    color:
      state === 'active'
        ? 'var(--color-ink, #1e293b)'
        : state === 'completed'
          ? 'var(--color-ink-2, #475569)'
          : 'var(--color-ink-3, #64748b)',
  };
}

const descriptionStyle: CSSProperties = {
  marginTop: 2,
  fontSize: 12,
  lineHeight: 1.3,
  color: 'var(--color-ink-3, #64748b)',
  fontFamily: 'var(--font-serif, "Fraunces", Georgia, ui-serif, serif)',
};

export function Stepper({
  steps,
  current,
  orientation = 'horizontal',
  className,
  style,
}: StepperProps) {
  if (orientation === 'vertical') {
    return (
      <ol
        className={className}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          ...style,
        }}
      >
        {steps.map((step, i) => {
          const completed = i < current;
          const active = i === current;
          const state: 'completed' | 'active' | 'future' = completed
            ? 'completed'
            : active
              ? 'active'
              : 'future';
          return (
            <li
              key={step.id}
              style={{
                position: 'relative',
                display: 'flex',
                gap: 12,
                paddingBottom: i < steps.length - 1 ? 16 : 0,
              }}
            >
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: 30,
                    bottom: 0,
                    width: 1,
                    background: completed ? accent : rule,
                  }}
                />
              )}
              <span aria-hidden style={bubbleStyle(state, 28)}>
                {completed ? '✓' : i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={labelStyle(state)}>{step.label}</div>
                {step.description && <div style={descriptionStyle}>{step.description}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      className={className}
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        width: '100%',
        ...style,
      }}
    >
      {steps.map((step, i) => {
        const completed = i < current;
        const active = i === current;
        const state: 'completed' | 'active' | 'future' = completed
          ? 'completed'
          : active
            ? 'active'
            : 'future';
        return (
          <li
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span aria-hidden style={bubbleStyle(state, 28)}>
                {completed ? '✓' : i + 1}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <div style={labelStyle(state)}>{step.label}</div>
              {step.description && <div style={descriptionStyle}>{step.description}</div>}
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                style={{
                  marginTop: 14,
                  height: 1,
                  flex: 1,
                  alignSelf: 'flex-start',
                  background: completed ? accent : rule,
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
