import { useId } from "react";
import { Modal } from "./Modal";

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
  const titleId = useId();

  return (
    <Modal
      onClose={onCancel}
      role="alertdialog"
      labelledBy={titleId}
      panelClassName="max-w-sm"
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
            <h3 id={titleId} className="text-lg font-bold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-foreground/75 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn-glass flex-1 px-4 py-2 text-foreground/75 rounded-lg"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="btn-glass flex-1 px-4 py-2 bg-error text-paper rounded-lg font-semibold border-error"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
