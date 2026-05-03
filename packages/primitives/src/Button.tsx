import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: 'button';
  };

type ButtonAsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    as: 'a';
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-full',
  md: 'h-10 px-4 text-sm gap-2 rounded-full',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-full',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent/90 hover:shadow-md active:bg-accent/80 active:shadow-sm focus-visible:ring-accent/40 border border-transparent',
  ghost:
    'bg-transparent text-slate-900 hover:bg-slate-900/5 hover:border-slate-400 active:bg-slate-900/10 focus-visible:ring-slate-900/20 border border-slate-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 hover:shadow-md active:bg-red-800 active:shadow-sm focus-visible:ring-red-600/40 border border-transparent',
};

const baseStyles =
  'inline-flex items-center justify-center font-medium leading-none whitespace-nowrap select-none cursor-pointer transition-[background-color,border-color,box-shadow,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      size = 'md',
      loading = false,
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      className,
      children,
      ...rest
    } = props;

    const merged = classes(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && 'w-full',
      className,
    );

    const content = (
      <>
        {loading ? (
          <span
            aria-hidden
            className="inline-block size-3.5 rounded-full border-2 border-current border-r-transparent animate-spin"
          />
        ) : (
          leadingIcon
        )}
        {children}
        {!loading && trailingIcon}
      </>
    );

    if (rest.as === 'a') {
      const { as: _as, ...anchorRest } = rest;
      void _as;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={merged}
          aria-busy={loading || undefined}
          {...anchorRest}
        >
          {content}
        </a>
      );
    }

    const { as: _as, type, disabled, ...buttonRest } = rest as ButtonAsButton;
    void _as;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type ?? 'button'}
        className={merged}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...buttonRest}
      >
        {content}
      </button>
    );
  },
);
