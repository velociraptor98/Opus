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

/**
 * Status tones, mapped onto the iki earth family. Clay is deliberately not
 * here: it is the breath — reserved for "this is alive" (follow-up, next step,
 * loading) — so spending it on a routine status would blunt the accent.
 */
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
    text: "text-foreground/75",
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
/** Follow-up is a breath signal, not a status — so it, alone, gets the clay. */
export const FOLLOW_UP_COLOR = "var(--clay)";
export const FOLLOW_UP_INK = "var(--breath)";

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
 * Brand tier — the hues exactly as the design language sets them (OKLCH L .605).
 * Graphical objects only: chart fills and filter dots, which need 3:1, not the
 * 4.5:1 small text demands. These hold across both grounds, so a status reads
 * the same on paper and on espresso.
 */
export const STATUS_COLORS: Record<Status, string> = {
  Applied: "var(--slate)",
  Interviewing: "var(--amber)",
  Offered: "var(--sage)",
  Rejected: "var(--rust)",
  Closed: "var(--taupe)",
  Pending: "color-mix(in srgb, var(--foreground) 45%, transparent)",
};

/**
 * Text tier — the same hues, deepened on paper and lifted on espresso so they
 * clear 4.5:1. Use wherever a status colours *type* rather than a shape.
 */
export const STATUS_INK: Record<Status, string> = {
  Applied: "var(--secondary)",
  Interviewing: "var(--warning)",
  Offered: "var(--primary)",
  Rejected: "var(--error)",
  Closed: "var(--accent)",
  Pending: "var(--foreground)",
};
