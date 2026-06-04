"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
                  <stop offset="0" stopColor="#aecb86" />
                  <stop offset="0.5" stopColor="#86c0b8" />
                  <stop offset="1" stopColor="#d4a0c0" />
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
                stroke="#3f5b54"
                strokeOpacity="0.22"
                strokeWidth="6"
                strokeLinecap="round"
                transform="translate(0,1.3)"
              />
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-primary dark:text-primary mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-foreground/50">
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
          <button
            type="submit"
            disabled={pending}
            className="btn-glass w-full py-3.5 bg-primary/80 dark:bg-primary/70 text-white rounded-xl font-bold text-base border-primary/40 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
