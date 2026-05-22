"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-background dark:bg-background p-4 md:p-8 text-foreground transition-colors">
      <main className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-baseline gap-8">
            <h1 className="text-6xl font-black text-primary dark:text-primary tracking-tighter">
              Opus
            </h1>
            {isAuthenticated && (
              <Link 
                href="/stats" 
                className="text-lg font-bold text-secondary hover:text-accent transition-colors"
              >
                Stats
              </Link>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-error hover:bg-error/10 dark:hover:bg-error/20 rounded-lg transition-colors border border-error/30 w-fit"
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
