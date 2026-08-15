"use client";

import { useEffect, useRef } from "react";

/** Everything focusable we might find inside a dialog. */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
]
  .map((s) => `${s}:not([hidden])`)
  .join(", ");

/**
 * Open dialogs, innermost last. Modals can nest — a confirmation on top of a
 * form — and every one of them listens on window, so without this a single
 * Escape would close the whole stack instead of just the dialog on top.
 */
const openModals: symbol[] = [];

interface ModalProps {
  /** Accessible name — rendered by the caller, referenced here by id. */
  labelledBy?: string;
  /** Falls back to a literal label when there's no visible title to point at. */
  label?: string;
  onClose: () => void;
  /** `alertdialog` for a destructive confirmation, `dialog` otherwise. */
  role?: "dialog" | "alertdialog";
  /** Width/height classes for the panel, e.g. "w-[min(620px,100%)]". */
  panelClassName?: string;
  /** Clicking the backdrop closes by default; opt out for long forms. */
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
}

/**
 * The shared dialog shell: backdrop, panel, and the accessibility behaviour
 * every modal needs and none of them had — a labelled `dialog` role, Escape to
 * close, focus moved in on open and returned to the trigger on close, and a
 * Tab loop so keyboard users can't wander into the page behind the overlay.
 *
 * Callers render their own header and body; this owns only the shell.
 */
export const Modal = ({
  labelledBy,
  label,
  onClose,
  role = "dialog",
  panelClassName = "",
  closeOnBackdrop = true,
  children,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  // Whatever had focus when the dialog opened, so it can be handed back.
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const idRef = useRef<symbol>(undefined);
  if (idRef.current === undefined) idRef.current = Symbol("modal");

  useEffect(() => {
    const id = idRef.current!;
    openModals.push(id);
    return () => {
      const at = openModals.indexOf(id);
      if (at !== -1) openModals.splice(at, 1);
    };
  }, []);

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    // React has already honoured any `autoFocus` prop by the time this runs
    // (ConfirmModal puts one on the confirm button), and it leaves no
    // attribute behind to look for — so treat focus already being inside the
    // panel as deliberate and don't fight it. Otherwise start at the first
    // focusable thing, falling back to the panel so focus is never stranded
    // on the page behind the overlay.
    if (panel && !panel.contains(document.activeElement)) {
      (panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus();
    }

    return () => returnFocusRef.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Only the dialog on top of the stack answers the keyboard.
      if (openModals[openModals.length - 1] !== idRef.current) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      // Wrap at both ends so Tab and Shift+Tab stay inside the dialog.
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!panel.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="dialog-backdrop animate-backdrop"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`dialog animate-modal ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
