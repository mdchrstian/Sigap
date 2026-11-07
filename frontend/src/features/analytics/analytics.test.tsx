import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicStatsView } from "./PublicStats";
import InsightsCard from "./InsightsCard";
import type { Summary } from "./analyticsApi";

const summary: Summary = {
  total: 0, by_status: [], by_category: [], by_regency: [],
  by_week: [], stale_count: 0, period: { from: null, to: null }, limited_data: true,
};

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: status < 400, status, text: async () => JSON.stringify(body),
  }));
}
afterEach(() => vi.unstubAllGlobals());

describe("analytics", () => {
  it("shows limited data warning and empty state", () => {
    render(<PublicStatsView data={summary} />);
    expect(screen.getByText("Data masih terbatas, statistik belum representatif.")).toBeInTheDocument();
    expect(screen.getByText("Belum ada laporan.")).toBeInTheDocument();
  });

  it("unverified insights use warning style", async () => {
    mockFetch(200, { summary: "Ringkas", highlights: ["a"], generated_at: "2026-01-01T00:00:00Z", verified: false, based_on: {} });
    render(<InsightsCard range={{}} />);
    fireEvent.click(screen.getByRole("button", { name: "Buat Ringkasan" }));
    const box = await screen.findByTestId("insights-result");
    expect(box.getAttribute("data-verified")).toBe("false");
    expect(box.className).toContain("amber");
    expect(screen.getByText(/Periksa kembali sebelum digunakan/)).toBeInTheDocument();
  });

  it("503 shows unavailable message", async () => {
    mockFetch(503, { detail: "x" });
    render(<InsightsCard range={{}} />);
    fireEvent.click(screen.getByRole("button", { name: "Buat Ringkasan" }));
    await waitFor(() => expect(screen.getByText("Ringkasan AI tidak tersedia saat ini.")).toBeInTheDocument());
  });
});
