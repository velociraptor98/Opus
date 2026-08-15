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

export const STATUS_OPTIONS: Status[] = [
  "Pending",
  "Applied",
  "Interviewing",
  "Offered",
  "Rejected",
  "Closed",
];

/** Days of inactivity after which an active application is flagged for follow-up. */
export const FOLLOW_UP_DAYS = 7;

/** Statuses still in play — terminal ones (Offered/Rejected/Closed) never need a nudge. */
export const ACTIVE_STATUSES: Status[] = ["Pending", "Applied", "Interviewing"];

/**
 * True when an active application has gone quiet past the follow-up threshold.
 * A scheduled next action today or later suppresses the nudge — you already
 * know your next step. Once that date passes, normal staleness rules resume.
 */
export function needsFollowUp(
  status: Status,
  lastActivityAt: string,
  nextActionDate?: string,
): boolean {
  if (!ACTIVE_STATUSES.includes(status)) return false;
  if (nextActionDate) {
    const untilAction = daysSince(nextActionDate);
    if (untilAction !== null && untilAction <= 0) return false;
  }
  const days = daysSince(lastActivityAt);
  return days !== null && days >= FOLLOW_UP_DAYS;
}

/** Common application sources; the UI also accepts free text. */
export const SOURCE_OPTIONS = [
  "LinkedIn",
  "Referral",
  "Company site",
  "Job board",
  "Recruiter",
  "Career fair",
  "Other",
] as const;

export const FILTER_OPTIONS: FilterOption[] = [
  "All",
  "Pending",
  "Applied",
  "Follow-up",
  "Interviewing",
  "Offered",
  "Rejected",
  "Closed",
];

/**
 * Filters describing an application that wants something from you. These are
 * the only columns that earn a coral dot; everything else is a plain count.
 */
export const ATTENTION_FILTERS: FilterOption[] = [
  "Follow-up",
  "Interviewing",
  "Offered",
];

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
        const fa = needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate)
          ? 0
          : 1;
        const fb = needsFollowUp(b.status, b.lastActivityAt, b.nextActionDate)
          ? 0
          : 1;
        if (fa !== fb) return fa - fb;
        // Within the flagged group, the most stale (oldest activity) comes first.
        return dateAsc(a.lastActivityAt, b.lastActivityAt);
      });
    default:
      return copy;
  }
}

/**
 * Shape tier — fills for charts, dots and bars, where 3:1 is the bar to clear.
 *
 * The system has one accent, so a status is placed on a single axis of
 * aliveness rather than given a hue of its own: the two live statuses take the
 * coral, the rest are ink and grey. Distinguishable in a pie without ever
 * implying that Closed and Rejected are different *kinds* of thing.
 */
export const STATUS_COLORS: Record<Status, string> = {
  Offered: "var(--color-accent-700)",
  Interviewing: "var(--color-accent)",
  Applied: "var(--color-text)",
  Pending: "var(--color-neutral-500)",
  Rejected: "var(--color-neutral-700)",
  Closed: "var(--color-neutral-300)",
};

/**
 * Text tier — the same statuses wherever they colour *type*, deepened until
 * they clear 4.5:1 on the page ground. Use this and never STATUS_COLORS for
 * anything with words in it.
 */
export const STATUS_INK: Record<Status, string> = {
  Offered: "var(--color-accent-800)",
  Interviewing: "var(--color-accent-700)",
  Applied: "var(--color-text)",
  Pending: "var(--color-neutral-700)",
  Rejected: "var(--color-neutral-700)",
  Closed: "var(--color-neutral-700)",
};
