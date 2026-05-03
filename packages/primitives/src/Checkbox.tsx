import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'children'
> {
  label?: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
  indeterminate?: boolean;
}

const inputStyles =
  'peer appearance-none size-4 rounded border border-slate-300 bg-white cursor-pointer transition-colors duration-150 checked:bg-accent checked:border-accent indeterminate:bg-accent indeterminate:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

const checkmark =
  'after:content-[\'\'] after:absolute after:inset-0 after:bg-no-repeat after:bg-center after:opacity-0 peer-checked:after:opacity-100 peer-indeterminate:after:opacity-100 peer-checked:after:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2016%2016%27%20fill%3D%27none%27%3E%3Cpath%20stroke%3D%27white%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%272%27%20d%3D%27m4%208%203%203%205-6%27/%3E%3C/svg%3E")] peer-indeterminate:after:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2016%2016%27%20fill%3D%27none%27%3E%3Cpath%20stroke%3D%27white%27%20stroke-linecap%3D%27round%27%20stroke-width%3D%272%27%20d%3D%27M4%208h8%27/%3E%3C/svg%3E")] after:pointer-events-none';

const invalidStyles = 'border-red-500 focus-visible:ring-red-500/40';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, invalid, indeterminate, className, disabled, id, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const inputElement = (
    <span className={classes('relative inline-block size-4 shrink-0', checkmark)}>
      <input
        ref={innerRef}
        id={id}
        type="checkbox"
        disabled={disabled}
        className={classes(inputStyles, invalid && invalidStyles)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </span>
  );

  if (!label && !hint) {
    return <span className={className}>{inputElement}</span>;
  }

  return (
    <label
      className={classes(
        'inline-flex items-start gap-2.5 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      {inputElement}
      <span className="flex flex-col gap-0.5">
        {label && <span className="text-sm text-slate-900 leading-tight">{label}</span>}
        {hint && <span className="text-xs text-slate-500 leading-tight">{hint}</span>}
      </span>
    </label>
  );
});
