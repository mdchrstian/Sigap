import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../lib/api";
import * as api from "./api";
import { EMPTY_DRAFT, type Category, type Draft } from "./api";
import ReviewStep from "./ReviewStep";
import DuplicateStep, { type DupCache } from "./DuplicateStep";
import LocationStep from "./LocationStep";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  TileLayer: () => null,
  Marker: () => null,
  useMap: () => ({}),
  useMapEvents: () => null,
}));

vi.mock("./api", async (orig) => {
  const real = await orig<typeof import("./api")>();
  return {
    ...real,
    analyzePhoto: vi.fn(),
    checkDuplicates: vi.fn(),
    reverseGeocode: vi.fn(),
  };
});

const cats: Category[] = [{ id: 1, slug: "jalan-rusak", name: "Jalan Rusak" }];
const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
const base: Draft = { ...EMPTY_DRAFT, files: [file], loc: { lat: -8.65, lng: 115.2 }, categoryId: 1, description: "Lubang besar di jalan" };

function Harness({ children, init }: { children: (p: { draft: Draft; patch: (p: Partial<Draft>) => void }) => JSX.Element; init: Draft }) {
  const [draft, setDraft] = useState(init);
  return children({ draft, patch: (p) => setDraft((d) => ({ ...d, ...p })) });
}

beforeEach(() => vi.clearAllMocks());

describe("ReviewStep", () => {
  const view = (init: Draft) =>
    render(
      <Harness init={init}>
        {({ draft, patch }) => (
          <ReviewStep draft={draft} patch={patch} onNext={() => {}} onBack={() => {}} errors={{}} cats={cats} />
        )}
      </Harness>,
    );

  it("shows manual notice on 503 and keeps form usable", async () => {
    vi.mocked(api.analyzePhoto).mockRejectedValue(new ApiError(503));
    view({ ...base, categoryId: "", description: "" });
    expect(screen.getByText("AI sedang menganalisis foto…")).toBeInTheDocument();
    expect(await screen.findByText(/Analisis AI tidak tersedia/)).toBeInTheDocument();
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("");
    fireEvent.change(screen.getByLabelText("Kategori"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Deskripsi"), { target: { value: "Lubang besar di jalan" } });
    expect(screen.getByRole("button", { name: "Lanjut" })).toBeEnabled();
  });

  it("prefills on success with review badge", async () => {
    vi.mocked(api.analyzePhoto).mockResolvedValue({
      is_infrastructure: true, category_slug: "jalan-rusak",
      description: "Jalan berlubang parah", observations: ["Lubang"],
    });
    view({ ...base, categoryId: "", description: "" });
    expect(await screen.findByText(/Perlu ditinjau/)).toBeInTheDocument();
    expect(screen.getByLabelText("Kategori")).toHaveValue("1");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Jalan berlubang parah");
    expect(api.analyzePhoto).toHaveBeenCalledTimes(1);
  });
});

describe("DuplicateStep", () => {
  const view = (onNext = vi.fn()) =>
    render(
      <Harness init={base}>
        {({ draft, patch }) => {
          const [cache, setCache] = [null as DupCache | null, () => {}];
          return (
            <DuplicateStep draft={draft} patch={patch} onNext={onNext} onBack={() => {}}
              errors={{}} cache={cache} setCache={setCache} />
          );
        }}
      </Harness>,
    );

  it("low goes straight on", async () => {
    vi.mocked(api.checkDuplicates).mockResolvedValue({ decision: "low", candidates: [] });
    const onNext = vi.fn();
    view(onNext);
    await waitFor(() => expect(onNext).toHaveBeenCalled());
  });

  it("high preselects candidate", async () => {
    vi.mocked(api.checkDuplicates).mockResolvedValue({
      decision: "high",
      candidates: [{ report_id: 7, code: "SGP-7", category_name: "Jalan Rusak", distance_m: 5,
        status: "submitted", status_label: "Dikirim", thumbnail_url: null, description: "" }],
    });
    view();
    expect((await screen.findAllByText("SGP-7")).length).toBeGreaterThan(0);
    expect(screen.getByText(/Kemungkinan besar sama dengan/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole("radio")[0]).toBeChecked());
    expect(screen.getByLabelText(/Bukan masalah yang sama/)).toBeInTheDocument();
  });
});

describe("LocationStep", () => {
  it("blocks Next when outside Bali", async () => {
    vi.mocked(api.reverseGeocode).mockResolvedValue({ address: "", in_bali: false });
    render(
      <Harness init={{ ...base, inBali: null }}>
        {({ draft, patch }) => (
          <LocationStep draft={draft} patch={patch} onNext={() => {}} onBack={() => {}} errors={{}} />
        )}
      </Harness>,
    );
    expect(await screen.findByText("Lokasi harus berada di Provinsi Bali.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lanjut" })).toBeDisabled();
  });
});
