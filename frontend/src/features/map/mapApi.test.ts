import { afterEach, expect, it, vi } from "vitest";
import { buildMapQuery, EMPTY_FILTERS, runSearch } from "./mapApi";

afterEach(() => vi.unstubAllGlobals());

it("search SGP code calls /api/reports/1", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ id: 1, code: "SGP-000001" }), { status: 200 }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const r = await runSearch("sgp-000001");
  expect(fetchMock.mock.calls[0][0]).toBe("/api/reports/1");
  expect(r.kind).toBe("report");
});

it("place search uses first result", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ label: "x", latitude: -8.5, longitude: 115.2 }]), { status: 200 }),
    ),
  );
  expect(await runSearch("Ubud")).toEqual({ kind: "place", lat: -8.5, lng: 115.2 });
});

it("404 gives none", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
  expect((await runSearch("SGP-999")).kind).toBe("none");
});

it("builds query", () => {
  const q = buildMapQuery("1,2,3,4", { ...EMPTY_FILTERS, status: ["completed"], days: 7 },
    new Date("2026-11-10T00:00:00Z"));
  expect(q).toContain("status=completed");
  expect(q).toContain("from=2026-11-03");
});
