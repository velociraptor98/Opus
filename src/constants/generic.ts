import { daysSince } from "@/lib/date";
import type { JobApplication } from "./types";

export type Status =
  | "Pending"
  | "Applied"
  | "Interviewing"
  | "Offered"
  | "Rejected"
  | "Closed";

export type FilterOption = "All" | "Follow-up" | Status;

/** Days of inactivity after which an active application is flagged for follow-up. */
export const FOLLOW_UP_DAYS = 7;

/** Statuses still in play — terminal ones (Offered/Rejected/Closed) never need a nudge. */
const ACTIVE_STATUSES: Status[] = ["Pending", "Applied", "Interviewing"];

/** True when an active application has gone quiet past the follow-up threshold. */
export function needsFollowUp(status: Status, lastActivityAt: string): boolean {
  if (!ACTIVE_STATUSES.includes(status)) return false;
  const days = daysSince(lastActivityAt);
  return days !== null && days >= FOLLOW_UP_DAYS;
}

export const STATUS_CONFIG: Record<
  Status,
  { dot: string; bg: string; text: string }
> = {
  Applied: {
    dot: "bg-secondary",
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
  Interviewing: {
    dot: "bg-warning",
    bg: "bg-warning/10",
    text: "text-warning",
  },
  Offered: { dot: "bg-primary", bg: "bg-primary/10", text: "text-primary" },
  Rejected: { dot: "bg-error", bg: "bg-error/10", text: "text-error" },
  Closed: { dot: "bg-accent", bg: "bg-accent/10", text: "text-accent" },
  Pending: {
    dot: "bg-foreground/40",
    bg: "bg-foreground/5",
    text: "text-foreground/70",
  },
};
export const FILTER_OPTIONS: FilterOption[] = [
  "All",
  "Follow-up",
  "Applied",
  "Interviewing",
  "Offered",
  "Rejected",
  "Closed",
  "Pending",
];
export const FOLLOW_UP_COLOR = "var(--color-warning)";

export type SortOption =
  | "Recently added"
  | "Newest applied"
  | "Oldest applied"
  | "Company A–Z"
  | "Recently updated"
  | "Follow-up first";

export const SORT_OPTIONS: SortOption[] = [
  "Recently added",
  "Newest applied",
  "Oldest applied",
  "Company A–Z",
  "Recently updated",
  "Follow-up first",
];

// Both dateApplied ("YYYY-MM-DD") and lastActivityAt (ISO) are lexicographically
// ordered, so plain string comparison sorts them correctly. Empty values always
// sink to the bottom regardless of direction.
const dateAsc = (a: string, b: string) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
};
const dateDesc = (a: string, b: string) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a > b ? -1 : a < b ? 1 : 0;
};

/** Returns a new, sorted array — never mutates the input. */
export function sortApplications(
  apps: JobApplication[],
  sort: SortOption,
): JobApplication[] {
  const copy = [...apps];
  switch (sort) {
    case "Recently added":
      // Preserve the order the list already arrives in (newest-first).
      return copy;
    case "Newest applied":
      return copy.sort((a, b) => dateDesc(a.dateApplied, b.dateApplied));
    case "Oldest applied":
      return copy.sort((a, b) => dateAsc(a.dateApplied, b.dateApplied));
    case "Company A–Z":
      return copy.sort((a, b) =>
        a.company.localeCompare(b.company, undefined, { sensitivity: "base" }),
      );
    case "Recently updated":
      return copy.sort((a, b) => dateDesc(a.lastActivityAt, b.lastActivityAt));
    case "Follow-up first":
      return copy.sort((a, b) => {
        const fa = needsFollowUp(a.status, a.lastActivityAt) ? 0 : 1;
        const fb = needsFollowUp(b.status, b.lastActivityAt) ? 0 : 1;
        if (fa !== fb) return fa - fb;
        // Within the flagged group, the most stale (oldest activity) comes first.
        return dateAsc(a.lastActivityAt, b.lastActivityAt);
      });
    default:
      return copy;
  }
}

export const STATUS_COLORS: Record<Status, string> = {
  Applied: "var(--color-secondary)",
  Interviewing: "var(--color-warning)",
  Offered: "var(--color-primary)",
  Rejected: "var(--color-error)",
  Closed: "var(--color-accent)",
  Pending: "color-mix(in srgb, var(--color-foreground) 60%, transparent)",
};
