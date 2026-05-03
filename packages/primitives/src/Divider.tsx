import type { HTMLAttributes, ReactNode } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: ReactNode;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Divider({ orientation = 'horizontal', label, className, ...rest }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={classes('inline-block w-px self-stretch bg-slate-200', className)}
        {...rest}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={classes('flex items-center gap-3', className)}
        {...rest}
      >
        <span className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{label}</span>
        <span className="flex-1 h-px bg-slate-200" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={classes('border-0 h-px bg-slate-200 my-0', className)}
      {...rest}
    />
  );
}
