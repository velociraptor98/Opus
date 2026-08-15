"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ShowOptions {
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, opts?: ShowOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

/**
 * Toasts carry one rule of colour on their leading edge and nothing else — a
 * coral bar for anything that failed or needs you, ink for the rest. No icons:
 * in this system a filled block already means "look here".
 */
const VARIANT_RULE: Record<ToastVariant, string> = {
  success: "var(--color-text)",
  error: "var(--color-accent)",
  info: "var(--color-neutral-500)",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="animate-toast pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3 min-w-[280px] max-w-[calc(100vw-2rem)]"
      style={{
        background: "var(--color-bg)",
        borderLeft: `4px solid ${VARIANT_RULE[toast.variant]}`,
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <span className="flex-1" style={{ fontSize: 13 }}>
        {toast.message}
      </span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
          className="op-lnk eyebrow shrink-0"
          style={{ color: "var(--color-accent-700)" }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="op-lnk text-muted shrink-0"
        style={{ fontSize: 16, lineHeight: 1 }}
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, opts: ShowOptions = {}) => {
      const id = (idRef.current += 1);
      const duration = opts.duration ?? 4000;
      setToasts((current) => [
        ...current,
        {
          id,
          message,
          variant: opts.variant ?? "info",
          action: opts.action,
        },
      ]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2 pointer-events-none">
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={() => dismiss(toast.id)}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}
