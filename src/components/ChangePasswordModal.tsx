"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/context/ToastContext";
import { useUpdatePassword } from "@/hooks/useUpdatePassword";
import { ConfirmModal } from "./ConfirmModal";
import { BreathDots } from "./Breath";

interface ChangePasswordModalProps {
  setIsOpen: (open: boolean) => void;
}

/**
 * Lets the signed-in user set a new password directly, without an email
 * reset link. Runs as the current user via supabase.auth.updateUser, gated
 * behind an explicit confirmation step.
 */
export const ChangePasswordModal = ({ setIsOpen }: ChangePasswordModalProps) => {
  const toast = useToast();
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // While the confirmation is up, let it own the Escape key.
      if (e.key === "Escape" && !confirming) setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setIsOpen, confirming]);

  const labelCls =
    "block text-xs font-bold text-foreground/75 uppercase tracking-widest mb-1";

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="animate-modal modal-glass rounded-3xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">
            Change password
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-foreground/60 hover:text-breath transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2 animate-shake">
              <svg
                className="w-5 h-5 text-error shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-error font-medium text-sm">{error}</span>
            </div>
          )}

          <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg flex items-start gap-2">
            <svg
              className="w-5 h-5 text-breath shrink-0 mt-0.5"
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
            <span className="text-foreground/75 text-sm">
              This replaces your account password right away — you&apos;ll need
              the new one the next time you sign in.
            </span>
          </div>

          <div>
            <label className={labelCls}>New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              className="input-glass w-full px-3 py-2 rounded-lg"
              autoFocus
              required
            />
          </div>
          <div>
            <label className={labelCls}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              className="input-glass w-full px-3 py-2 rounded-lg"
              required
            />
          </div>

          <div className="pt-4 border-t border-foreground/10 flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-glass flex-1 px-4 py-2 text-foreground/75 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="btn-glass flex-1 px-4 py-2 bg-breath text-paper rounded-lg font-semibold border-breath disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-h-[2.5rem]"
            >
              {pending ? (
                <>
                  <BreathDots loading />
                  <span className="sr-only">Updating…</span>
                </>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      </div>

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
    </div>
  );
};
