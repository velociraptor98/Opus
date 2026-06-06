/** Parse a "YYYY-MM-DD" (or any Date-parseable) string as a local date. */
function parseLocalDate(dateStr: string): Date | null {
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const fallback = new Date(dateStr);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole days between `dateStr` and today (positive = in the past). Null if unparseable. */
export function daysSince(dateStr: string): number | null {
  if (!dateStr) return null;
  const date = parseLocalDate(dateStr);
  if (!date) return null;
  return Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );
}

/** Human-friendly relative date, e.g. "Today", "3 days ago", "2 weeks ago". */
export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;

  const diffDays = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";

  const plural = (n: number, unit: string) =>
    `${n} ${unit}${n > 1 ? "s" : ""}`;

  if (diffDays < 0) {
    const ahead = -diffDays;
    if (ahead < 7) return `In ${plural(ahead, "day")}`;
    if (ahead < 30) return `In ${plural(Math.round(ahead / 7), "week")}`;
    if (ahead < 365) return `In ${plural(Math.round(ahead / 30), "month")}`;
    return `In ${plural(Math.round(ahead / 365), "year")}`;
  }

  if (diffDays < 7) return `${plural(diffDays, "day")} ago`;
  if (diffDays < 30) return `${plural(Math.round(diffDays / 7), "week")} ago`;
  if (diffDays < 365) return `${plural(Math.round(diffDays / 30), "month")} ago`;
  return `${plural(Math.round(diffDays / 365), "year")} ago`;
}

/** Exact, locale-formatted date for tooltips, e.g. "Jun 1, 2026". */
export function formatExactDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseLocalDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
