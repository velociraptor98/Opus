import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JobApplication } from "@/constants/types";
import { FilterPanel } from "./FilterPanel";

const TODAY = new Date(2026, 5, 8); // 2026-06-08 (local)

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

function makeApp(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: Math.random().toString(),
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
    checklist: { resumeSent: false, coverLetterSent: false, followUpSent: false },
    ...overrides,
  };
}

/** Find a filter button by its visible label and return its trailing count. */
function countFor(label: string): string {
  const button = screen.getByRole("button", { name: new RegExp(label) });
  // The count is the last text node in the button.
  const spans = within(button).getAllByText(/\d+/);
  return spans[spans.length - 1].textContent ?? "";
}

describe("FilterPanel", () => {
  const apps = [
    makeApp({ status: "Applied", lastActivityAt: "2026-06-07T00:00:00" }), // fresh
    makeApp({ status: "Applied", lastActivityAt: "2026-05-01T00:00:00" }), // stale -> follow-up
    makeApp({ status: "Interviewing", lastActivityAt: "2026-06-07T00:00:00" }),
    makeApp({ status: "Offered", lastActivityAt: "2020-01-01T00:00:00" }), // terminal, never follow-up
  ];

  it("shows the total count for All", () => {
    render(
      <FilterPanel
        statusFilter="All"
        setStatusFilter={vi.fn()}
        setPage={vi.fn()}
        applications={apps}
      />,
    );
    expect(countFor("All")).toBe("4");
  });

  it("counts per-status applications", () => {
    render(
      <FilterPanel
        statusFilter="All"
        setStatusFilter={vi.fn()}
        setPage={vi.fn()}
        applications={apps}
      />,
    );
    expect(countFor("Applied")).toBe("2");
    expect(countFor("Interviewing")).toBe("1");
    expect(countFor("Offered")).toBe("1");
    expect(countFor("Rejected")).toBe("0");
  });

  it("counts only active, stale applications as follow-ups", () => {
    render(
      <FilterPanel
        statusFilter="All"
        setStatusFilter={vi.fn()}
        setPage={vi.fn()}
        applications={apps}
      />,
    );
    // Only the one stale Applied app — the stale Offered one is terminal.
    expect(countFor("Follow-up")).toBe("1");
  });

  it("selects a filter and resets pagination on click", async () => {
    vi.useRealTimers(); // userEvent drives its own timers
    const setStatusFilter = vi.fn();
    const setPage = vi.fn();
    render(
      <FilterPanel
        statusFilter="All"
        setStatusFilter={setStatusFilter}
        setPage={setPage}
        applications={apps}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /Interviewing/ }),
    );

    expect(setStatusFilter).toHaveBeenCalledWith("Interviewing");
    expect(setPage).toHaveBeenCalledWith(0);
  });
});
