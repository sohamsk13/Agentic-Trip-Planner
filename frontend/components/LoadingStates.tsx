export function TripLoadingSkeleton() {
  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Nav bar */}
      <div className="h-10 border-b border-slate-800 flex items-center px-4 gap-3 flex-shrink-0">
        <div className="w-16 h-4 bg-slate-800 rounded animate-pulse" />
        <div className="w-px h-4 bg-slate-800" />
        <div className="w-32 h-4 bg-slate-800 rounded animate-pulse" />
      </div>
      {/* Header */}
      <div className="h-20 border-b border-slate-800 px-4 py-3 flex-shrink-0">
        <div className="w-48 h-6 bg-slate-800 rounded animate-pulse mb-2" />
        <div className="flex gap-2">
          {[1,2,3,4].map((i) => <div key={i} className="w-20 h-7 bg-slate-800 rounded-lg animate-pulse" />)}
        </div>
      </div>
      {/* Main */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        <div className="hidden lg:block w-64 xl:w-72 bg-slate-900 rounded-xl border border-slate-800 animate-pulse flex-shrink-0" />
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex gap-2 pb-3 border-b border-slate-800">
            {[1,2,3,4,5].map((i) => <div key={i} className="w-24 h-8 bg-slate-800 rounded-lg animate-pulse" />)}
          </div>
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 bg-slate-800 rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 h-20 bg-slate-800 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
        <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col gap-3 flex-shrink-0">
          <div className="h-10 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-500/8 border border-red-500/25 rounded-2xl p-5 w-full max-w-md">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-red-400 font-semibold text-sm mb-1">Something went wrong</h3>
          <p className="text-red-300/70 text-sm leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
            >
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-3xl">
        🗺️
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
