import { useState, type HTMLAttributes, type ReactNode } from 'react';

export interface CodeProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Code({ children, className, ...rest }: CodeProps) {
  return (
    <code
      className={classes(
        'inline px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[0.92em]',
        className,
      )}
      {...rest}
    >
      {children}
    </code>
  );
}

export interface CodeBlockProps {
  children: string;
  language?: ReactNode;
  filename?: ReactNode;
  copyable?: boolean;
  className?: string;
}

export function CodeBlock({
  children,
  language,
  filename,
  copyable = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className={classes('rounded-lg ring-1 ring-slate-200 bg-slate-50 overflow-hidden', className)}
    >
      {(filename || language || copyable) && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2 min-w-0">
            {filename && (
              <span className="text-xs font-mono text-slate-700 truncate">{filename}</span>
            )}
            {language && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {language}
              </span>
            )}
          </div>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-slate-800">
        <code>{children}</code>
      </pre>
    </div>
  );
}
