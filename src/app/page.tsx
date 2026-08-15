"use client";

import JobChecklist from "@/components/JobChecklist";
import LoginForm from "@/components/LoginForm";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  // Signed out, the sign-in split owns the whole viewport — it carries its own
  // wordmark on the coral panel, so the app header would only repeat it.
  if (!isAuthenticated) return <LoginForm />;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Navbar />
      <JobChecklist />
    </div>
  );
}
