import { JobApplication } from "@/constants/types";
import { daysSince, formatExactDate, formatRelativeDate } from "@/lib/date";

const MAX_ITEMS = 5;

/**
 * Scheduled next steps (today or later), soonest first — a band, not a card,
 * so it stacks into the same ruled rhythm as the strip above it. Renders
 * nothing when the calendar is clear, which is the common case.
 */
export const UpcomingStrip = ({
  applications,
}: {
  applications: JobApplication[];
}) => {
  const upcoming = applications
    .filter((a) => {
      if (!a.nextActionDate) return false;
      const d = daysSince(a.nextActionDate);
      return d !== null && d <= 0;
    })
    .sort((a, b) => (a.nextActionDate < b.nextActionDate ? -1 : 1));

  if (upcoming.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap px-4 md:px-8 py-2.5 border-b border-line">
      <span className="eyebrow text-muted shrink-0">Upcoming</span>
      {upcoming.slice(0, MAX_ITEMS).map((a) => {
        const isToday = daysSince(a.nextActionDate) === 0;
        return (
          <span
            key={a.id}
            title={formatExactDate(a.nextActionDate)}
            className={`tag ${isToday ? "tag-accent" : "tag-neutral"} eyebrow`}
            style={{ letterSpacing: "0.08em" }}
          >
            {a.company}
            {a.nextActionNote ? ` · ${a.nextActionNote}` : ""} ·{" "}
            {isToday ? "Today" : formatRelativeDate(a.nextActionDate)}
          </span>
        );
      })}
      {upcoming.length > MAX_ITEMS && (
        <span className="eyebrow text-muted">
          +{upcoming.length - MAX_ITEMS} more
        </span>
      )}
    </div>
  );
};
