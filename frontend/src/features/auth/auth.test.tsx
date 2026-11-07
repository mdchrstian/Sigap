import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./AuthContext";
import RequireAuth from "./RequireAuth";
import RequireRole from "./RequireRole";
import LoginPage from "../../pages/LoginPage";
import { ApiError, api } from "../../lib/api";
import { setTokens } from "../../lib/tokens";

vi.mock("../../lib/api", async (orig) => {
  const m = await orig<typeof import("../../lib/api")>();
  return { ...m, api: vi.fn() };
});

function Loc() {
  const l = useLocation();
  return <div data-testid="loc">{l.pathname + l.search}</div>;
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(api).mockReset();
});

describe("auth", () => {
  it("RequireAuth redirects to login", () => {
    render(
      <MemoryRouter initialEntries={["/laporan-saya"]}>
        <AuthProvider>
          <Routes>
            <Route path="/laporan-saya" element={<RequireAuth><p>secret</p></RequireAuth>} />
            <Route path="/masuk" element={<Loc />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("loc").textContent).toBe("/masuk?next=%2Flaporan-saya");
  });

  it("RequireRole denies public user", async () => {
    setTokens({ access: "a", refresh: "r" });
    vi.mocked(api).mockResolvedValue({ id: 1, email: "a@b.c", full_name: "A", role: "public" });
    render(
      <MemoryRouter>
        <AuthProvider>
          <RequireAuth>
            <RequireRole roles={["officer"]}><p>x</p></RequireRole>
          </RequireAuth>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Akses ditolak")).toBeInTheDocument();
  });

  it("invalid stored tokens treated as logged out", async () => {
    setTokens({ access: "a", refresh: "r" });
    vi.mocked(api).mockRejectedValue(new ApiError(401, { detail: "x" }));
    render(
      <MemoryRouter initialEntries={["/p"]}>
        <AuthProvider>
          <Routes>
            <Route path="/p" element={<RequireAuth><p>secret</p></RequireAuth>} />
            <Route path="/masuk" element={<Loc />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId("loc")).toBeInTheDocument());
  });

  it("LoginPage shows 401 detail", async () => {
    vi.mocked(api).mockRejectedValue(new ApiError(401, { detail: "Email atau kata sandi salah" }));
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.c" } });
    fireEvent.change(screen.getByLabelText("Kata sandi"), { target: { value: "pw" } });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByText("Email atau kata sandi salah")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Email atau kata sandi salah");
  });

  it("password toggle switches input type and has aria-label", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );
    const pw = screen.getByLabelText("Kata sandi");
    expect(pw).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));
    expect(pw).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Sembunyikan kata sandi" }));
    expect(pw).toHaveAttribute("type", "password");
  });
});
