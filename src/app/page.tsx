"use client";

import JobChecklist from "@/components/JobChecklist";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4.5rem)] transition-colors">
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {!isAuthenticated ? (
          <LoginForm />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <JobChecklist />
          </div>
        )}
      </main>
    </div>
  );
}
