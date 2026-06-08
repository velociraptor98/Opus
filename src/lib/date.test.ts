import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { daysSince, formatExactDate, formatRelativeDate } from "./date";

// Pin "today" to a fixed local date so the relative-date math is deterministic.
const TODAY = new Date(2026, 5, 8); // 2026-06-08 (local)

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("daysSince", () => {
  it("returns null for empty or unparseable input", () => {
    expect(daysSince("")).toBeNull();
    expect(daysSince("not-a-date")).toBeNull();
  });

  it("returns 0 for today", () => {
    expect(daysSince("2026-06-08")).toBe(0);
  });

  it("counts whole days in the past as positive", () => {
    expect(daysSince("2026-06-01")).toBe(7);
  });

  it("counts future dates as negative", () => {
    expect(daysSince("2026-06-10")).toBe(-2);
  });

  it("ignores the time-of-day component", () => {
    // Same calendar day, different time — still 0 days.
    expect(daysSince("2026-06-08T23:59:00")).toBe(0);
  });
});

describe("formatRelativeDate", () => {
  it("returns empty string for empty input", () => {
    expect(formatRelativeDate("")).toBe("");
  });

  it("echoes back unparseable input unchanged", () => {
    expect(formatRelativeDate("garbage")).toBe("garbage");
  });

  it("handles the named boundaries", () => {
    expect(formatRelativeDate("2026-06-08")).toBe("Today");
    expect(formatRelativeDate("2026-06-07")).toBe("Yesterday");
    expect(formatRelativeDate("2026-06-09")).toBe("Tomorrow");
  });

  it("pluralizes past durations across units", () => {
    expect(formatRelativeDate("2026-06-05")).toBe("3 days ago");
    expect(formatRelativeDate("2026-05-25")).toBe("2 weeks ago");
    expect(formatRelativeDate("2026-04-08")).toBe("2 months ago");
    expect(formatRelativeDate("2024-06-08")).toBe("2 years ago");
  });

  it("formats future durations with an 'In' prefix", () => {
    expect(formatRelativeDate("2026-06-11")).toBe("In 3 days");
    expect(formatRelativeDate("2026-06-22")).toBe("In 2 weeks");
  });
});

describe("formatExactDate", () => {
  it("returns empty string for empty input", () => {
    expect(formatExactDate("")).toBe("");
  });

  it("echoes back unparseable input unchanged", () => {
    expect(formatExactDate("nope")).toBe("nope");
  });

  it("formats a valid date as a short, human-readable string", () => {
    // Locale-dependent formatting; assert on the stable parts.
    const result = formatExactDate("2026-06-01");
    expect(result).toContain("2026");
    expect(result).toContain("1");
  });
});
