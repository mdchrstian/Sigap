import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, it, vi } from "vitest";
import ExploreMapPage from "../../pages/ExploreMapPage";

vi.mock("../../lib/api", async (orig) => {
  const m = await orig<typeof import("../../lib/api")>();
  return { ...m, api: vi.fn().mockResolvedValue([]) };
});
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  TileLayer: () => null,
  CircleMarker: () => null,
  Popup: () => null,
  useMap: () => ({
    getCenter: () => ({ lat: -8.4, lng: 115.1 }),
    getBounds: () => ({ getEast: () => 116, getWest: () => 115, getNorth: () => -8, getSouth: () => -9 }),
  }),
  useMapEvents: () => null,
}));

function setup(url: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}><ExploreMapPage /></MemoryRouter>
    </QueryClientProvider>,
  );
}

it("?regency=Badung sets initial regency filter", () => {
  setup("/peta?regency=Badung");
  expect((screen.getAllByLabelText("Kabupaten/Kota")[0] as HTMLSelectElement).value).toBe("Badung");
});

it("unknown regency is ignored", () => {
  setup("/peta?regency=Atlantis");
  expect((screen.getAllByLabelText("Kabupaten/Kota")[0] as HTMLSelectElement).value).toBe("");
});
