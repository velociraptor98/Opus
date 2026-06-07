import { useEffect } from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="animate-modal modal-glass rounded-3xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="btn-glass shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-error/10 border-error/25">
              <svg
                className="w-6 h-6 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="text-sm text-foreground/70 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn-glass flex-1 px-4 py-2 text-secondary rounded-lg"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              autoFocus
              className="btn-glass flex-1 px-4 py-2 bg-error/80 text-white rounded-lg font-semibold border-error/40"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
