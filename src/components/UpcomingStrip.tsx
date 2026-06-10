import { JobApplication } from "@/constants/types";
import { daysSince, formatExactDate, formatRelativeDate } from "@/lib/date";

const MAX_ITEMS = 4;

/**
 * Compact strip of scheduled next steps (today or later), soonest first.
 * Renders nothing when the calendar is clear.
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
    <div className="glass-well rounded-2xl px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2">
        Upcoming
      </p>
      <div className="flex flex-wrap gap-2">
        {upcoming.slice(0, MAX_ITEMS).map((a) => {
          const isToday = daysSince(a.nextActionDate) === 0;
          return (
            <span
              key={a.id}
              title={formatExactDate(a.nextActionDate)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isToday
                  ? "bg-warning/15 text-warning"
                  : "bg-secondary/10 text-secondary"
              }`}
            >
              <svg
                className="w-3 h-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {a.company}
              {a.nextActionNote ? ` — ${a.nextActionNote}` : ""}
              <span className="opacity-70 font-medium">
                · {isToday ? "Today" : formatRelativeDate(a.nextActionDate)}
              </span>
            </span>
          );
        })}
        {upcoming.length > MAX_ITEMS && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-foreground/50">
            +{upcoming.length - MAX_ITEMS} more
          </span>
        )}
      </div>
    </div>
  );
};
