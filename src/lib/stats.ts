import {
  ACTIVE_STATUSES,
  needsFollowUp,
  type Status,
} from "@/constants/generic";
import type { JobApplication } from "@/constants/types";
import { daysSince } from "@/lib/date";
import { reachedStages } from "@/lib/pipeline";

/** Historical statuses per application id, from application_events. */
export type StatusHistory = Record<string, Status[]>;

export interface Derived {
  total: number;
  statusCounts: Record<string, number>;
  submitted: number;
  interviewRate: number;
  offerRate: number;
  followUpsDue: number;
  winRate: number | null;
  decided: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  byMonth: { month: string; count: number }[];
  busiestMonth: { month: string; count: number } | null;
  topCompanies: { company: string; count: number }[];
  /** Ever-reached stage counts (history-aware, not a snapshot). */
  funnel: { submitted: number; interviewed: number; offered: number };
  sourceConversion: {
    source: string;
    offered: number;
    interviewed: number;
    noInterview: number;
  }[];
  /** Active apps with no scheduled next step, most neglected first. */
  staleness: {
    id: string;
    company: string;
    position: string;
    status: Status;
    daysQuiet: number;
  }[];
}

export function derive(apps: JobApplication[], history: StatusHistory): Derived {
  const total = apps.length;

  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const offered = statusCounts["Offered"] || 0;
  const rejected = statusCounts["Rejected"] || 0;

  // Ever-reached stage counts: current status plus recorded history, so an
  // app that interviewed and was later rejected still counts as interviewed.
  // These are the fair numbers for the funnel and conversion rates.
  const stages = apps.map((a) => reachedStages(a.status, history[a.id]));
  const funnel = {
    submitted: stages.filter((s) => s.submitted).length,
    interviewed: stages.filter((s) => s.interviewed).length,
    offered: stages.filter((s) => s.offered).length,
  };
  const submitted = funnel.submitted;

  const decided = offered + rejected;

  // Conversion by source, among submitted apps only. Buckets are exclusive:
  // an app counts once, at the furthest stage it reached.
  const conversionBySource: Record<
    string,
    { offered: number; interviewed: number; noInterview: number }
  > = {};
  apps.forEach((a, i) => {
    if (!stages[i].submitted) return;
    const key = a.source?.trim() || "Untagged";
    const bucket = (conversionBySource[key] ??= {
      offered: 0,
      interviewed: 0,
      noInterview: 0,
    });
    if (stages[i].offered) bucket.offered += 1;
    else if (stages[i].interviewed) bucket.interviewed += 1;
    else bucket.noInterview += 1;
  });
  const sourceConversion = Object.entries(conversionBySource)
    .map(([source, counts]) => ({ source, ...counts }))
    .sort(
      (a, b) =>
        b.offered + b.interviewed + b.noInterview -
        (a.offered + a.interviewed + a.noInterview),
    )
    .slice(0, 8);

  const followUpsDue = apps.filter((a) =>
    needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate),
  ).length;

  let thisWeek = 0;
  let lastWeek = 0;
  let thisMonth = 0;
  const monthCounts: Record<string, number> = {};

  for (const a of apps) {
    const d = daysSince(a.dateApplied);
    if (d !== null && d >= 0) {
      if (d < 7) thisWeek += 1;
      else if (d < 14) lastWeek += 1;
      if (d < 30) thisMonth += 1;
    }
    const parts = a.dateApplied?.split("-");
    if (parts && parts.length >= 2 && !parts.slice(0, 2).some((p) => !p)) {
      const key = `${parts[0]}-${parts[1].padStart(2, "0")}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    }
  }

  // Build a continuous monthly series (zero-filled) for the last 12 months
  // with data, so the trend reads honestly rather than skipping quiet months.
  const sortedKeys = Object.keys(monthCounts).sort();
  let byMonth: { month: string; count: number }[] = [];
  if (sortedKeys.length > 0) {
    const [startY, startM] = sortedKeys[0].split("-").map(Number);
    const cursor = new Date(startY, startM - 1, 1);
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      byMonth.push({ month: key, count: monthCounts[key] || 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    byMonth = byMonth.slice(-12);
  }

  const busiestMonth =
    sortedKeys.length > 0
      ? Object.entries(monthCounts)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => b.count - a.count)[0]
      : null;

  const companyCounts = apps.reduce<Record<string, number>>((acc, a) => {
    const name = a.company?.trim();
    if (name) acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topCompanies = Object.entries(companyCounts)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // The neglect list: in-play applications, stalest first. Apps with an
  // upcoming next step are excluded — a booked interview isn't neglect.
  const staleness = apps
    .filter((a) => {
      if (!ACTIVE_STATUSES.includes(a.status)) return false;
      if (!a.nextActionDate) return true;
      const untilAction = daysSince(a.nextActionDate);
      return untilAction === null || untilAction > 0;
    })
    .map((a) => ({
      id: a.id,
      company: a.company,
      position: a.position,
      status: a.status,
      daysQuiet: daysSince(a.lastActivityAt) ?? 0,
    }))
    .sort((a, b) => b.daysQuiet - a.daysQuiet)
    .slice(0, 8);

  return {
    total,
    statusCounts,
    submitted,
    interviewRate:
      submitted > 0 ? Math.round((funnel.interviewed / submitted) * 100) : 0,
    offerRate:
      submitted > 0 ? Math.round((funnel.offered / submitted) * 100) : 0,
    followUpsDue,
    winRate: decided > 0 ? Math.round((offered / decided) * 100) : null,
    decided,
    thisWeek,
    lastWeek,
    thisMonth,
    byMonth,
    busiestMonth,
    topCompanies,
    funnel,
    sourceConversion,
    staleness,
  };
}
