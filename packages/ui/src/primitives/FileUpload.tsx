import { useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react';

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  disabled?: boolean;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  style?: CSSProperties;
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
  style,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [focused, setFocused] = useState(false);
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

  const accent = 'var(--color-accent, var(--color-fg, #1e293b))';
  const dropzoneStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '40px 24px',
    borderRadius: 12,
    border: dragOver
      ? `2px dashed ${accent}`
      : '2px dashed var(--color-rule-strong, rgba(30, 41, 59, 0.24))',
    background: dragOver ? `color-mix(in oklab, ${accent} 5%, transparent)` : 'transparent',
    color: dragOver ? accent : 'var(--color-ink-2, #475569)',
    fontFamily: 'var(--font-serif, "Fraunces", Georgia, ui-serif, serif)',
    fontSize: 14,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : undefined,
    outline: 'none',
    boxShadow: focused ? `0 0 0 4px color-mix(in oklab, ${accent} 14%, transparent)` : 'none',
    transition: 'border-color 160ms, background 160ms, color 160ms, box-shadow 140ms',
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}
    >
      {label && (
        <span
          className="mono"
          style={{
            fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-3, #64748b)',
          }}
        >
          {label}
        </span>
      )}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={dropzoneStyle}
        onMouseEnter={(e) => {
          if (disabled || dragOver) return;
          e.currentTarget.style.borderColor = 'var(--color-ink-3, #64748b)';
          e.currentTarget.style.background = 'var(--color-paper-2, #f4f4f2)';
        }}
        onMouseLeave={(e) => {
          if (disabled || dragOver) return;
          e.currentTarget.style.borderColor = 'var(--color-rule-strong, rgba(30, 41, 59, 0.24))';
          e.currentTarget.style.background = 'transparent';
        }}
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 500 }}>
            <span style={{ color: accent }}>Click to upload</span>
            {' or drag and drop'}
          </div>
          {(accept || maxSizeMB) && (
            <div
              className="mono"
              style={{
                marginTop: 4,
                fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                fontSize: 11,
                color: 'var(--color-ink-3, #64748b)',
              }}
            >
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
          style={{ display: 'none' }}
          onChange={(e) => handle(e.currentTarget.files)}
        />
      </div>
      {hint && !error && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--color-ink-3, #64748b)',
          }}
        >
          {hint}
        </p>
      )}
      {error && <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{error}</p>}
    </div>
  );
}
