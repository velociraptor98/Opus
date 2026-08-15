"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoadingBars, Wordmark } from "./Mark";

type Mode = "signin" | "signup";

const copy = {
  signin: {
    heading: "Sign in",
    sub: "Your ledger, waiting where you left it.",
    submit: "ENTER OPUS",
    busy: "Signing in…",
    switchPrompt: "New here?",
    switchAction: "Create an account",
  },
  signup: {
    heading: "Create account",
    sub: "One page for every application you send.",
    submit: "CREATE ACCOUNT",
    busy: "Creating account…",
    switchPrompt: "Already have an account?",
    switchAction: "Sign in",
  },
} as const;

/** The claims on the coral panel — the promise the tracker is making. */
const PITCH = [
  { value: "128", label: "Tracked" },
  { value: "31%", label: "Interview rate" },
  { value: "0", label: "Missed steps" },
];

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
    <div className="grid lg:grid-cols-2 min-h-screen">
      {/* The pitch. Deliberately the deeper accent-600 rather than the bright
          coral: this panel is a *ground* carrying 16px body copy, and the
          bright accent leaves that copy at 4.2:1 against white. */}
      <div
        className="flex flex-col justify-between gap-10 px-8 py-10 md:px-12 md:py-14"
        style={{
          background: "var(--color-accent-ground)",
          color: "var(--color-on-accent)",
        }}
      >
        <div className="flex items-center gap-4">
          <Wordmark size="lg" reversed />
          <span className="eyebrow ml-auto" style={{ fontSize: 11, letterSpacing: "0.14em" }}>
            Application tracker
          </span>
        </div>

        <div>
          <h1
            className="max-w-[9ch]"
            style={{ fontSize: "clamp(38px, 6vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.03em", margin: "0 0 20px" }}
          >
            Every application, one page.
          </h1>
          <p className="max-w-[38ch] m-0" style={{ fontSize: 16 }}>
            Jobs and universities in a single ledger — statuses, deadlines and
            follow-ups that do not slip.
          </p>
        </div>

        <div
          className="grid grid-cols-3 gap-6 pt-5"
          style={{ borderTop: "2px solid var(--color-on-accent)" }}
        >
          {PITCH.map((stat) => (
            <div key={stat.label}>
              <div className="tnum" style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.1 }}>
                {stat.value}
              </div>
              <div className="eyebrow" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The form. */}
      <div className="flex items-center px-8 py-12 md:px-12 md:py-14">
        <div className="w-full max-w-[380px] mx-auto lg:mx-0">
          <h2 style={{ fontSize: 32, margin: "0 0 6px" }}>{text.heading}</h2>
          <p className="text-muted" style={{ fontSize: 14, margin: "0 0 28px" }}>
            {text.sub}
          </p>

          {error && (
            <div
              className="animate-shake flex items-center gap-3 px-3 py-2.5 mb-5"
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

          {notice && (
            <div
              className="flex items-center gap-3 px-3 py-2.5 mb-5"
              style={{
                background: "var(--color-neutral-200)",
                borderLeft: "3px solid var(--color-text)",
                fontSize: 13,
              }}
              role="status"
            >
              {notice}
            </div>
          )}

          {/* Remounting on mode change wipes the fields, so a password typed on
              one form never carries into the other. */}
          <form key={mode} onSubmit={handleSubmit}>
            <div className="field mb-4">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className={mode === "signup" ? "field mb-4" : "field mb-6"}>
              <label htmlFor="password">Passphrase</label>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="input"
                placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                required
              />
            </div>
            {mode === "signup" && (
              <div className="field mb-6">
                <label htmlFor="confirm">Confirm passphrase</label>
                <input
                  id="confirm"
                  type="password"
                  name="confirm"
                  autoComplete="new-password"
                  className="input"
                  placeholder="Re-enter passphrase"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="btn btn-primary w-full"
              style={{ minHeight: 44, letterSpacing: "0.08em" }}
            >
              {pending ? (
                <>
                  <LoadingBars />
                  <span className="sr-only">{text.busy}</span>
                </>
              ) : (
                text.submit
              )}
            </button>
          </form>

          <div className="hr" />

          <div className="flex items-center gap-2 eyebrow text-muted">
            <span>{text.switchPrompt}</span>
            <button
              type="button"
              onClick={switchMode}
              disabled={pending}
              className="op-lnk text-foreground underline underline-offset-4"
            >
              {text.switchAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
