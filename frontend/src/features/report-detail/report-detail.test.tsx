import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import ReportDetailPage from "../../pages/ReportDetailPage";
import { AuthProvider } from "../auth/AuthContext";
import { ApiError, api } from "../../lib/api";

vi.mock("../../lib/api", async (orig) => {
  const m = await orig<typeof import("../../lib/api")>();
  return { ...m, api: vi.fn() };
});
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  TileLayer: () => null,
  CircleMarker: () => <i data-testid="marker" />,
}));

const base = {
  id: 1, code: "SGP-000001", category: { id: 1, slug: "x", name: "Jalan" }, description: "d",
  latitude: -8.5, longitude: 115.2, address: "Jl", regency: "Badung", status: "submitted",
  status_label: "Dikirim", images: [], master: { id: 1, report_count: 3 }, ai: { used: false },
  history: [1, 2, 3].map((n) => ({ to_status: "submitted", status_label: `S${n}`, note: "",
    actor_role_label: "Sistem", created_at: "2026-11-01T00:00:00Z" })),
  created_at: "2026-11-01T00:00:00Z", updated_at: "2026-11-01T00:00:00Z", is_mine: false,
};

function setup() {
  return render(
    <MemoryRouter initialEntries={["/laporan/1"]}>
      <AuthProvider>
        <Routes><Route path="/laporan/:id" element={<ReportDetailPage />} /></Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(api).mockReset();
});

it("timeline, master group, logged-out comments", async () => {
  vi.mocked(api).mockImplementation((async (p: string) => {
    if (p.includes("/comments")) return { results: [], next: null };
    return base;
  }) as never);
  setup();
  await waitFor(() => expect(screen.getAllByTestId("history-item")).toHaveLength(3));
  const t = screen.getAllByTestId("history-item").map((e) => e.textContent);
  expect(t[0]).toContain("S1");
  expect(t[2]).toContain("S3");
  expect(screen.getByText(/tergabung dengan 2 laporan lain/)).toBeInTheDocument();
  expect(screen.queryByLabelText("Komentar")).toBeNull();
  expect(screen.getByText("Masuk untuk menambahkan informasi")).toBeInTheDocument();
});

it("404 shows not found", async () => {
  vi.mocked(api).mockRejectedValue(new ApiError(404));
  setup();
  expect(await screen.findByText("Laporan tidak ditemukan")).toBeInTheDocument();
});

it("renders ai.suggested_category given as an object without crashing", async () => {
  vi.mocked(api).mockImplementation((async (p: string) => {
    if (p.includes("/comments")) return { results: [], next: null };
    return { ...base, ai: { used: true, suggested_category: { id: 2, slug: "y", name: "Drainase" }, suggested_description: "x", observations: ["a"] } };
  }) as never);
  setup();
  await waitFor(() => expect(screen.getByText("Kategori: Drainase")).toBeTruthy());
});
