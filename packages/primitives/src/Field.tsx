import { useId, type ReactNode } from 'react';

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  trailingLabel?: ReactNode;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Field({
  label,
  hint,
  error,
  required,
  optional,
  trailingLabel,
  children,
  className,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={classes('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium tracking-wide text-slate-700">
          {label}
          {required && (
            <span aria-hidden className="ml-1 text-red-600">
              *
            </span>
          )}
          {optional && !required && (
            <span className="ml-1 text-slate-400 font-normal">(optional)</span>
          )}
        </label>
        {trailingLabel && <div className="text-xs">{trailingLabel}</div>}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
