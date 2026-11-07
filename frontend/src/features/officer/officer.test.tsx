import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StatusForm from "./StatusForm";
import { ToastProvider, useToast } from "../../components/ui";
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

  it("short note for completed shows a Field error", () => {
    render(<StatusForm current="in_progress" masterCount={1} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Status baru"), { target: { value: "completed" } });
    fireEvent.change(screen.getByLabelText("Catatan"), { target: { value: "abc" } });
    expect(screen.getByText(/minimal 10 karakter/)).toBeInTheDocument();
    expect(screen.getByLabelText("Catatan")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "Simpan" })).toBeDisabled();
  });

  it("dialog confirm then toast 'Status diperbarui (k laporan)'", async () => {
    const onSubmit = vi.fn();
    function Host() {
      const toast = useToast();
      return (
        <StatusForm current="submitted" masterCount={3}
          onSubmit={async (s, n) => { onSubmit(s, n); toast("Status diperbarui (3 laporan)"); }} />
      );
    }
    render(<ToastProvider><Host /></ToastProvider>);
    fireEvent.change(screen.getByLabelText("Status baru"), { target: { value: "under_review" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan" }));
    fireEvent.click(screen.getByRole("button", { name: "Ya, ubah" }));
    expect(await screen.findByText("Status diperbarui (3 laporan)")).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith("under_review", "");
  });
});
