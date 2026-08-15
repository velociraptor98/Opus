import {
  ATTENTION_FILTERS,
  FILTER_OPTIONS,
  FilterOption,
  needsFollowUp,
  Status,
} from "@/constants/generic";
import { ApplicationKind, STATUS_LABELS } from "@/constants/kind";
import { JobApplication } from "@/constants/types";
import React from "react";

/**
 * The status strip: eight counts across the top of the list, one per filter,
 * each its own cell in a ruled band. It replaces the old sidebar list — the
 * counts are the most-read numbers on the page, so they get the full width
 * and the largest type rather than a column of pills off to the side.
 *
 * A cell with nothing in it greys back but stays put: the gaps in a pipeline
 * are information, and a strip that reflows as counts change is unreadable.
 */
export const FilterPanel = ({
  statusFilter,
  setStatusFilter,
  setPage,
  applications,
  kind,
}: {
  statusFilter: FilterOption;
  setStatusFilter: React.Dispatch<React.SetStateAction<FilterOption>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  /** Already scoped to `kind` — the counts are per-kind. */
  applications: JobApplication[];
  kind: ApplicationKind;
}) => {
  const countFor = (option: FilterOption) => {
    if (option === "All") return applications.length;
    if (option === "Follow-up") {
      return applications.filter((a) =>
        needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate),
      ).length;
    }
    return applications.filter((a) => a.status === option).length;
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 border-t-2 border-b border-line">
      {FILTER_OPTIONS.map((option) => {
        const isActive = statusFilter === option;
        const count = countFor(option);
        // "All" and "Follow-up" read the same either way; only the six stored
        // statuses take the kind's vocabulary.
        const label =
          option === "All" || option === "Follow-up"
            ? option
            : STATUS_LABELS[kind][option as Status];
        return (
          <button
            key={option}
            onClick={() => {
              setStatusFilter(option);
              setPage(0);
            }}
            aria-pressed={isActive}
            className="op-row text-left px-4 pt-3 pb-3.5 border-l border-line first:border-l-0 md:first:border-l-0"
            style={{
              boxShadow: isActive
                ? "inset 0 3px 0 0 var(--color-accent)"
                : undefined,
              background: isActive ? "var(--color-neutral-200)" : "transparent",
              // An empty, unselected column recedes rather than disappearing.
              color:
                isActive || count > 0
                  ? "var(--color-text)"
                  : "color-mix(in srgb, var(--color-text) 45%, transparent)",
            }}
          >
            <span className="flex items-baseline gap-2">
              <span
                className="tnum"
                style={{ fontWeight: 800, fontSize: 26, lineHeight: 1, letterSpacing: "-0.02em" }}
              >
                {count}
              </span>
              {/* The one coral dot in the band: this column wants something. */}
              <span
                style={{
                  width: 6,
                  height: 6,
                  background:
                    ATTENTION_FILTERS.includes(option) && count > 0
                      ? "var(--color-accent)"
                      : "transparent",
                }}
              />
            </span>
            <span className="eyebrow block mt-2 truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
