"use client";

import JobChecklist from "@/components/JobChecklist";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="min-h-[calc(100vh-6rem)] p-4 md:p-8 transition-colors">
      <main className="max-w-6xl mx-auto">
        {!isAuthenticated ? (
          <LoginForm onLogin={login} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <JobChecklist />
          </div>
        )}
      </main>
    </div>
  );
}
