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
      panelClassName="w-[min(420px,100%)]"
    >
      <div className="dialog-head">
        {/* The warning is a filled coral block, not an icon: in this system a
            solid accent shape is the loudest thing on the page. */}
        <span
          aria-hidden="true"
          className="shrink-0"
          style={{ width: 6, height: 34, background: "var(--color-accent)" }}
        />
        <h3 id={titleId} style={{ margin: 0, fontSize: 20 }}>
          {title}
        </h3>
      </div>
      <p className="text-muted px-6 py-5 m-0" style={{ fontSize: 14 }}>
        {message}
      </p>
      <div className="dialog-foot dialog-foot-ruled">
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className="btn btn-danger"
          style={{ letterSpacing: "0.08em" }}
        >
          {confirmLabel.toUpperCase()}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          style={{ letterSpacing: "0.08em" }}
        >
          {cancelLabel.toUpperCase()}
        </button>
      </div>
    </Modal>
  );
};
