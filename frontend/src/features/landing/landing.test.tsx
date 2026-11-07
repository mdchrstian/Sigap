import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Hero from "./Hero";
import { PublicStatsView } from "../analytics/PublicStats";
import type { Summary } from "../analytics/analyticsApi";

const navigate = vi.fn();
let mockUser: unknown = null;
vi.mock("react-router-dom", async (orig) => ({
  ...(await orig<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));
vi.mock("../auth/AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));

beforeEach(() => {
  navigate.mockReset();
  mockUser = null;
});

const data: Summary = {
  total: 10,
  by_status: [{ status: "completed", label: "Selesai", count: 4 }],
  by_category: [],
  by_regency: [
    { regency: "Badung", count: 2 },
    { regency: "Gianyar", count: 8 },
  ],
  by_week: [], stale_count: 0, period: { from: null, to: null }, limited_data: true,
};

describe("landing", () => {
  it("logged in: file pick navigates to /lapor with photo", () => {
    mockUser = { id: 1 };
    render(<MemoryRouter><Hero /></MemoryRouter>);
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByTestId("photo-input"), { target: { files: [file] } });
    expect(navigate).toHaveBeenCalledWith("/lapor", { state: { photo: file } });
  });

  it("logged out: link to login with next", () => {
    render(<MemoryRouter><Hero /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /Foto kerusakannya/ })).toHaveAttribute("href", "/masuk?next=%2Flapor");
  });

  it("stats: numbers, sorted regency links, limited banner", () => {
    render(<MemoryRouter><PublicStatsView data={data} /></MemoryRouter>);
    expect(screen.getByTestId("stat-total")).toHaveTextContent("10");
    expect(screen.getByTestId("stat-done")).toHaveTextContent("4");
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/peta?regency=Gianyar");
    expect(links[1]).toHaveAttribute("href", "/peta?regency=Badung");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
