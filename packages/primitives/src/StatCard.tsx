import type { ReactNode } from 'react';

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  delta?: { value: ReactNode; direction: 'up' | 'down' | 'flat'; positive?: boolean };
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const directionGlyph = { up: '↑', down: '↓', flat: '→' } as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function StatCard({ label, value, delta, hint, icon, className }: StatCardProps) {
  const deltaPositive =
    delta?.positive ??
    (delta?.direction === 'up' ? true : delta?.direction === 'down' ? false : null);
  const deltaColor =
    deltaPositive === null ? 'text-slate-500' : deltaPositive ? 'text-emerald-600' : 'text-red-600';

  return (
    <div
      className={classes(
        'flex flex-col gap-2 p-5 rounded-xl bg-white ring-1 ring-slate-200',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">{label}</div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="text-3xl font-semibold text-slate-900 leading-none">{value}</div>
      {(delta || hint) && (
        <div className="flex items-center gap-2 text-xs">
          {delta && (
            <span className={classes('inline-flex items-center gap-1 font-medium', deltaColor)}>
              <span aria-hidden>{directionGlyph[delta.direction]}</span>
              {delta.value}
            </span>
          )}
          {hint && <span className="text-slate-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
