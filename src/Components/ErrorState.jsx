export default function ErrorState({
  title = "Something went wrong",
  message = "Unable to connect to the server. Please check your connection and try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700 text-xl font-bold mb-3">
        ⚠️
      </div>
      <h3 className="font-editorial text-lg sm:text-xl font-normal text-stone-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-stone-500 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full bg-stone-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 cursor-pointer active:scale-95"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
