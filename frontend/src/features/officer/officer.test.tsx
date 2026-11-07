import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StatusForm from "./StatusForm";
import { confirmText } from "./officerApi";

describe("StatusForm", () => {
  it("verified offers only in_progress and rejected", () => {
    render(<StatusForm current="verified" masterCount={1} onSubmit={vi.fn()} />);
    const opts = screen.getAllByRole("option").map((o) => (o as HTMLOptionElement).value).filter(Boolean);
    expect(opts).toEqual(["in_progress", "rejected"]);
  });

  it("completed with short note disables submit and shows hint", () => {
    render(<StatusForm current="in_progress" masterCount={1} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Status baru"), { target: { value: "completed" } });
    fireEvent.change(screen.getByLabelText("Catatan"), { target: { value: "12345" } });
    expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
    expect(screen.getByText(/minimal 10 karakter/)).toBeInTheDocument();
  });

  it("confirm text mentions other reports in group", () => {
    render(<StatusForm current="submitted" masterCount={3} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Status baru"), { target: { value: "under_review" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(screen.getByRole("dialog").textContent).toContain("2 laporan lain");
    expect(confirmText(3)).toContain("2 laporan lain");
  });

  it("final status shows Status final", () => {
    render(<StatusForm current="completed" masterCount={1} onSubmit={vi.fn()} />);
    expect(screen.getByText("Status final")).toBeInTheDocument();
  });
});
