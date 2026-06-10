import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/context/ToastContext";
import type { JobApplication } from "@/constants/types";
import { JobCard } from "./JobCard";

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

// JobCard calls useToast and renders modals via portals into document.body,
// so it must be wrapped in a ToastProvider. userEvent needs real timers, but
// the component reads `new Date()` at render — so set the system time, render,
// then swap to real timers for the interaction.
function renderCard(props: Partial<JobApplication> = {}, handlers = {}) {
  const onUpdate = vi.fn().mockResolvedValue(true);
  const onDelete = vi.fn();
  const utils = render(
    <ToastProvider>
      <JobCard
        application={makeApp(props)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        {...handlers}
      />
    </ToastProvider>,
  );
  return { onUpdate, onDelete, ...utils };
}

describe("JobCard", () => {
  it("renders the core application fields", () => {
    renderCard({ company: "Globex", position: "Designer", status: "Interviewing" });
    expect(screen.getByRole("heading", { name: "Globex" })).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    // The status pill text and its dropdown's selected option both say
    // "Interviewing" — assert via the select's value.
    expect(screen.getByRole("combobox", { name: "Change status" })).toHaveValue(
      "Interviewing",
    );
  });

  it("changes status straight from the pill without entering edit mode", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { onUpdate } = renderCard({ status: "Applied" });

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Change status" }),
      "Interviewing",
    );

    expect(onUpdate).toHaveBeenCalledWith("job-1", { status: "Interviewing" });
  });

  it("shows the scheduled next step instead of a follow-up nudge", () => {
    renderCard({
      status: "Applied",
      lastActivityAt: "2026-05-01T00:00:00",
      nextActionDate: "2026-06-10",
      nextActionNote: "Phone screen",
    });
    expect(screen.getByText(/phone screen/i)).toBeInTheDocument();
    expect(screen.queryByText(/follow up/i)).not.toBeInTheDocument();
  });

  it("shows the follow-up pill for a stale active application", () => {
    renderCard({ status: "Applied", lastActivityAt: "2026-05-01T00:00:00" });
    expect(screen.getByText(/follow up/i)).toBeInTheDocument();
  });

  it("hides the follow-up pill for recent activity", () => {
    renderCard({ status: "Applied", lastActivityAt: "2026-06-07T00:00:00" });
    expect(screen.queryByText(/follow up/i)).not.toBeInTheDocument();
  });

  it("never shows the follow-up pill for terminal statuses", () => {
    renderCard({ status: "Offered", lastActivityAt: "2020-01-01T00:00:00" });
    expect(screen.queryByText(/follow up/i)).not.toBeInTheDocument();
  });

  it("only renders an external link when one is present", () => {
    const { rerender } = renderCard({ link: "" });
    expect(screen.queryByTitle("Open link")).not.toBeInTheDocument();

    rerender(
      <ToastProvider>
        <JobCard
          application={makeApp({ link: "https://jobs.example.com" })}
          onUpdate={vi.fn().mockResolvedValue(true)}
          onDelete={vi.fn()}
        />
      </ToastProvider>,
    );
    expect(screen.getByTitle("Open link")).toHaveAttribute(
      "href",
      "https://jobs.example.com",
    );
  });

  it("enters edit mode and persists changes via onUpdate", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { onUpdate } = renderCard({ company: "Acme" });

    await user.click(screen.getByTitle("Edit"));

    const companyInput = screen.getByPlaceholderText("Company");
    await user.clear(companyInput);
    await user.type(companyInput, "Initech");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onUpdate).toHaveBeenCalledWith(
      "job-1",
      expect.objectContaining({ company: "Initech" }),
    );
  });

  it("opens a confirmation dialog before deleting", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const { onDelete } = renderCard();

    await user.click(screen.getByTitle("Delete"));

    // Confirm modal is now in the document (portaled to body).
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText(/delete application\?/i)).toBeInTheDocument();
    // Nothing deleted until the user confirms.
    expect(onDelete).not.toHaveBeenCalled();

    // The icon button and the confirm button share the name "Delete";
    // scope to the dialog to hit the confirm action.
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("job-1");
  });
});
