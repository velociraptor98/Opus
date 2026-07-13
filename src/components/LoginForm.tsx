"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BreathDots, BreathRule } from "./Breath";

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="modal-glass p-8 rounded-3xl w-full max-w-md">
        <div className="text-center mb-8">
          {/* The Opus wordmark, exhaling — same gesture as the navbar. */}
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="text-4xl font-semibold lowercase tracking-tight leading-none text-ink">
              opus
            </span>
            <BreathRule className="text-[0.95rem] pr-1" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-foreground/75">
            Sign in to your job search tracker
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 animate-shake">
            <svg
              className="w-5 h-5 text-error"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="input-glass w-full px-4 py-3 rounded-xl"
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/80 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="input-glass w-full px-4 py-3 rounded-xl"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="btn-glass w-full py-3.5 bg-breath text-paper rounded-xl font-semibold text-base border-breath mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-h-[3.25rem]"
          >
            {pending ? (
              <>
                <BreathDots loading />
                <span className="sr-only">Signing in…</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
