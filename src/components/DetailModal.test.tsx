import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/context/ToastContext";
import type { JobApplication } from "@/constants/types";
import { DetailModal } from "./DetailModal";

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

function renderModal(props: Partial<JobApplication> = {}) {
  const onUpdate = vi.fn().mockResolvedValue(true);
  const onDelete = vi.fn();
  const onClose = vi.fn();
  const utils = render(
    <ToastProvider>
      <DetailModal
        application={makeApp(props)}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
      />
    </ToastProvider>,
  );
  return { onUpdate, onDelete, onClose, ...utils };
}

const save = () => screen.getByRole("button", { name: "SAVE CHANGES" });

describe("DetailModal", () => {
  it("persists an edit via onUpdate", async () => {
    const user = userEvent.setup();
    const { onUpdate, onClose } = renderModal({ company: "Acme" });

    const company = screen.getByLabelText("Company");
    await user.clear(company);
    await user.type(company, "Initech");
    await user.click(save());

    expect(onUpdate).toHaveBeenCalledWith("job-1", { company: "Initech" });
    expect(onClose).toHaveBeenCalled();
  });

  // The dialog owns every editable field, so sending the whole draft on each
  // save would put `status` in every write — and a write carrying a status is
  // what resets the follow-up clock upstream. Fixing a typo would silently
  // mark a quiet application as active again.
  it("writes only the fields that actually changed", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderModal({ notes: "Spoke to the recruiter" });

    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.click(save());

    expect(Object.keys(onUpdate.mock.calls.at(-1)![1])).toEqual(["location"]);
  });

  it("saves nothing at all when nothing moved", async () => {
    const user = userEvent.setup();
    const { onUpdate, onClose } = renderModal();

    await user.click(save());

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps a cancelled edit out of the write", async () => {
    const user = userEvent.setup();
    const { onUpdate, onClose } = renderModal();

    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.click(screen.getByRole("button", { name: "CANCEL" }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("carries a checklist toggle into the same save", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderModal();

    await user.click(screen.getByLabelText("Follow-up"));
    await user.click(save());

    expect(onUpdate).toHaveBeenCalledWith("job-1", {
      checklist: {
        resumeSent: false,
        coverLetterSent: false,
        followUpSent: true,
      },
    });
  });

  it("opens a confirmation before deleting", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderModal();

    await user.click(screen.getByRole("button", { name: "DELETE" }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText(/delete application\?/i)).toBeInTheDocument();
    // Nothing deleted until the user confirms.
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "DELETE" }));
    expect(onDelete).toHaveBeenCalledWith("job-1");
  });

  describe("university applications", () => {
    it("labels the fields for admissions", () => {
      renderModal({ kind: "university" });
      expect(screen.getByLabelText("Institution")).toBeInTheDocument();
      expect(screen.getByLabelText("Programme")).toBeInTheDocument();
      expect(screen.getByLabelText("Campus")).toBeInTheDocument();
    });

    it("stores the underlying status behind the admissions label", async () => {
      const user = userEvent.setup();
      const { onUpdate } = renderModal({ kind: "university", status: "Applied" });

      const select = screen.getByLabelText("Status");
      // The option reads "Accepted"; its value is the stored "Offered".
      expect(within(select).getByRole("option", { name: "Accepted" })).toHaveValue(
        "Offered",
      );

      await user.selectOptions(select, "Offered");
      await user.click(save());

      expect(onUpdate).toHaveBeenCalledWith("job-1", { status: "Offered" });
    });
  });
});
