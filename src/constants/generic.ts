import { daysSince } from "@/lib/date";

export type Status =
  | "Pending"
  | "Applied"
  | "Interviewing"
  | "Offered"
  | "Rejected";

export type FilterOption = "All" | "Follow-up" | Status;

/** Days of inactivity after which an active application is flagged for follow-up. */
export const FOLLOW_UP_DAYS = 7;

/** Statuses still in play — terminal ones (Offered/Rejected) never need a nudge. */
const ACTIVE_STATUSES: Status[] = ["Pending", "Applied", "Interviewing"];

/** True when an active application has gone quiet past the follow-up threshold. */
export function needsFollowUp(status: Status, dateApplied: string): boolean {
  if (!ACTIVE_STATUSES.includes(status)) return false;
  const days = daysSince(dateApplied);
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
  "Pending",
];
