"use client";

import { useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { useUpdatePassword } from "@/hooks/useUpdatePassword";

interface ChangePasswordModalProps {
  setIsOpen: (open: boolean) => void;
}

/**
 * Lets the signed-in user set a new password directly, without an email
 * reset link. Runs as the current user via supabase.auth.updateUser.
 */
export const ChangePasswordModal = ({ setIsOpen }: ChangePasswordModalProps) => {
  const toast = useToast();
  const { password, setPassword, confirm, setConfirm, error, pending, handleSubmit } =
    useUpdatePassword(() => {
      setIsOpen(false);
      toast.show("Password updated", { variant: "success" });
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setIsOpen]);

  const labelCls =
    "block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-1";

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="animate-modal modal-glass rounded-3xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary dark:text-primary">
            Change password
          </h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-secondary hover:text-primary transition-colors"
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

          <div className="pt-4 border-t border-secondary/10 dark:border-zinc-800 flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-glass flex-1 px-4 py-2 text-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="btn-glass flex-1 px-4 py-2 bg-primary/80 dark:bg-secondary/70 text-white rounded-lg font-semibold border-primary/40 dark:border-secondary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
