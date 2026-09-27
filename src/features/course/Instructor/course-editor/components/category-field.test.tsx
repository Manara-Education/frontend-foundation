import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryField } from "./category-field";

const READY = { status: "ready" as const, categories: [{ id: 1, name: "البرمجة", color: "indigo" }, { id: 2, name: "لغات", color: "teal" }] };

describe("course category field", () => {
  it("offers 'no category' and the active categories, and reports the choice as an id", async () => {
    const onChange = vi.fn();
    render(<CategoryField id="c" categories={READY} value={null} onChange={onChange} selectStyle={{}} />);
    const select = screen.getByLabelText("تصنيف الدورة");
    await userEvent.selectOptions(select, "2");
    expect(onChange).toHaveBeenLastCalledWith(2);
    await userEvent.selectOptions(select, "");
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("keeps a retired current category selectable instead of silently clearing it", () => {
    render(<CategoryField id="c" categories={READY} value={9} onChange={vi.fn()} selectStyle={{}} />);
    expect(screen.getByLabelText("تصنيف الدورة")).toHaveValue("9");
    expect(screen.getByRole("option", { name: "التصنيف الحالي (لم يعد متاحًا)" })).toBeInTheDocument();
  });

  it("says so when there are no categories yet", () => {
    render(<CategoryField id="c" categories={{ status: "ready", categories: [] }} value={null} onChange={vi.fn()} selectStyle={{}} />);
    expect(screen.getByText("لا توجد تصنيفات متاحة بعد.")).toBeInTheDocument();
  });
});
