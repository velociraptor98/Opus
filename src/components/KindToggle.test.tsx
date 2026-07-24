import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { JobApplication } from "@/constants/types";
import type { ApplicationKind } from "@/constants/kind";
import { KindToggle } from "./KindToggle";

function makeApp(kind: ApplicationKind, id: string): JobApplication {
  return {
    id,
    kind,
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
  };
}

const apps = [
  makeApp("job", "1"),
  makeApp("job", "2"),
  makeApp("university", "3"),
];

describe("KindToggle", () => {
  it("counts each kind separately", () => {
    render(<KindToggle kind="job" setKind={vi.fn()} applications={apps} />);
    expect(screen.getByRole("button", { name: /Jobs/ })).toHaveTextContent("2");
    expect(
      screen.getByRole("button", { name: /Universities/ }),
    ).toHaveTextContent("1");
  });

  it("marks the active segment as pressed", () => {
    render(
      <KindToggle kind="university" setKind={vi.fn()} applications={apps} />,
    );
    expect(screen.getByRole("button", { name: /Universities/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /Jobs/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("switches kind on click", async () => {
    const user = userEvent.setup();
    const setKind = vi.fn();
    render(<KindToggle kind="job" setKind={setKind} applications={apps} />);

    await user.click(screen.getByRole("button", { name: /Universities/ }));

    expect(setKind).toHaveBeenCalledWith("university");
  });

  it("shows a zero rather than hiding an empty track", () => {
    render(
      <KindToggle
        kind="job"
        setKind={vi.fn()}
        applications={[makeApp("job", "1")]}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Universities/ }),
    ).toHaveTextContent("0");
  });
});
