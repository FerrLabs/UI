import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const baseStyles =
  'w-full min-h-24 rounded-md bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 px-3 py-2 text-sm leading-relaxed transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed resize-y';

const invalidStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/30';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classes(baseStyles, invalid && invalidStyles, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
