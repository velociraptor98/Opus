"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5 py-4 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-baseline gap-8">
          <Link 
            href="/" 
            className="text-4xl font-black text-primary dark:text-primary tracking-tighter hover:opacity-80 transition-opacity"
          >
            Opus
          </Link>
          
          {isAuthenticated && (
            <div className="hidden md:flex gap-6">
              <Link
                href={pathname === "/stats" ? "/" : "/stats"}
                className="text-lg font-bold text-secondary hover:text-accent transition-colors"
              >
                {pathname === "/stats" ? "Checklist" : "Stats"}
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <Link
                href={pathname === "/stats" ? "/" : "/stats"}
                className="md:hidden text-sm font-bold text-secondary hover:text-accent transition-colors"
              >
                {pathname === "/stats" ? "List" : "Stats"}
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-bold text-error hover:bg-error/10 dark:hover:bg-error/20 rounded-lg transition-colors border border-error/30"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
