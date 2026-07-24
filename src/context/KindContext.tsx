"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ApplicationKind, DEFAULT_KIND, toKind } from "@/constants/kind";

const STORAGE_KEY = "opus:kind";

interface KindContextType {
  kind: ApplicationKind;
  setKind: (kind: ApplicationKind) => void;
}

const KindContext = createContext<KindContextType | undefined>(undefined);

/**
 * Which kind of application the app is currently showing. Held in context
 * rather than the URL so the dashboard and stats page stay in step during a
 * client-side transition without either route needing a Suspense boundary
 * around `useSearchParams`; localStorage carries the choice across reloads.
 */
export function KindProvider({ children }: { children: ReactNode }) {
  // Read once, in the initializer, so the first paint is already on the right
  // track — no flash of the job list before the stored choice applies. Safe
  // because this provider sits under AuthProvider, which renders nothing
  // until it has mounted on the client; the guard covers it either way.
  const [kind, setKindState] = useState<ApplicationKind>(() => {
    if (typeof window === "undefined") return DEFAULT_KIND;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? toKind(stored) : DEFAULT_KIND;
  });

  const setKind = (next: ApplicationKind) => {
    setKindState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <KindContext.Provider value={{ kind, setKind }}>
      {children}
    </KindContext.Provider>
  );
}

export function useKind() {
  const context = useContext(KindContext);
  if (context === undefined) {
    throw new Error("useKind must be used within a KindProvider");
  }
  return context;
}
