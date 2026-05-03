import type { ReactNode } from 'react';

export interface TimelineEvent {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const dotStyles = {
  neutral: 'bg-slate-300',
  accent: 'bg-accent',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
} as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <ol className={classes('relative flex flex-col gap-5', className)}>
      <span aria-hidden className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" />
      {events.map((event) => {
        const variant = event.variant ?? 'neutral';
        return (
          <li key={event.id} className="relative pl-8">
            <span
              aria-hidden
              className={classes(
                'absolute left-0 top-1 size-3.5 rounded-full ring-2 ring-white grid place-items-center text-[8px] text-white',
                dotStyles[variant],
              )}
            >
              {event.icon}
            </span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-900">{event.title}</span>
              {event.meta && <span className="text-xs text-slate-500">{event.meta}</span>}
            </div>
            {event.description && (
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{event.description}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
