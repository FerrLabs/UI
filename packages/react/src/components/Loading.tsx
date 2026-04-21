interface ErrorBoxProps {
  error: Error;
  onRetry?: () => void;
}

export function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-spin text-gray-400`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        opacity="0.75"
      />
    </svg>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

export function ErrorBox({ error, onRetry }: ErrorBoxProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-6 text-sm">
      <div className="font-medium text-red-800">Something went wrong</div>
      <div className="mt-1 text-red-700 break-words">{error.message}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-700 text-xs font-medium hover:bg-red-50 cursor-pointer"
          style={{ fontFamily: 'inherit' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
