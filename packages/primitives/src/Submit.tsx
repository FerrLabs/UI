import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface SubmitProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'children'
> {
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full text-sm font-medium leading-none whitespace-nowrap select-none border border-transparent bg-accent text-white transition-colors duration-150 hover:bg-accent/90 active:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Submit = forwardRef<HTMLButtonElement, SubmitProps>(function Submit(
  { loading = false, fullWidth = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="submit"
      className={classes(baseStyles, fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="inline-block size-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"
        />
      )}
      {children}
    </button>
  );
});
