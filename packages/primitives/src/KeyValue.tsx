import type { ReactNode } from 'react';

export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  orientation?: 'vertical' | 'horizontal';
  density?: 'compact' | 'normal';
  className?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function KeyValue({
  items,
  orientation = 'horizontal',
  density = 'normal',
  className,
}: KeyValueProps) {
  const gap = density === 'compact' ? 'gap-y-2' : 'gap-y-3';
  const labelStyles = 'text-xs font-mono uppercase tracking-wider text-slate-500';
  const valueStyles = 'text-sm text-slate-900';

  if (orientation === 'vertical') {
    return (
      <dl className={classes('flex flex-col', gap, className)}>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <dt className={labelStyles}>{item.label}</dt>
            <dd className={valueStyles}>{item.value}</dd>
            {item.hint && <p className="text-xs text-slate-500">{item.hint}</p>}
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={classes('grid grid-cols-[max-content_1fr] gap-x-6', gap, className)}>
      {items.map((item, i) => (
        <div key={i} className="contents">
          <dt className={classes(labelStyles, 'self-start pt-0.5 whitespace-nowrap')}>
            {item.label}
          </dt>
          <dd className="flex flex-col">
            <span className={valueStyles}>{item.value}</span>
            {item.hint && <span className="text-xs text-slate-500 mt-0.5">{item.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
