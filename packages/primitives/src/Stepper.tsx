import type { ReactNode } from 'react';

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
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Stepper({ steps, current, orientation = 'horizontal', className }: StepperProps) {
  if (orientation === 'vertical') {
    return (
      <ol className={classes('flex flex-col gap-4', className)}>
        {steps.map((step, i) => {
          const completed = i < current;
          const active = i === current;
          return (
            <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={classes(
                    'absolute left-3 top-7 bottom-0 w-px',
                    completed ? 'bg-accent' : 'bg-slate-200',
                  )}
                />
              )}
              <span
                aria-hidden
                className={classes(
                  'relative shrink-0 size-6 rounded-full grid place-items-center text-[11px] font-medium ring-2 ring-white',
                  completed && 'bg-accent text-white',
                  active && !completed && 'bg-white text-accent border-2 border-accent',
                  !active && !completed && 'bg-slate-100 text-slate-500',
                )}
              >
                {completed ? '✓' : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className={classes(
                    'text-sm font-medium',
                    active ? 'text-slate-900' : completed ? 'text-slate-700' : 'text-slate-500',
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="mt-0.5 text-xs text-slate-500">{step.description}</div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={classes('flex items-start gap-2 w-full', className)}>
      {steps.map((step, i) => {
        const completed = i < current;
        const active = i === current;
        return (
          <li key={step.id} className="flex items-start gap-2 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <span
                aria-hidden
                className={classes(
                  'size-7 rounded-full grid place-items-center text-xs font-medium',
                  completed && 'bg-accent text-white',
                  active && !completed && 'bg-white text-accent border-2 border-accent',
                  !active && !completed && 'bg-slate-100 text-slate-500',
                )}
              >
                {completed ? '✓' : i + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div
                className={classes(
                  'text-sm font-medium leading-tight',
                  active ? 'text-slate-900' : completed ? 'text-slate-700' : 'text-slate-500',
                )}
              >
                {step.label}
              </div>
              {step.description && (
                <div className="mt-0.5 text-xs text-slate-500 leading-tight">
                  {step.description}
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={classes(
                  'mt-3 h-px flex-1 self-start',
                  completed ? 'bg-accent' : 'bg-slate-200',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
