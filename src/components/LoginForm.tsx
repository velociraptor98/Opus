"use client";

import React, { useState } from "react";

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is just for demo and testing purposes till we get a db connection going
    if (username === "testUser" && password === "1234") {
      onLogin();
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white dark:bg-[#343f44] p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-primary/10 dark:border-primary/10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/15 mb-4">
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
            <span className="text-error font-medium">
              Invalid username or password
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-primary/20 dark:border-primary/10 dark:bg-[#3d484d] dark:text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-foreground/30"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-primary/20 dark:border-primary/10 dark:bg-[#3d484d] dark:text-foreground focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-foreground/30"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base shadow-md shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] mt-4"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-foreground/10 dark:border-foreground/5 text-center">
          <p className="text-xs text-foreground/50 uppercase tracking-widest font-bold">
            Demo: testUser / 1234
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
