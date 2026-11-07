import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import MyReportsPage from "../../pages/MyReportsPage";
import { api } from "../../lib/api";

vi.mock("../../lib/api", async (orig) => {
  const m = await orig<typeof import("../../lib/api")>();
  return { ...m, api: vi.fn() };
});

it("empty state with create button", async () => {
  vi.mocked(api).mockResolvedValue({ results: [], next: null } as never);
  render(<MemoryRouter><MyReportsPage /></MemoryRouter>);
  expect(await screen.findByText("Anda belum membuat laporan.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Buat Laporan" })).toHaveAttribute("href", "/lapor");
});
