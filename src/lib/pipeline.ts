import { Status, needsFollowUp } from "@/constants/generic";
import type { JobApplication } from "@/constants/types";

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

/* ── the five-segment pipeline ─────────────────────────────────────────────
   The design draws progress as five equal bars rather than a percentage, so
   a row's position in the pipeline is legible at a glance and at any width.
   ───────────────────────────────────────────────────────────────────────── */

export const PIPELINE_LENGTH = 5;

/**
 * How many of the five segments a status fills. Applied sits at 2 of 5 rather
 * than 1: sending the application is the second beat (saving it is the first),
 * and every terminal status fills the bar because the run is over either way.
 */
const SEGMENTS_FILLED: Record<Status, number> = {
  Pending: 1,
  Applied: 2,
  Interviewing: 4,
  Offered: 5,
  Rejected: 5,
  Closed: 5,
};

/**
 * How loudly a row should read.
 *
 * `attention` is the only tone that spends the accent — an application that is
 * live and wants something from you. `dormant` is a finished run, greyed back
 * so the open ones carry the eye. Everything else is plain ink.
 */
export type Tone = "attention" | "dormant" | "neutral";

const ATTENTION_STATUSES: Status[] = ["Interviewing", "Offered"];
const DORMANT_STATUSES: Status[] = ["Rejected", "Closed"];

export function toneFor(status: Status, followUp: boolean): Tone {
  if (DORMANT_STATUSES.includes(status)) return "dormant";
  if (followUp || ATTENTION_STATUSES.includes(status)) return "attention";
  return "neutral";
}

/** The tone of a whole application, follow-up staleness included. */
export function toneOf(app: JobApplication): Tone {
  return toneFor(
    app.status,
    needsFollowUp(app.status, app.lastActivityAt, app.nextActionDate),
  );
}

/** Colour a filled segment takes, per tone. Unfilled is always neutral-300. */
export const TONE_FILL: Record<Tone, string> = {
  attention: "var(--color-accent)",
  dormant: "var(--color-neutral-400)",
  neutral: "var(--color-text)",
};

/** The initial-mark's ground and ink, per tone. */
export const TONE_MARK: Record<Tone, { bg: string; fg: string }> = {
  attention: { bg: "var(--color-accent-ground)", fg: "var(--color-on-accent)" },
  dormant: { bg: "var(--color-neutral-300)", fg: "var(--color-neutral-800)" },
  neutral: { bg: "var(--color-text)", fg: "var(--color-bg)" },
};

/** Which `.tag-*` modifier a status pill wears, per tone. */
export const TONE_TAG: Record<Tone, string> = {
  attention: "tag-accent",
  dormant: "tag-neutral",
  neutral: "tag-outline",
};

/** Per-segment fill colours for one application, left to right. */
export function pipelineSegments(status: Status, tone: Tone): string[] {
  const filled = SEGMENTS_FILLED[status] ?? 0;
  return Array.from({ length: PIPELINE_LENGTH }, (_, i) =>
    i < filled ? TONE_FILL[tone] : "var(--color-neutral-300)",
  );
}
