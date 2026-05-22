"use client";

import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'testUser' && password === '1234') {
      onLogin();
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white dark:bg-[#343f44] p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-primary/10 dark:border-primary/5 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-primary dark:text-primary mb-2">Welcome Back</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 animate-shake">
            <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-error font-medium">Invalid username or password</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">Username</label>
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
            <label className="block text-sm font-bold text-foreground/80 dark:text-foreground/70 mb-2 ml-1">Password</label>
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
            className="w-full py-4 bg-primary dark:bg-primary text-background dark:text-background rounded-xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-4"
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
