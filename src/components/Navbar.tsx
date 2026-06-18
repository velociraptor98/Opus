"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { ChangePasswordModal } from "./ChangePasswordModal";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

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
                  <stop offset="0" stopColor="#1a1a1a" />
                  <stop offset="0.5" stopColor="#000000" />
                  <stop offset="1" stopColor="#1a1a1a" />
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
                <linearGradient
                  id="navRingGlass"
                  x1="32"
                  y1="14"
                  x2="32"
                  y2="50"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.5" />
                </linearGradient>
                <filter
                  id="navRingGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="2.4" />
                </filter>
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
                stroke="#000000"
                strokeOpacity="0.35"
                strokeWidth="6"
                strokeLinecap="round"
                transform="translate(0,1.3)"
              />
              {/* soft bloom behind the ring */}
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#ffffff"
                strokeOpacity="0.45"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#navRingGlow)"
              />
              {/* glass body with vertical translucency */}
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="url(#navRingGlass)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* inner refraction line */}
              <path
                d="M 39.18 16.59 A 17 17 0 1 1 24.82 16.59"
                stroke="#ffffff"
                strokeOpacity="0.35"
                strokeWidth="2"
                strokeLinecap="round"
                transform="translate(0,-0.9)"
              />
              {/* specular glint along the top edge */}
              <path
                d="M 40.5 17.28 A 17 17 0 0 0 23.5 17.28"
                stroke="#ffffff"
                strokeOpacity="0.95"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="text-4xl font-black text-black dark:text-white tracking-tighter leading-none">
              Opus
            </span>
          </Link>

        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
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
                onClick={() => setIsPasswordOpen(true)}
                disabled
                title="Change password"
                aria-label="Change password"
                className="btn-glass flex items-center justify-center h-9 w-9 shrink-0 text-secondary bg-secondary/10 border-secondary/25 rounded-lg opacity-50 cursor-not-allowed"
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

      {isPasswordOpen && <ChangePasswordModal setIsOpen={setIsPasswordOpen} />}
    </nav>
  );
}
