import { ApplicationKind, KIND_LABELS, KIND_OPTIONS } from "@/constants/kind";
import { JobApplication } from "@/constants/types";

/**
 * Segmented switch between the two tracks. It's navigation, not a signal, so
 * the selected segment inverts to ink rather than taking the coral — the
 * accent is reserved for applications that want something from you.
 */
export const KindToggle = ({
  kind,
  setKind,
  applications,
}: {
  kind: ApplicationKind;
  setKind: (kind: ApplicationKind) => void;
  /** Full, unscoped list — each segment shows its own count. */
  applications: JobApplication[];
}) => {
  return (
    <div role="group" aria-label="Application type" className="flex border border-line">
      {KIND_OPTIONS.map((option, i) => {
        const isActive = kind === option;
        const count = applications.filter((a) => a.kind === option).length;
        return (
          <button
            key={option}
            onClick={() => setKind(option)}
            aria-pressed={isActive}
            className={`eyebrow px-3.5 py-2 whitespace-nowrap ${i > 0 ? "border-l border-line" : ""} ${
              isActive ? "" : "hover:bg-foreground/5"
            }`}
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              background: isActive ? "var(--color-text)" : "transparent",
              color: isActive ? "var(--color-bg)" : "var(--color-text)",
            }}
          >
            {KIND_LABELS[option].tab} <span className="tnum">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
