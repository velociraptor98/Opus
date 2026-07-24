"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { BreathRule } from "./Breath";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          aria-label="Opus — home"
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          {/* The Opus wordmark, exhaling. The breath gesture — word, then line,
              then fading dots, always left to right — is the iki house style;
              it's set in CSS rather than SVG so the line length and dot spacing
              scale with the word instead of being pinned by hand. */}
          <span className="flex items-center gap-2">
            <span className="text-3xl font-semibold lowercase tracking-tight leading-none text-ink">
              opus
            </span>
            <BreathRule className="text-[0.8rem] pr-1" />
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Link
                href={pathname === "/stats" ? "/" : "/stats"}
                className="btn-glass px-4 py-2 text-sm font-semibold text-foreground/75 hover:text-breath rounded-lg transition-colors"
              >
                {pathname === "/stats" ? (
                  <>
                    <span className="md:hidden">List</span>
                    <span className="hidden md:inline">Applications</span>
                  </>
                ) : (
                  "Stats"
                )}
              </Link>
              {/* Password change is switched off at this button (6e5c369),
                  which is the only way into ChangePasswordModal — so that
                  modal and useUpdatePassword are currently unreachable. The
                  reason isn't recorded in the history; the code is kept rather
                  than deleted so the flow can be turned back on by dropping
                  `disabled`. Note the hook's doc mentions a password-recovery
                  page that was never built, so a full reset-by-email journey
                  still needs a route of its own. */}
              <button
                onClick={() => setIsPasswordOpen(true)}
                disabled
                title="Change password"
                aria-label="Change password"
                className="btn-glass flex items-center justify-center h-9 w-9 shrink-0 text-foreground/60 rounded-lg opacity-50 cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </button>
              <button
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="btn-glass flex items-center justify-center h-9 w-9 shrink-0 text-foreground/60 hover:text-error rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {isPasswordOpen && <ChangePasswordModal setIsOpen={setIsPasswordOpen} />}
    </nav>
  );
}
