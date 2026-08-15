"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/context/ToastContext";
import { useUpdatePassword } from "@/hooks/useUpdatePassword";
import { ConfirmModal } from "./ConfirmModal";
import { LoadingBars } from "./Mark";
import { Modal } from "./Modal";

interface ChangePasswordModalProps {
  setIsOpen: (open: boolean) => void;
}

/**
 * Lets the signed-in user set a new password directly, without an email
 * reset link. Runs as the current user via supabase.auth.updateUser, gated
 * behind an explicit confirmation step.
 *
 * NOT CURRENTLY REACHABLE. Its only entry point is the Navbar button, which
 * was disabled in 6e5c369 for a reason the history doesn't record. Kept
 * deliberately — see the note in Navbar.tsx before reviving or removing it.
 */
export const ChangePasswordModal = ({ setIsOpen }: ChangePasswordModalProps) => {
  const toast = useToast();
  const titleId = useId();
  const [confirming, setConfirming] = useState(false);
  const { password, setPassword, confirm, setConfirm, error, pending, validate, submit } =
    useUpdatePassword(() => {
      setIsOpen(false);
      toast.show("Password updated", { variant: "success" });
    });

  // Validate the fields first; only surface the confirmation once they're good.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) setConfirming(true);
  };

  // Escape precedence between this and its confirmation step is handled by
  // Modal's stack — only the topmost dialog responds.
  return (
    <Modal
      onClose={() => setIsOpen(false)}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="w-[min(440px,100%)]"
    >
      <form onSubmit={handleSubmit}>
        <div className="dialog-head">
          <h3 id={titleId} style={{ margin: 0, fontSize: 22 }}>
            Change password
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn btn-secondary ml-auto"
            style={{ fontSize: 11, letterSpacing: "0.1em" }}
          >
            CLOSE
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {error && (
            <div
              className="animate-shake px-3 py-2.5"
              style={{
                background: "var(--color-accent-100)",
                borderLeft: "3px solid var(--color-accent)",
                color: "var(--color-accent-800)",
                fontSize: 13,
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <p
            className="m-0 px-3 py-2.5 text-muted"
            style={{
              background: "var(--color-neutral-200)",
              borderLeft: "3px solid var(--color-text)",
              fontSize: 13,
            }}
          >
            This replaces your account password right away — you&apos;ll need the
            new one the next time you sign in.
          </p>

          <div className="field">
            <label htmlFor={`${titleId}-new`}>New password</label>
            <input
              id={`${titleId}-new`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="input"
              autoFocus
              required
            />
          </div>
          <div className="field">
            <label htmlFor={`${titleId}-confirm`}>Confirm password</label>
            <input
              id={`${titleId}-confirm`}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              className="input"
              required
            />
          </div>
        </div>

        <div className="dialog-foot dialog-foot-ruled">
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="btn btn-primary"
            style={{ letterSpacing: "0.08em" }}
          >
            {pending ? (
              <>
                <LoadingBars />
                <span className="sr-only">Updating…</span>
              </>
            ) : (
              "UPDATE PASSWORD"
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn btn-secondary"
            style={{ letterSpacing: "0.08em" }}
          >
            CANCEL
          </button>
        </div>
      </form>

      {confirming &&
        createPortal(
          <ConfirmModal
            title="Update your password?"
            message="This immediately replaces your current password. You'll use the new one to sign in from now on — make sure you'll remember it."
            confirmLabel="Update password"
            onConfirm={() => {
              setConfirming(false);
              submit();
            }}
            onCancel={() => setConfirming(false)}
          />,
          document.body,
        )}
    </Modal>
  );
};
