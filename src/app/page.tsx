"use client";

import { useState } from "react";
import JobChecklist from "@/components/JobChecklist";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] transition-colors">
      {isAuthenticated && (
        <button
          onClick={() => setIsModalOpen(true)}
          title="Add Application"
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 bg-secondary text-white w-10 h-10 rounded-full transition-all shadow-lg shadow-secondary/30 hover:bg-secondary/90 hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
        </button>
      )}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8">
        {!isAuthenticated ? (
          <LoginForm />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <JobChecklist
              isModalOpen={isModalOpen}
              onModalClose={() => setIsModalOpen(false)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
