import { afterEach, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationBell from "./NotificationBell";
import NotificationList from "./NotificationList";
import { badgeText, relativeTime } from "./notificationsApi";

afterEach(() => vi.unstubAllGlobals());

function wrap(ui: React.ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

it("badge text", () => {
  expect(badgeText(0)).toBeNull();
  expect(badgeText(3)).toBe("3");
  expect(badgeText(12)).toBe("9+");
});

it("bell shows badge from API", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ unread_count: 12 }))));
  render(wrap(<NotificationBell />));
  expect(await screen.findByText("9+")).toBeTruthy();
});

it("bell aria-label has unread count", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ unread_count: 3 }))));
  render(wrap(<NotificationBell />));
  expect(await screen.findByLabelText("Notifikasi, 3 belum dibaca")).toBeTruthy();
});

it("bell hides badge at 0", async () => {
  const f = vi.fn().mockResolvedValue(new Response(JSON.stringify({ unread_count: 0 })));
  vi.stubGlobal("fetch", f);
  render(wrap(<NotificationBell />));
  await waitFor(() => expect(f).toHaveBeenCalled());
  expect(screen.queryByTestId("unread-badge")).toBeNull();
});

it("click posts read then navigates", async () => {
  const f = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", f);
  const items = [{ id: 7, kind: "x", title: "T", body: "B", is_read: false, report_id: 42, created_at: new Date().toISOString() }];
  render(
    <MemoryRouter initialEntries={["/notifikasi"]}>
      <Routes>
        <Route path="/notifikasi" element={<NotificationList items={items} onChanged={() => {}} />} />
        <Route path="/laporan/:id" element={<div>detail</div>} />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByText("T"));
  expect(await screen.findByText("detail")).toBeTruthy();
  expect(f.mock.calls[0][0]).toBe("/api/notifications/7/read");
  expect(f.mock.calls[0][1].method).toBe("POST");
});

it("relative time id", () => {
  const now = Date.now();
  expect(relativeTime(new Date(now - 5 * 60000).toISOString(), now)).toMatch(/5 menit (yang )?lalu/);
});
