export default function ErrorState({
  title = "Something went wrong",
  message = "Unable to connect to the server. Please check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/50 p-8 sm:p-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-xl font-bold mb-3">
        ⚠️
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 cursor-pointer active:scale-95"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
