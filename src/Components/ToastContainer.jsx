import { useEffect, useState } from "react";
import { storeEvents, TOAST_NOTIFICATION } from "../utils/cartWishlistEvents";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = storeEvents.on(TOAST_NOTIFICATION, (toast) => {
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration || 3000);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";
        const isWarning = toast.type === "warning";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? "bg-slate-900/95 text-white border-emerald-500/30"
                : isError
                ? "bg-rose-950/95 text-white border-rose-500/30"
                : isWarning
                ? "bg-amber-950/95 text-white border-amber-500/30"
                : "bg-slate-900/95 text-white border-slate-700/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {isSuccess ? "✓" : isError ? "✕" : isWarning ? "⚠" : "ℹ"}
              </span>
              <p className="text-xs sm:text-sm font-medium">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition p-1 text-sm font-bold leading-none cursor-pointer"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
