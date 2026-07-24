import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JobApplication } from "@/constants/types";
import type { Status } from "@/constants/generic";
import { derive, type StatusHistory } from "./stats";

const TODAY = new Date(2026, 5, 8); // 2026-06-08 (local)

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

let seq = 0;
function makeApp(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: `app-${(seq += 1)}`,
    kind: "job",
    company: "Acme",
    position: "Engineer",
    status: "Applied",
    dateApplied: "2026-06-01",
    lastActivityAt: "2026-06-07T00:00:00",
    notes: "",
    link: "",
    location: "",
    salary: "",
    source: "",
    contact: "",
    nextActionDate: "",
    nextActionNote: "",
    checklist: {
      resumeSent: false,
      coverLetterSent: false,
      followUpSent: false,
    },
    ...overrides,
  };
}

const run = (apps: JobApplication[], history: StatusHistory = {}) =>
  derive(apps, history);

describe("derive — funnel", () => {
  it("counts stages an application only ever reached in the past", () => {
    // Rejected after interviewing: the snapshot says "Rejected", but the app
    // did reach the interview stage and the funnel must not forget it.
    const app = makeApp({ status: "Rejected" });
    const stats = run([app], { [app.id]: ["Applied", "Interviewing"] });

    expect(stats.funnel).toEqual({
      submitted: 1,
      interviewed: 1,
      offered: 0,
    });
  });

  it("works without any history, from current status alone", () => {
    const stats = run([
      makeApp({ status: "Interviewing" }),
      makeApp({ status: "Pending" }),
    ]);
    expect(stats.funnel).toEqual({
      submitted: 1,
      interviewed: 1,
      offered: 0,
    });
  });

  it("excludes never-submitted applications from the funnel", () => {
    const stats = run([
      makeApp({ status: "Pending" }),
      makeApp({ status: "Closed" }),
    ]);
    expect(stats.funnel.submitted).toBe(0);
    expect(stats.submitted).toBe(0);
  });

  it("reports rates as whole percentages of submitted", () => {
    const stats = run([
      makeApp({ status: "Applied" }),
      makeApp({ status: "Applied" }),
      makeApp({ status: "Interviewing" }),
      makeApp({ status: "Offered" }),
    ]);
    // 4 submitted, 2 interviewed, 1 offered.
    expect(stats.interviewRate).toBe(50);
    expect(stats.offerRate).toBe(25);
  });

  it("returns zero rates rather than dividing by zero", () => {
    const stats = run([makeApp({ status: "Pending" })]);
    expect(stats.interviewRate).toBe(0);
    expect(stats.offerRate).toBe(0);
  });
});

describe("derive — win rate", () => {
  it("counts only decided outcomes", () => {
    const stats = run([
      makeApp({ status: "Offered" }),
      makeApp({ status: "Rejected" }),
      makeApp({ status: "Rejected" }),
      makeApp({ status: "Applied" }), // undecided, excluded
    ]);
    expect(stats.decided).toBe(3);
    expect(stats.winRate).toBe(33);
  });

  it("is null when nothing has been decided", () => {
    const stats = run([makeApp({ status: "Applied" })]);
    expect(stats.winRate).toBeNull();
    expect(stats.decided).toBe(0);
  });
});

describe("derive — source conversion", () => {
  it("buckets each application once, at the furthest stage it reached", () => {
    const offered = makeApp({ status: "Offered", source: "Referral" });
    const interviewed = makeApp({ status: "Interviewing", source: "Referral" });
    const plain = makeApp({ status: "Applied", source: "Referral" });
    const stats = run([offered, interviewed, plain]);

    expect(stats.sourceConversion).toEqual([
      { source: "Referral", offered: 1, interviewed: 1, noInterview: 1 },
    ]);
  });

  it("groups blank sources under Untagged", () => {
    const stats = run([
      makeApp({ status: "Applied", source: "" }),
      makeApp({ status: "Applied", source: "   " }),
    ]);
    expect(stats.sourceConversion).toEqual([
      { source: "Untagged", offered: 0, interviewed: 0, noInterview: 2 },
    ]);
  });

  it("ignores applications that were never submitted", () => {
    const stats = run([makeApp({ status: "Pending", source: "LinkedIn" })]);
    expect(stats.sourceConversion).toEqual([]);
  });

  it("ranks by volume and keeps at most eight sources", () => {
    const apps = Array.from({ length: 10 }, (_, i) =>
      makeApp({ status: "Applied", source: `src-${i}` }),
    );
    // Give the last source two applications so it must sort to the front.
    apps.push(makeApp({ status: "Applied", source: "src-9" }));

    const stats = run(apps);
    expect(stats.sourceConversion).toHaveLength(8);
    expect(stats.sourceConversion[0].source).toBe("src-9");
  });
});

describe("derive — staleness", () => {
  it("lists active applications quietest-first", () => {
    const stats = run([
      makeApp({ status: "Applied", lastActivityAt: "2026-06-06T00:00:00" }),
      makeApp({ status: "Applied", lastActivityAt: "2026-05-01T00:00:00" }),
    ]);
    expect(stats.staleness.map((s) => s.daysQuiet)).toEqual([38, 2]);
  });

  it("excludes terminal statuses however long they've been quiet", () => {
    const stats = run([
      makeApp({ status: "Rejected", lastActivityAt: "2020-01-01T00:00:00" }),
      makeApp({ status: "Offered", lastActivityAt: "2020-01-01T00:00:00" }),
      makeApp({ status: "Closed", lastActivityAt: "2020-01-01T00:00:00" }),
    ]);
    expect(stats.staleness).toEqual([]);
  });

  it("excludes anything with a next step still ahead — that isn't neglect", () => {
    const stats = run([
      makeApp({
        status: "Applied",
        lastActivityAt: "2026-01-01T00:00:00",
        nextActionDate: "2026-06-20",
      }),
    ]);
    expect(stats.staleness).toEqual([]);
  });

  it("includes one whose scheduled step has already passed", () => {
    const stats = run([
      makeApp({
        status: "Applied",
        lastActivityAt: "2026-01-01T00:00:00",
        nextActionDate: "2026-06-01",
      }),
    ]);
    expect(stats.staleness).toHaveLength(1);
  });

  it("caps the list at eight", () => {
    const apps = Array.from({ length: 12 }, () =>
      makeApp({ status: "Applied", lastActivityAt: "2026-01-01T00:00:00" }),
    );
    expect(run(apps).staleness).toHaveLength(8);
  });
});

describe("derive — activity windows", () => {
  it("splits this week from last week", () => {
    const stats = run([
      makeApp({ dateApplied: "2026-06-07" }), // 1 day ago
      makeApp({ dateApplied: "2026-06-03" }), // 5 days ago
      makeApp({ dateApplied: "2026-05-30" }), // 9 days ago
      makeApp({ dateApplied: "2026-04-01" }), // outside both
    ]);
    expect(stats.thisWeek).toBe(2);
    expect(stats.lastWeek).toBe(1);
    expect(stats.thisMonth).toBe(3);
  });

  it("ignores future-dated applications in the rolling windows", () => {
    const stats = run([makeApp({ dateApplied: "2026-07-01" })]);
    expect(stats.thisWeek).toBe(0);
    expect(stats.thisMonth).toBe(0);
  });
});

describe("derive — monthly series", () => {
  it("zero-fills quiet months so the trend doesn't skip them", () => {
    const stats = run([
      makeApp({ dateApplied: "2026-03-15" }),
      makeApp({ dateApplied: "2026-06-02" }),
    ]);
    expect(stats.byMonth).toEqual([
      { month: "2026-03", count: 1 },
      { month: "2026-04", count: 0 },
      { month: "2026-05", count: 0 },
      { month: "2026-06", count: 1 },
    ]);
  });

  it("keeps at most the last twelve months", () => {
    const apps = Array.from({ length: 20 }, (_, i) =>
      makeApp({ dateApplied: `2025-${String((i % 12) + 1).padStart(2, "0")}-01` }),
    );
    expect(run(apps).byMonth.length).toBeLessThanOrEqual(12);
  });

  it("reports the busiest month", () => {
    const stats = run([
      makeApp({ dateApplied: "2026-04-01" }),
      makeApp({ dateApplied: "2026-04-14" }),
      makeApp({ dateApplied: "2026-06-01" }),
    ]);
    expect(stats.busiestMonth).toEqual({ month: "2026-04", count: 2 });
  });

  it("has no series or busiest month without dated applications", () => {
    const stats = run([makeApp({ dateApplied: "" })]);
    expect(stats.byMonth).toEqual([]);
    expect(stats.busiestMonth).toBeNull();
  });
});

describe("derive — top companies", () => {
  it("ranks by count and keeps at most six", () => {
    const apps = [
      ...Array.from({ length: 3 }, () => makeApp({ company: "Acme" })),
      ...Array.from({ length: 7 }, (_, i) => makeApp({ company: `Co-${i}` })),
    ];
    const top = run(apps).topCompanies;
    expect(top).toHaveLength(6);
    expect(top[0]).toEqual({ company: "Acme", count: 3 });
  });

  it("skips blank company names", () => {
    const stats = run([makeApp({ company: "  " })]);
    expect(stats.topCompanies).toEqual([]);
  });
});

describe("derive — headline counts", () => {
  it("counts follow-ups due, excluding terminal and scheduled ones", () => {
    const stats = run([
      makeApp({ status: "Applied", lastActivityAt: "2026-05-01T00:00:00" }),
      makeApp({ status: "Offered", lastActivityAt: "2020-01-01T00:00:00" }),
      makeApp({
        status: "Applied",
        lastActivityAt: "2026-05-01T00:00:00",
        nextActionDate: "2026-06-20",
      }),
    ]);
    expect(stats.followUpsDue).toBe(1);
  });

  it("tallies each status", () => {
    const stats = run([
      makeApp({ status: "Applied" }),
      makeApp({ status: "Applied" }),
      makeApp({ status: "Offered" }),
    ]);
    expect(stats.statusCounts).toEqual({ Applied: 2, Offered: 1 });
    expect(stats.total).toBe(3);
  });

  it("handles an empty list without dividing by zero", () => {
    const stats = run([]);
    expect(stats.total).toBe(0);
    expect(stats.interviewRate).toBe(0);
    expect(stats.winRate).toBeNull();
    expect(stats.byMonth).toEqual([]);
    expect(stats.busiestMonth).toBeNull();
    expect(stats.staleness).toEqual([]);
  });
});

describe("derive — purity", () => {
  it("never mutates or reorders the input array", () => {
    const apps = [
      makeApp({ company: "Zeta", status: "Applied" }),
      makeApp({ company: "Alpha", status: "Offered" }),
    ];
    const snapshot = JSON.parse(JSON.stringify(apps));
    const order = apps.map((a) => a.id);

    run(apps, { [apps[0].id]: ["Interviewing" as Status] });

    expect(apps).toEqual(snapshot);
    expect(apps.map((a) => a.id)).toEqual(order);
  });
});
