"use client";

import JobChecklist from "@/components/JobChecklist";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4.5rem)] transition-colors">
      {/* From md up the dashboard is exactly one screen tall — the navbar is
          4.5rem and fixed, so that's all that's left — and the card grid
          scrolls inside its well rather than the page scrolling. Below md the
          panels stack, where a locked height would squeeze the list to
          nothing, so height goes back to natural flow. */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 md:h-[calc(100vh-4.5rem)]">
        {!isAuthenticated ? (
          <LoginForm />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 md:h-full md:min-h-0">
            <JobChecklist />
          </div>
        )}
      </main>
    </div>
  );
}
