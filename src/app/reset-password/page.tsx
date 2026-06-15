"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { show } = useToast();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // The recovery link routes through /auth/callback, which exchanges the
  // code for a session before landing here. If there's no session the link
  // was invalid or expired.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }

    show("Password updated — you're all set!", { variant: "success" });
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] transition-colors">
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="modal-glass p-8 rounded-3xl w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-primary dark:text-primary mb-1">
                Set a new password
              </h2>
              <p className="text-sm text-foreground/70">
                Choose a new password for your account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 animate-shake">
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
                <span className="text-error font-medium">{error}</span>
              </div>
            )}

            {checking ? (
              <p className="text-center text-sm text-foreground/60 py-4">
                Verifying your reset link…
              </p>
            ) : hasSession ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">
                    New password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="input-glass w-full px-4 py-3 rounded-xl"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    name="confirm"
                    className="input-glass w-full px-4 py-3 rounded-xl"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={pending}
                  className="btn-glass w-full py-3.5 bg-primary/80 dark:bg-primary/70 text-white rounded-xl font-bold text-base border-primary/40 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? "Updating…" : "Update password"}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-foreground/70">
                  This reset link is invalid or has expired. Request a new one
                  from the sign-in page.
                </p>
                <button
                  type="button"
                  onClick={() => router.replace("/")}
                  className="btn-glass w-full py-3.5 bg-primary/80 dark:bg-primary/70 text-white rounded-xl font-bold text-base border-primary/40"
                >
                  Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
