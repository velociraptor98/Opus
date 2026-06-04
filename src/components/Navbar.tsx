"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <svg
              viewBox="0 0 64 64"
              className="h-9 w-9 shrink-0"
              fill="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="navTile"
                  x1="6"
                  y1="3"
                  x2="58"
                  y2="61"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#aecb86" />
                  <stop offset="0.5" stopColor="#86c0b8" />
                  <stop offset="1" stopColor="#d4a0c0" />
                </linearGradient>
                <linearGradient
                  id="navSheen"
                  x1="0"
                  y1="2"
                  x2="0"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="navBorder"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="64"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="62" height="62" rx="16" fill="url(#navTile)" />
              <rect x="1" y="1" width="62" height="62" rx="16" fill="url(#navSheen)" />
              <rect
                x="1.6"
                y="1.6"
                width="60.8"
                height="60.8"
                rx="15.2"
                fill="none"
                stroke="url(#navBorder)"
                strokeWidth="1.2"
              />
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#3f5b54"
                strokeOpacity="0.22"
                strokeWidth="6"
                strokeLinecap="round"
                transform="translate(0,1.3)"
              />
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#ffffff"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-4xl font-black text-primary dark:text-primary tracking-tighter leading-none">
              Opus
            </span>
          </Link>

        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <Link
                href={pathname === "/stats" ? "/" : "/stats"}
                className="btn-glass px-4 py-2 text-sm font-bold text-secondary bg-secondary/10 border-secondary/25 rounded-lg"
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
              <button
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="btn-glass flex items-center justify-center h-9 w-9 shrink-0 text-error bg-error/10 border-error/25 rounded-lg"
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
    </nav>
  );
}
