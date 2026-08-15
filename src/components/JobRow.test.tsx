import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JobApplication } from "@/constants/types";
import { JobRow } from "./JobRow";

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
    id: "job-1",
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
    checklist: { resumeSent: false, coverLetterSent: false, followUpSent: false },
    ...overrides,
  };
}

// A <tr> can only be rendered inside a table, so every case mounts one.
function renderRow(props: Partial<JobApplication> = {}) {
  const onOpen = vi.fn();
  const utils = render(
    <table>
      <tbody>
        <JobRow application={makeApp(props)} onOpen={onOpen} />
      </tbody>
    </table>,
  );
  return { onOpen, ...utils };
}

describe("JobRow", () => {
  it("renders the core application fields", () => {
    renderRow({ company: "Globex", position: "Designer", status: "Interviewing" });
    expect(screen.getByRole("button", { name: "Globex" })).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(screen.getByText("Interviewing")).toBeInTheDocument();
  });

  it("falls back to a dash for the columns with nothing in them", () => {
    renderRow({ location: "", source: "" });
    // Location, source and next step are all empty on this fixture.
    expect(screen.getAllByText("—")).toHaveLength(3);
  });

  it("opens the detail dialog from the row", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { onOpen } = renderRow({ company: "Acme" });

    await user.click(screen.getByRole("button", { name: "Acme" }));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  describe("the next-step column", () => {
    it("shows the scheduled step instead of a follow-up nudge", () => {
      renderRow({
        status: "Applied",
        lastActivityAt: "2026-05-01T00:00:00",
        nextActionDate: "2026-06-10",
        nextActionNote: "Phone screen",
      });
      expect(screen.getByText(/phone screen/i)).toBeInTheDocument();
      expect(screen.queryByText(/follow up · due/i)).not.toBeInTheDocument();
    });

    it("marks a scheduled step that has been missed", () => {
      renderRow({ nextActionDate: "2026-06-01", nextActionNote: "Nudge" });
      expect(screen.getByText("Nudge · missed")).toBeInTheDocument();
    });

    it("nudges a stale active application", () => {
      renderRow({ status: "Applied", lastActivityAt: "2026-05-01T00:00:00" });
      expect(screen.getByText("Follow up · due")).toBeInTheDocument();
    });

    it("stays quiet for recent activity", () => {
      renderRow({ status: "Applied", lastActivityAt: "2026-06-07T00:00:00" });
      expect(screen.queryByText(/follow up/i)).not.toBeInTheDocument();
    });

    it("never nudges a terminal status", () => {
      renderRow({ status: "Offered", lastActivityAt: "2020-01-01T00:00:00" });
      expect(screen.queryByText(/follow up/i)).not.toBeInTheDocument();
    });
  });

  describe("the status tag", () => {
    it("reads Follow-up once an application has gone quiet", () => {
      renderRow({ status: "Applied", lastActivityAt: "2026-05-01T00:00:00" });
      // The tag and the next-step column both say so; the tag is the short one.
      expect(screen.getByText("Follow-up")).toBeInTheDocument();
    });

    it("keeps the status when a scheduled step suppresses the nudge", () => {
      renderRow({
        status: "Applied",
        lastActivityAt: "2026-05-01T00:00:00",
        nextActionDate: "2026-06-10",
      });
      expect(screen.getByText("Applied")).toBeInTheDocument();
    });
  });

  describe("university applications", () => {
    it("shows the admissions label for a stored status", () => {
      renderRow({ kind: "university", status: "Offered" });
      expect(screen.getByText("Accepted")).toBeInTheDocument();
      expect(screen.queryByText("Offered")).not.toBeInTheDocument();
    });
  });
});
