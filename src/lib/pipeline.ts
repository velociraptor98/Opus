import { Status } from "@/constants/generic";

export interface ReachedStages {
  /** The application was actually sent (not just saved as Pending/Closed). */
  submitted: boolean;
  interviewed: boolean;
  offered: boolean;
}

// A status implies every stage beneath it: you can't interview without
// applying, and a rejection proves the application was submitted (though it
// says nothing about interviews).
const IMPLIES_SUBMITTED: Status[] = [
  "Applied",
  "Interviewing",
  "Offered",
  "Rejected",
];
const IMPLIES_INTERVIEWED: Status[] = ["Interviewing", "Offered"];

/**
 * The stages an application has *ever* reached, judged from its current
 * status plus any recorded status history. Snapshot counts undercount —
 * an app that interviewed and was then rejected leaves the "Interviewing"
 * bucket; this doesn't forget.
 */
export function reachedStages(
  current: Status,
  history: Status[] = [],
): ReachedStages {
  const seen = new Set<Status>([current, ...history]);
  const any = (statuses: Status[]) => statuses.some((s) => seen.has(s));
  return {
    submitted: any(IMPLIES_SUBMITTED),
    interviewed: any(IMPLIES_INTERVIEWED),
    offered: seen.has("Offered"),
  };
}
