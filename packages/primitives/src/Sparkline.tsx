import type { CSSProperties } from 'react';

export interface SparklineProps {
  /** Numeric series. Empty / single-element arrays render as a single low bar. */
  data: number[];
  /** Pixel height. Defaults to 22 (md). Use 16 for inline mini sparks. */
  height?: number;
  /** Bar width in px. Default 3. */
  barWidth?: number;
  /** Gap between bars in px. Default 1.5. */
  gap?: number;
  /**
   * Number of trailing bars rendered at full opacity. Earlier bars fade.
   * Useful for "recent activity stands out". Default 3, set to `data.length`
   * to render all at full opacity.
   */
  recentCount?: number;
  /**
   * Color used for every bar. Resolved via `currentColor`, so the consumer
   * can also set `color` via inline style or className.
   */
  color?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

/**
 * Compact bar-graph sparkline. No axes, no tooltips — just visual pulse.
 * Use inside a row to show the last N data points (calls, errors, latency).
 * For real charts with hover / scales, reach for a charting lib.
 */
export function Sparkline({
  data,
  height = 22,
  barWidth = 3,
  gap = 1.5,
  recentCount = 3,
  color,
  className,
  style,
  ariaLabel,
}: SparklineProps) {
  const max = Math.max(1, ...data);
  const fadeAt = Math.max(0, data.length - recentCount);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap,
        height,
        color: color ?? 'var(--color-accent, currentColor)',
        ...style,
      }}
    >
      {data.map((v, i) => (
        <span
          key={i}
          style={{
            width: barWidth,
            height: `${Math.max(2, (v / max) * 100)}%`,
            background: 'currentColor',
            opacity: i >= fadeAt ? 0.95 : 0.35,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
