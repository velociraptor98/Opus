"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signIn" | "forgot";

const LoginForm = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSignIn = async (formData: FormData) => {
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

  const handleForgot = async (formData: FormData) => {
    const email = String(formData.get("email") ?? "");
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
      setPending(false);
      return;
    }

    setInfo(
      `If an account exists for ${email}, a password reset link is on its way.`,
    );
    setPending(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);

    const formData = new FormData(e.currentTarget);
    if (mode === "forgot") {
      await handleForgot(formData);
    } else {
      await handleSignIn(formData);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="modal-glass p-8 rounded-3xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex mb-4">
            <svg
              viewBox="0 0 64 64"
              className="w-14 h-14 drop-shadow-md"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="loginTile"
                  x1="6"
                  y1="3"
                  x2="58"
                  y2="61"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#1a1a1a" />
                  <stop offset="0.5" stopColor="#000000" />
                  <stop offset="1" stopColor="#1a1a1a" />
                </linearGradient>
                <linearGradient
                  id="loginSheen"
                  x1="0"
                  y1="2"
                  x2="0"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="loginBorder"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="64"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient
                  id="loginRingGlass"
                  x1="32"
                  y1="14"
                  x2="32"
                  y2="50"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
                </linearGradient>
                <filter
                  id="loginRingGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="2.4" />
                </filter>
              </defs>
              <rect x="1" y="1" width="62" height="62" rx="16" fill="url(#loginTile)" />
              <rect x="1" y="1" width="62" height="62" rx="16" fill="url(#loginSheen)" />
              <rect
                x="1.6"
                y="1.6"
                width="60.8"
                height="60.8"
                rx="15.2"
                fill="none"
                stroke="url(#loginBorder)"
                strokeWidth="1.2"
              />
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#000000"
                strokeOpacity="0.35"
                strokeWidth="6"
                strokeLinecap="round"
                transform="translate(0,1.3)"
              />
              {/* soft bloom behind the ring */}
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#ffffff"
                strokeOpacity="0.45"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#loginRingGlow)"
              />
              {/* glass body with vertical translucency */}
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="url(#loginRingGlass)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* inner refraction line */}
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#ffffff"
                strokeOpacity="0.35"
                strokeWidth="2"
                strokeLinecap="round"
                transform="translate(0,-0.9)"
              />
              {/* specular glint along the top edge */}
              <path
                d="M 40.5 17.28 A 17 17 0 0 0 23.5 17.28"
                stroke="#ffffff"
                strokeOpacity="0.95"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-primary dark:text-primary mb-1">
            {mode === "forgot" ? "Reset password" : "Welcome back"}
          </h2>
          <p className="text-sm text-foreground/70">
            {mode === "forgot"
              ? "Enter your email and we'll send you a reset link"
              : "Sign in to your job search tracker"}
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

        {info && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
            <svg
              className="w-5 h-5 text-primary shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-primary font-medium">{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">
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
          {mode === "signIn" && (
            <div>
              <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">
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
          )}
          <button
            type="submit"
            disabled={pending}
            className="btn-glass w-full py-3.5 bg-primary/80 dark:bg-primary/70 text-white rounded-xl font-bold text-base border-primary/40 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending
              ? mode === "forgot"
                ? "Sending…"
                : "Signing in…"
              : mode === "forgot"
                ? "Send reset link"
                : "Sign In"}
          </button>

          <div className="text-center">
            {mode === "signIn" ? (
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("signIn")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
