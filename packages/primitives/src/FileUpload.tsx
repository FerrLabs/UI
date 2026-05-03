import { useRef, useState, type DragEvent, type ReactNode } from 'react';

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  disabled?: boolean;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
  return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

export function FileUpload({
  onFiles,
  accept,
  multiple = false,
  maxSizeMB,
  disabled = false,
  label,
  hint,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handle(files: FileList | null) {
    if (!files) return;
    setError(null);
    const list = Array.from(files);
    if (maxSizeMB) {
      const tooBig = list.find((f) => f.size > maxSizeMB * 1024 * 1024);
      if (tooBig) {
        setError(`${tooBig.name} exceeds the ${maxSizeMB} MB limit.`);
        return;
      }
    }
    onFiles(list);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handle(e.dataTransfer.files);
  }

  return (
    <div className={classes('flex flex-col gap-1.5', className)}>
      {label && <span className="text-xs font-medium tracking-wide text-slate-700">{label}</span>}
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={classes(
          'flex flex-col items-center justify-center gap-2 px-6 py-10 rounded-lg border-2 border-dashed text-sm cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
          dragOver
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 16V4m0 0-4 4m4-4 4 4M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="text-center">
          <div className="font-medium">
            <span className="text-accent">Click to upload</span>
            {' or drag and drop'}
          </div>
          {(accept || maxSizeMB) && (
            <div className="mt-1 text-xs text-slate-500">
              {accept && <span>{accept.replace(/\./g, '').toUpperCase()}</span>}
              {accept && maxSizeMB && <span> · </span>}
              {maxSizeMB && <span>up to {formatBytes(maxSizeMB * 1024 * 1024)}</span>}
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => handle(e.currentTarget.files)}
        />
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
