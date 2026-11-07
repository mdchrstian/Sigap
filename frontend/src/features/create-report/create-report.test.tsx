import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../lib/api";
import * as api from "./api";
import { EMPTY_DRAFT, type Category, type Draft } from "./api";
import ReviewStep from "./ReviewStep";
import DuplicateStep, { type DupCache } from "./DuplicateStep";
import LocationStep from "./LocationStep";
import PhotoStep from "./PhotoStep";
import { Stepper } from "./StepNav";
import { MemoryRouter } from "react-router-dom";

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
    expect(screen.getByText("AI sedang membaca foto...")).toBeInTheDocument();
    expect(await screen.findByText(/AI sedang tidak tersedia\. Silakan isi kategori dan deskripsi sendiri/)).toBeInTheDocument();
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
    expect(await screen.findByText(/Draf AI/)).toBeInTheDocument();
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
    expect(screen.getByLabelText(/Tetap kirim laporan baru/)).toBeInTheDocument();
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

describe("StepNav", () => {
  it("marks the current step", () => {
    render(<Stepper current={1} />);
    const cur = screen.getByText("Lokasi").closest("li");
    expect(cur).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Foto").closest("li")).not.toHaveAttribute("aria-current");
  });
});

describe("PhotoStep state.photo contract", () => {
  const mount = (state: unknown) =>
    render(
      <MemoryRouter initialEntries={[{ pathname: "/lapor", state }]}>
        <Harness init={EMPTY_DRAFT}>
          {({ draft, patch }) => (
            <PhotoStep draft={draft} patch={patch} onNext={() => {}} onBack={() => {}} errors={{}} />
          )}
        </Harness>
      </MemoryRouter>,
    );

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:x");
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal("createImageBitmap", async () => ({ width: 10, height: 10, close() {} }));
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage() {} })) as never;
    HTMLCanvasElement.prototype.toBlob = function (cb: BlobCallback) { cb(new Blob(["x"], { type: "image/jpeg" })); };
  });

  it("preselects a File from router state without advancing", async () => {
    const onNext = vi.fn();
    render(
      <MemoryRouter initialEntries={[{ pathname: "/lapor", state: { photo: file } }]}>
        <Harness init={EMPTY_DRAFT}>
          {({ draft, patch }) => (
            <PhotoStep draft={draft} patch={patch} onNext={onNext} onBack={() => {}} errors={{}} />
          )}
        </Harness>
      </MemoryRouter>,
    );
    expect(await screen.findByAltText("Foto 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ganti foto" })).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("ignores a non-File photo", async () => {
    mount({ photo: "nope" });
    expect(screen.getByText("Ambil atau pilih foto kerusakan")).toBeInTheDocument();
    expect(screen.queryByAltText("Foto 1")).not.toBeInTheDocument();
  });
});
