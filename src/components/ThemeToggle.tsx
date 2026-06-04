"use client";

export default function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // localStorage unavailable (private mode, etc.) — toggle still works for the session
    }
  };

  return (
    <button
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle light and dark theme"
      className="btn-glass flex items-center justify-center h-9 w-9 shrink-0 text-foreground/70 bg-foreground/[0.06] border-foreground/15 rounded-lg"
    >
      {/* Moon — shown in light mode (click switches to dark) */}
      <svg
        className="w-5 h-5 block dark:hidden"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      {/* Sun — shown in dark mode (click switches to light) */}
      <svg
        className="w-5 h-5 hidden dark:block"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    </button>
  );
}
