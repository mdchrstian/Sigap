import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import OfficerDashboardPage from "../../pages/OfficerDashboardPage";

vi.mock("../auth/AuthContext", () => ({ useAuth: () => ({ user: { role: "officer" } }) }));
vi.mock("./officerApi", () => ({
  fetchOfficerList: async () => ({ count: 0, next: null, previous: null, results: [] }),
  fetchCategories: async () => [],
  fetchSummary: async () => ({
    by_status: [{ status: "submitted", label: "Dikirim", count: 4 }, { status: "verified", label: "x", count: 2 }],
  }),
}));

describe("OfficerDashboardPage tabs", () => {
  it("renders tablist with counts and selected Semua", async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter><OfficerDashboardPage /></MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    const all = await screen.findByRole("tab", { name: /Semua.*6/ });
    expect(all).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Dikirim.*4/ })).toHaveAttribute("aria-selected", "false");
    expect(await screen.findByText("Tidak ada laporan untuk filter ini.")).toBeInTheDocument();
  });
});
