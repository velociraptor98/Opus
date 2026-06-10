import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { needsFollowUp, sortApplications } from "./generic";
import type { JobApplication } from "./types";

const TODAY = new Date(2026, 5, 8); // 2026-06-08 (local)

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

/** Minimal JobApplication factory — override only the fields a test cares about. */
function makeApp(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: "1",
    company: "Acme",
    position: "Engineer",
    status: "Applied",
    dateApplied: "2026-06-01",
    lastActivityAt: "2026-06-01T00:00:00",
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

describe("needsFollowUp", () => {
  it("flags an active application quiet past the threshold", () => {
    // 8 days since last activity, status still in play.
    expect(needsFollowUp("Applied", "2026-05-31")).toBe(true);
  });

  it("does not flag recent activity", () => {
    expect(needsFollowUp("Applied", "2026-06-05")).toBe(false);
  });

  it("flags exactly at the 7-day boundary", () => {
    expect(needsFollowUp("Applied", "2026-06-01")).toBe(true);
  });

  it("never flags terminal statuses, however stale", () => {
    expect(needsFollowUp("Offered", "2020-01-01")).toBe(false);
    expect(needsFollowUp("Rejected", "2020-01-01")).toBe(false);
    expect(needsFollowUp("Closed", "2020-01-01")).toBe(false);
  });

  it("does not flag when the activity date is missing", () => {
    expect(needsFollowUp("Applied", "")).toBe(false);
  });

  it("suppresses the nudge when a next action is scheduled today or later", () => {
    // Stale, but an interview is on the calendar — no nudge needed.
    expect(needsFollowUp("Applied", "2026-05-01", "2026-06-08")).toBe(false);
    expect(needsFollowUp("Applied", "2026-05-01", "2026-06-20")).toBe(false);
  });

  it("resumes nudging once the scheduled next action has passed", () => {
    expect(needsFollowUp("Applied", "2026-05-01", "2026-06-05")).toBe(true);
  });

  it("ignores an unparseable next action date", () => {
    expect(needsFollowUp("Applied", "2026-05-01", "not-a-date")).toBe(true);
  });
});

describe("sortApplications", () => {
  it("does not mutate the input array", () => {
    const apps = [makeApp({ id: "a", company: "B" }), makeApp({ id: "b", company: "A" })];
    const before = [...apps];
    sortApplications(apps, "Company A–Z");
    expect(apps).toEqual(before);
  });

  it("'Recently added' preserves the incoming order", () => {
    const apps = [makeApp({ id: "a" }), makeApp({ id: "b" }), makeApp({ id: "c" })];
    expect(sortApplications(apps, "Recently added").map((a) => a.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("'Company A–Z' sorts case-insensitively", () => {
    const apps = [
      makeApp({ id: "1", company: "banana" }),
      makeApp({ id: "2", company: "Apple" }),
      makeApp({ id: "3", company: "cherry" }),
    ];
    expect(sortApplications(apps, "Company A–Z").map((a) => a.company)).toEqual([
      "Apple",
      "banana",
      "cherry",
    ]);
  });

  it("'Newest applied' orders most-recent first", () => {
    const apps = [
      makeApp({ id: "old", dateApplied: "2026-01-01" }),
      makeApp({ id: "new", dateApplied: "2026-06-01" }),
      makeApp({ id: "mid", dateApplied: "2026-03-01" }),
    ];
    expect(sortApplications(apps, "Newest applied").map((a) => a.id)).toEqual([
      "new",
      "mid",
      "old",
    ]);
  });

  it("'Oldest applied' orders oldest first", () => {
    const apps = [
      makeApp({ id: "new", dateApplied: "2026-06-01" }),
      makeApp({ id: "old", dateApplied: "2026-01-01" }),
    ];
    expect(sortApplications(apps, "Oldest applied").map((a) => a.id)).toEqual([
      "old",
      "new",
    ]);
  });

  it("sinks empty dates to the bottom regardless of direction", () => {
    const apps = [
      makeApp({ id: "empty", dateApplied: "" }),
      makeApp({ id: "dated", dateApplied: "2026-01-01" }),
    ];
    expect(sortApplications(apps, "Newest applied").map((a) => a.id)).toEqual([
      "dated",
      "empty",
    ]);
    expect(sortApplications(apps, "Oldest applied").map((a) => a.id)).toEqual([
      "dated",
      "empty",
    ]);
  });

  it("'Follow-up first' surfaces flagged apps, most stale first", () => {
    const apps = [
      makeApp({ id: "fresh", status: "Applied", lastActivityAt: "2026-06-07" }),
      makeApp({ id: "stale", status: "Applied", lastActivityAt: "2026-05-20" }),
      makeApp({ id: "stalest", status: "Applied", lastActivityAt: "2026-05-01" }),
    ];
    expect(sortApplications(apps, "Follow-up first").map((a) => a.id)).toEqual([
      "stalest",
      "stale",
      "fresh",
    ]);
  });
});
