import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";
import { getTokens, setTokens } from "./tokens";

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("api", () => {
  it("adds bearer header", async () => {
    setTokens({ access: "A", refresh: "R" });
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, { ok: 1 }));
    await api("/api/x");
    expect((f.mock.calls[0][1]!.headers as Record<string, string>).Authorization).toBe("Bearer A");
  });
  it("refreshes on 401 and retries", async () => {
    setTokens({ access: "A", refresh: "R" });
    const f = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(401, {}))
      .mockResolvedValueOnce(json(200, { access: "B" }))
      .mockResolvedValueOnce(json(200, { ok: 1 }));
    expect(await api("/api/x")).toEqual({ ok: 1 });
    expect((f.mock.calls[2][1]!.headers as Record<string, string>).Authorization).toBe("Bearer B");
  });
  it("clears tokens when refresh fails", async () => {
    setTokens({ access: "A", refresh: "R" });
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json(401, {}))
      .mockResolvedValueOnce(json(401, {}));
    await expect(api("/api/x")).rejects.toMatchObject({ status: 401 });
    expect(getTokens()).toBeNull();
  });
  it("getTokens null when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("x");
    });
    expect(getTokens()).toBeNull();
  });
});

describe("api base url", () => {
  it("strips trailing slash from VITE_API_URL", async () => {
    vi.stubEnv("VITE_API_URL", "https://x.onrender.com/");
    vi.resetModules();
    const { api: fresh } = await import("./api");
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(json(200, {}));
    await fresh("/api/health");
    expect(f.mock.calls[0][0]).toBe("https://x.onrender.com/api/health");
    vi.unstubAllEnvs();
  });
});
