export type Status =
  | "Pending"
  | "Applied"
  | "Interviewing"
  | "Offered"
  | "Rejected";

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
    dot: "bg-foreground/30",
    bg: "bg-foreground/5",
    text: "text-foreground/50",
  },
};
