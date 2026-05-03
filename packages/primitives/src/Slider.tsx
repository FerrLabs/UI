import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'onChange'
> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: ReactNode;
  showValue?: boolean;
  format?: (value: number) => ReactNode;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = false,
    format,
    className,
    disabled,
    id,
    ...rest
  },
  ref,
) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={classes('flex flex-col gap-2 w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <label htmlFor={id} className="font-medium text-slate-700">
              {label}
            </label>
          )}
          {showValue && (
            <span className="font-mono text-slate-600">{format ? format(value) : value}</span>
          )}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        className={classes(
          'w-full h-2 cursor-pointer appearance-none rounded-full bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm',
          '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0',
        )}
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, rgb(226 232 240) ${pct}%, rgb(226 232 240) 100%)`,
        }}
        {...rest}
      />
    </div>
  );
});
