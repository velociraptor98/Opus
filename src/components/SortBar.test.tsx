import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SORT_OPTIONS } from "@/constants/generic";
import { SortBar } from "./SortBar";

describe("SortBar", () => {
  it("renders every sort option", () => {
    render(<SortBar sort="Recently added" setSort={vi.fn()} setPage={vi.fn()} />);
    const select = screen.getByRole("combobox", { name: /sort applications/i });
    const rendered = Array.from(select.querySelectorAll("option")).map(
      (o) => o.textContent,
    );
    expect(rendered).toEqual(SORT_OPTIONS);
  });

  it("reflects the current sort value", () => {
    render(<SortBar sort="Company A–Z" setSort={vi.fn()} setPage={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveValue("Company A–Z");
  });

  it("updates the sort and resets pagination on change", async () => {
    const setSort = vi.fn();
    const setPage = vi.fn();
    render(<SortBar sort="Recently added" setSort={setSort} setPage={setPage} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "Newest applied",
    );

    expect(setSort).toHaveBeenCalledWith("Newest applied");
    expect(setPage).toHaveBeenCalledWith(0);
  });
});
