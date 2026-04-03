"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@todo/ui";

type ToastTone = "info" | "success" | "warning" | "danger";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<ToastItem, "id">;

const toneClassName: Record<ToastTone, string> = {
  info: "border-[var(--info-border)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
  success: "border-[var(--success-border)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
  warning: "border-[var(--warning-border)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
  danger: "border-[var(--danger-border)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
};

const toneAccentClassName: Record<ToastTone, string> = {
  info: "bg-[var(--info-text)]",
  success: "bg-[var(--success-text)]",
  warning: "bg-[var(--warning-text)]",
  danger: "bg-[var(--danger-text)]"
};

const ToastContext = createContext<{ pushToast: (toast: ToastInput) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 4200));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [removeToast, toasts]);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={cn("pointer-events-auto overflow-hidden rounded-xl border shadow-sm", toneClassName[toast.tone])}>
            <div className="flex items-start gap-3 p-4">
              <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", toneAccentClassName[toast.tone])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-[var(--text-muted)] transition hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)]"
                onClick={() => removeToast(toast.id)}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
