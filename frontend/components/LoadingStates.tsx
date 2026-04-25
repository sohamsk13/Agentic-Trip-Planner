export function TripLoadingSkeleton() {
  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Header skeleton */}
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="w-32 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
          <div className="w-20 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left sidebar skeleton */}
        <div className="hidden lg:flex lg:w-80 flex-col gap-4">
          <div className="h-full bg-slate-900 rounded-lg border border-slate-700 p-4">
            <div className="h-full space-y-4">
              <div className="h-20 bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="h-40 bg-slate-800 rounded-lg animate-pulse"></div>
              <div className="h-20 bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Center timeline skeleton */}
        <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden p-4">
          <div className="space-y-6">
            <div className="h-48 bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel skeleton */}
        <div className="hidden lg:flex lg:w-96 flex-col gap-4">
          <div className="h-full bg-slate-900 rounded-lg border border-slate-700 p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormLoadingState() {
  return (
    <div className="w-full space-y-4">
      <div className="h-24 bg-slate-800 rounded-lg animate-pulse"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-800 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="h-12 bg-blue-600 rounded-lg animate-pulse"></div>
    </div>
  );
}

export function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            className="w-3 h-3 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold text-sm mb-1">
            Error generating trip
          </h3>
          <p className="text-red-300/80 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs">{description}</p>
    </div>
  );
}
