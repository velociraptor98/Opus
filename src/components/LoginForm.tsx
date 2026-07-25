"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BreathDots } from "./Breath";

type Mode = "signin" | "signup";

const copy = {
  signin: {
    heading: "Welcome back",
    sub: "Sign in to your job search tracker",
    submit: "Sign In",
    busy: "Signing in…",
    switchPrompt: "New here?",
    switchAction: "Create an account",
  },
  signup: {
    heading: "Create your account",
    sub: "Start tracking your job search",
    submit: "Create Account",
    busy: "Creating account…",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
  },
} as const;

const LoginForm = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const text = copy[mode];

  // Swapping modes clears anything left over from the other one — an error
  // about a wrong password makes no sense above a fresh sign-up form.
  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (mode === "signup") {
      const confirm = String(formData.get("confirm") ?? "");
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setPending(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setPending(false);
        return;
      }

      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setPending(false);
      return;
    }

    // With email confirmation switched off in Supabase, sign-up hands back a
    // session straight away and the user is in. If the project ever turns
    // confirmations back on there's no session here, so say so rather than
    // leaving them staring at an unchanged form.
    if (!data.session) {
      setNotice("Check your email to confirm your account, then sign in.");
      setMode("signin");
      setPending(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="modal-glass p-8 rounded-3xl w-full max-w-md">
        {/* No wordmark here — the navbar carries it directly above this card,
            and repeating it just pushes the form down the page. */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-foreground mb-1">
            {text.heading}
          </h2>
          <p className="text-sm text-foreground/75">{text.sub}</p>
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

        {notice && (
          <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center gap-3">
            <svg
              className="w-5 h-5 text-breath shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-foreground/80 font-medium">{notice}</span>
          </div>
        )}

        {/* Remounting on mode change wipes the fields, so a password typed on
            one form never carries into the other. */}
        <form key={mode} onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-foreground/80 mb-2 ml-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              className="input-glass w-full px-4 py-3 rounded-xl"
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-foreground/80 mb-2 ml-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              className="input-glass w-full px-4 py-3 rounded-xl"
              placeholder={
                mode === "signup" ? "At least 8 characters" : "Enter password"
              }
              required
            />
          </div>
          {mode === "signup" && (
            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-bold text-foreground/80 mb-2 ml-1"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                name="confirm"
                autoComplete="new-password"
                className="input-glass w-full px-4 py-3 rounded-xl"
                placeholder="Re-enter password"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="btn-glass w-full py-3.5 bg-breath text-paper rounded-xl font-semibold text-base border-breath mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-h-[3.25rem]"
          >
            {pending ? (
              <>
                <BreathDots loading />
                <span className="sr-only">{text.busy}</span>
              </>
            ) : (
              text.submit
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/75">
          {text.switchPrompt}{" "}
          <button
            type="button"
            onClick={switchMode}
            disabled={pending}
            className="font-semibold text-breath hover:underline underline-offset-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {text.switchAction}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
