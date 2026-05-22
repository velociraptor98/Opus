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
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-gray-500 dark:text-zinc-400">Please sign in to your tracker</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 animate-shake">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-400 text-sm font-medium">Invalid username or password</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 ml-1">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-lg shadow-xl shadow-zinc-500/20 hover:shadow-zinc-500/40 transition-all active:scale-[0.98] mt-4"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-center">
          <p className="text-xs text-gray-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
            Demo: testUser / 1234
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
