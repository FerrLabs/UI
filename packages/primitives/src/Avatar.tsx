import { useState, type HTMLAttributes } from 'react';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

const sizeStyles = {
  xs: 'size-5 text-[10px]',
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
} as const;

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Avatar({
  name = '',
  src,
  size = 'md',
  shape = 'circle',
  className,
  ...rest
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;
  const initials = initialsFrom(name || '?');

  return (
    <span
      className={classes(
        'inline-flex items-center justify-center font-medium leading-none select-none bg-slate-200 text-slate-700 overflow-hidden',
        shape === 'circle' ? 'rounded-full' : 'rounded-md',
        sizeStyles[size],
        className,
      )}
      title={name || undefined}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || ''}
          className="size-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
