import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

interface RadioGroupContextValue {
  name: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  name?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  ariaLabel?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function RadioGroup({
  name,
  value,
  onChange,
  disabled,
  children,
  orientation = 'vertical',
  className,
  ariaLabel,
}: RadioGroupProps) {
  const fallbackName = useId();
  return (
    <RadioGroupContext.Provider value={{ name: name ?? fallbackName, value, onChange, disabled }}>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={classes(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row gap-4',
          className,
        )}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'children'
> {
  value: string | number;
  label?: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
}

const inputStyles =
  'peer appearance-none size-4 rounded-full border border-slate-300 bg-white cursor-pointer transition-colors duration-150 checked:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

const dot =
  "after:content-[''] after:absolute after:inset-1 after:rounded-full after:bg-accent after:opacity-0 peer-checked:after:opacity-100 after:pointer-events-none after:transition-opacity";

const invalidStyles = 'border-red-500 focus-visible:ring-red-500/40';

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, hint, invalid, className, disabled, id, ...rest },
  ref,
) {
  const ctx = useContext(RadioGroupContext);
  const checked = ctx?.value !== undefined ? String(ctx.value) === String(value) : undefined;
  const isDisabled = disabled || ctx?.disabled;

  const inputElement = (
    <span className={classes('relative inline-block size-4 shrink-0', dot)}>
      <input
        ref={ref}
        id={id}
        type="radio"
        name={ctx?.name}
        value={value}
        checked={checked}
        disabled={isDisabled}
        onChange={(e) => ctx?.onChange?.(e.currentTarget.value)}
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
        isDisabled && 'cursor-not-allowed opacity-60',
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
