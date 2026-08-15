"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { Wordmark } from "./Mark";

const NAV_LINKS = [
  { href: "/", label: "Applications" },
  { href: "/stats", label: "Stats" },
] as const;

/**
 * The app's first band: wordmark, the two views, and the account controls.
 * In flow rather than fixed — every band below it is ruled to the same 2px
 * divider, and a floating header would break that stack.
 */
export default function Navbar() {
  const { isAuthenticated, email, logout } = useAuth();
  const pathname = usePathname();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  return (
    <header className="flex items-center gap-7 px-4 md:px-8 py-3.5 border-b-2 border-line bg-background">
      <Link href="/" aria-label="Opus — home" className="mr-1 hover:opacity-80">
        <Wordmark size="md" />
      </Link>

      {isAuthenticated && (
        <>
          <nav className="flex gap-5 eyebrow" style={{ fontSize: 12, letterSpacing: "0.12em" }}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`pb-0.5 border-b-2 ${
                    active
                      ? "text-foreground border-brand"
                      : "text-muted border-transparent hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {email && (
              <span
                className="eyebrow text-muted hidden md:inline mr-2 max-w-[22ch] truncate"
                style={{ fontSize: 11, letterSpacing: "0.1em" }}
                title={email}
              >
                {email}
              </span>
            )}
            {/* Password change is switched off at this button (6e5c369), which
                is the only way into ChangePasswordModal — so that modal and
                useUpdatePassword are currently unreachable. The reason isn't
                recorded in the history; the code is kept rather than deleted so
                the flow can be turned back on by dropping `disabled`. Note the
                hook's doc mentions a password-recovery page that was never
                built, so a full reset-by-email journey still needs a route. */}
            <button
              onClick={() => setIsPasswordOpen(true)}
              disabled
              title="Change password"
              className="btn btn-secondary"
              style={{ fontSize: 11, letterSpacing: "0.1em" }}
            >
              KEY
            </button>
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{ fontSize: 11, letterSpacing: "0.1em" }}
            >
              SIGN OUT
            </button>
          </div>
        </>
      )}

      {isPasswordOpen && <ChangePasswordModal setIsOpen={setIsPasswordOpen} />}
    </header>
  );
}
