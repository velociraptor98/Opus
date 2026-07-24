import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

function Dialog({
  onClose = vi.fn(),
  closeOnBackdrop = true,
}: {
  onClose?: () => void;
  closeOnBackdrop?: boolean;
}) {
  return (
    <Modal onClose={onClose} labelledBy="t" closeOnBackdrop={closeOnBackdrop}>
      <h3 id="t">Edit thing</h3>
      <input aria-label="First" />
      <input aria-label="Second" />
      <button>Save</button>
    </Modal>
  );
}

describe("Modal", () => {
  it("exposes a labelled dialog to assistive tech", () => {
    render(<Dialog />);
    expect(screen.getByRole("dialog", { name: "Edit thing" })).toHaveAttribute(
      "aria-modal",
      "true",
    );
  });

  it("uses a literal label when there's no visible title to point at", () => {
    render(
      <Modal onClose={vi.fn()} label="Quick action">
        <button>Go</button>
      </Modal>,
    );
    expect(screen.getByRole("dialog", { name: "Quick action" })).toBeInTheDocument();
  });

  it("moves focus into the dialog on open", () => {
    render(<Dialog />);
    expect(screen.getByLabelText("First")).toHaveFocus();
  });

  it("honours an explicit autoFocus over the first focusable", () => {
    render(
      <Modal onClose={vi.fn()} label="d">
        <button>First</button>
        <button autoFocus>Preferred</button>
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Preferred" })).toHaveFocus();
  });

  it("returns focus to the trigger when it closes", async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          {open && (
            <Modal onClose={() => setOpen(false)} label="d">
              <button onClick={() => setOpen(false)}>Close</button>
            </Modal>
          )}
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on a backdrop click by default", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<Dialog onClose={onClose} />);
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps a form open when the backdrop is opted out", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Dialog onClose={onClose} closeOnBackdrop={false} />,
    );
    await user.click(container.firstChild as Element);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("doesn't close when the panel itself is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Dialog onClose={onClose} />);
    await user.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("wraps Tab from the last focusable back to the first", async () => {
    const user = userEvent.setup();
    render(<Dialog />);
    screen.getByRole("button", { name: "Save" }).focus();
    await user.tab();
    expect(screen.getByLabelText("First")).toHaveFocus();
  });

  it("wraps Shift+Tab from the first focusable to the last", async () => {
    const user = userEvent.setup();
    render(<Dialog />);
    screen.getByLabelText("First").focus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  describe("nesting", () => {
    it("lets only the topmost dialog answer Escape", async () => {
      const user = userEvent.setup();
      const closeOuter = vi.fn();
      const closeInner = vi.fn();
      render(
        <>
          <Modal onClose={closeOuter} label="outer">
            <button>Outer</button>
          </Modal>
          <Modal onClose={closeInner} label="inner">
            <button>Inner</button>
          </Modal>
        </>,
      );

      await user.keyboard("{Escape}");

      expect(closeInner).toHaveBeenCalled();
      expect(closeOuter).not.toHaveBeenCalled();
    });
  });
});
