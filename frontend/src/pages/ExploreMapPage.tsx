import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Map as LMap } from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import { Button, Dialog, EmptyState, Input } from "../components/ui";
import { api } from "../lib/api";
import { STATUS_MAP } from "../lib/status";
import FilterPanel, { type Cat } from "../features/map/FilterPanel";
import ReportPopup, { type PopupData } from "../features/map/ReportPopup";
import {
  buildMapQuery, EMPTY_FILTERS, fetchMap, REGENCIES, runSearch, type MapFilters,
} from "../features/map/mapApi";

const TILE = (import.meta.env.VITE_TILE_URL as string | undefined)
  ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAX_SPAN = 1.9;

function bboxOf(map: LMap): string {
  const c = map.getCenter();
  const b = map.getBounds();
  const hw = Math.min((b.getEast() - b.getWest()) / 2, MAX_SPAN / 2);
  const hh = Math.min((b.getNorth() - b.getSouth()) / 2, MAX_SPAN / 2);
  return [c.lng - hw, c.lat - hh, c.lng + hw, c.lat + hh].map((n) => n.toFixed(4)).join(",");
}

function BboxTracker({ onBbox }: { onBbox: (b: string) => void }) {
  const map = useMap();
  const timer = useRef<number>();
  useEffect(() => {
    onBbox(bboxOf(map));
    return () => window.clearTimeout(timer.current);
  }, [map, onBbox]);
  useMapEvents({
    moveend() {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => onBbox(bboxOf(map)), 400);
    },
  });
  return null;
}

export default function ExploreMapPage() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState<MapFilters>(() => {
    const r = params.get("regency") ?? "";
    return { ...EMPTY_FILTERS, regency: REGENCIES.includes(r) ? r : "" };
  });
  const [bbox, setBbox] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [found, setFound] = useState<(PopupData & { pos: [number, number] }) | null>(null);
  const mapRef = useRef<LMap | null>(null);

  const cats = useQuery({ queryKey: ["categories"], queryFn: () => api<Cat[]>("/api/categories") });
  const query = bbox ? buildMapQuery(bbox, filters) : "";
  const data = useQuery({
    queryKey: ["map", bbox, filters],
    queryFn: () => fetchMap(query),
    enabled: !!bbox,
    placeholderData: (prev) => prev,
  });

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setFound(null);
    try {
      const r = await runSearch(q);
      if (r.kind === "none") return setMsg("Tidak ditemukan.");
      if (r.kind === "place") return void mapRef.current?.flyTo([r.lat, r.lng], 14);
      const p = r.report;
      mapRef.current?.flyTo([p.latitude, p.longitude], 16);
      setFound({
        id: p.id, code: p.code, category_name: p.category.name, status: p.status,
        created_at: p.created_at, master_count: p.master?.report_count ?? 1,
        pos: [p.latitude, p.longitude],
      });
    } catch {
      setMsg("Pencarian gagal. Coba lagi.");
    }
  }

  const hasFilters = !!(filters.category.length || filters.status.length || filters.regency || filters.days);
  const empty = !!data.data && data.data.features.length === 0 && hasFilters;

  const renderPanel = (idp: string) => (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSearch} className="flex flex-col gap-2">
        <label htmlFor={`${idp}-search`} className="text-sm font-semibold">Cari</label>
        <Input id={`${idp}-search`} value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Tempat atau kode SGP-000123" />
        <Button type="submit" variant="secondary" icon={Search}>Cari</Button>
        {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
      </form>
      <FilterPanel filters={filters} onChange={setFilters} categories={cats.data ?? []} idp={idp} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row">
      <aside className="hidden w-80 shrink-0 overflow-y-auto rounded-xl border border-line bg-surface p-6 md:block md:h-[calc(100dvh-12rem)]">
        {renderPanel("side")}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Button variant="secondary" icon={SlidersHorizontal} className="md:hidden" onClick={() => setDrawer(true)}>
          Filter
        </Button>
        {data.data?.truncated && (
          <p className="rounded-lg bg-marka-soft px-3 py-2 text-sm text-ink">
            Perbesar peta untuk melihat semua laporan.
          </p>
        )}
        <div className="relative h-[calc(100dvh-14rem)] min-h-96 overflow-hidden rounded-xl border border-line md:h-[calc(100dvh-12rem)]">
          <MapContainer center={[-8.4095, 115.1889]} zoom={10} preferCanvas
            ref={mapRef} className="h-full w-full">
            <TileLayer url={TILE} attribution="&copy; OpenStreetMap contributors" />
            <BboxTracker onBbox={setBbox} />
            {data.data?.features.map((f) => {
              const p = f.properties;
              const [lng, lat] = f.geometry.coordinates;
              const color = STATUS_MAP[p.status].color;
              return (
                <CircleMarker key={p.id} center={[lat, lng]} radius={8}
                  pathOptions={{ color: "#fff", weight: 2, fillColor: color, fillOpacity: 1 }}>
                  <Popup><ReportPopup d={p} /></Popup>
                </CircleMarker>
              );
            })}
            {found && (
              <CircleMarker key={`f${found.id}`} center={found.pos} radius={10}
                pathOptions={{ color: "#fff", weight: 2, fillColor: STATUS_MAP[found.status].color, fillOpacity: 1 }}
                ref={(m) => { if (m) window.setTimeout(() => m.openPopup(), 0); }}>
                <Popup><ReportPopup d={found} /></Popup>
              </CircleMarker>
            )}
          </MapContainer>
          {empty && (
            <div className="absolute inset-x-4 top-4 z-[1000] mx-auto max-w-sm">
              <EmptyState icon={SearchX} title="Tidak ada laporan untuk filter ini."
                action={<Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>Hapus filter</Button>} />
            </div>
          )}
        </div>
      </div>
      <Dialog open={drawer} onClose={() => setDrawer(false)} title="Filter">
        {drawer && renderPanel("dlg")}
      </Dialog>
    </div>
  );
}
