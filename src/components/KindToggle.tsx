import { ApplicationKind, KIND_LABELS, KIND_OPTIONS } from "@/constants/kind";
import { JobApplication } from "@/constants/types";

/**
 * Segmented switch between the two tracks. It's navigation, not a signal, so
 * it tints from the theme foreground and leaves the clay alone — the breath is
 * reserved for "this is alive" (follow-up, next step, loading).
 */
export const KindToggle = ({
  kind,
  setKind,
  applications,
  size = "md",
}: {
  kind: ApplicationKind;
  setKind: (kind: ApplicationKind) => void;
  /** Full, unscoped list — each segment shows its own count. */
  applications: JobApplication[];
  /** "sm" for the stats header, where it sits beside a page title. */
  size?: "sm" | "md";
}) => {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return (
    <div
      role="group"
      aria-label="Application type"
      className="flex items-center gap-1 p-1 rounded-full bg-foreground/5"
    >
      {KIND_OPTIONS.map((option) => {
        const isActive = kind === option;
        const count = applications.filter((a) => a.kind === option).length;
        return (
          <button
            key={option}
            onClick={() => setKind(option)}
            aria-pressed={isActive}
            className={`focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-200 active:scale-95 ${pad}`}
            style={
              isActive
                ? {
                    background:
                      "color-mix(in srgb, var(--color-foreground) 10%, transparent)",
                    boxShadow:
                      "inset 0 0 0 1.5px color-mix(in srgb, var(--color-foreground) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.5)",
                    color: "var(--color-foreground)",
                  }
                : {
                    background: "transparent",
                    color: "color-mix(in srgb, currentColor 65%, transparent)",
                  }
            }
          >
            {KIND_LABELS[option].tab}
            <span className="meta text-xs font-medium opacity-75 tabular-nums">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
