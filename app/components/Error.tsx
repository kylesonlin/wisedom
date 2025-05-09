interface ErrorProps {
  message?: string;
  code?: string;
  severity?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Error({
  message = 'An error occurred',
  code,
  severity = 'error',
  onRetry,
  showDetails = false,
  className,
  children
}: ErrorProps) {
  return (
    <div className={`rounded-lg border p-4 ${severity === 'error' ? 'border-red-200 bg-red-50' : severity === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'} ${className}`}>
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="text-sm font-medium">
            {severity === 'error' ? 'Error' : severity === 'warning' ? 'Warning' : 'Info'}
          </h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
            {code && <p className="mt-1 text-xs opacity-75">Error code: {code}</p>}
          </div>
          {children}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 rounded-md bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
} 