"use client";

import { useState, useEffect } from "react";
import JobChecklist from "@/components/JobChecklist";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("isLoggedIn");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    setIsMounted(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isLoggedIn");
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
      <main className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
              Job <span className="text-blue-600">Search</span> Tracker
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-zinc-400 font-medium italic">
              Organize your career journey with precision.
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30 w-fit"
            >
              Sign Out
            </button>
          )}
        </header>
        
        {!isAuthenticated ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <JobChecklist />
          </div>
        )}
      </main>
    </div>
  );
}
