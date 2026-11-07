import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Map as LMap } from "leaflet";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { STATUS_MAP } from "../lib/status";
import FilterPanel, { type Cat } from "../features/map/FilterPanel";
import ReportPopup, { type PopupData } from "../features/map/ReportPopup";
import {
  buildMapQuery, EMPTY_FILTERS, fetchMap, runSearch, type MapFilters,
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
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);
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

  const panel = (
    <FilterPanel filters={filters} onChange={setFilters} categories={cats.data ?? []} />
  );

  return (
    <div className="relative flex h-[calc(100vh-4rem)] min-h-[400px] w-full">
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r bg-white p-4 md:block">
        {panel}
      </aside>
      <div className="relative flex-1">
        <form onSubmit={onSearch} className="absolute left-12 right-2 top-2 z-[1000] flex gap-2 md:right-auto md:w-96">
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari"
            placeholder="Cari tempat atau kode SGP-000123"
            className="flex-1 rounded border bg-white px-3 py-2 text-sm shadow" />
          <button className="rounded bg-blue-700 px-3 py-2 text-sm text-white shadow">Cari</button>
        </form>
        {(msg || data.data?.truncated) && (
          <div className="absolute left-2 right-2 top-14 z-[1000] rounded bg-yellow-100 px-3 py-1 text-sm shadow md:left-12 md:right-auto">
            {msg || "Perbesar peta untuk melihat semua laporan."}
          </div>
        )}
        <button onClick={() => setDrawer(true)}
          className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-blue-700 px-4 py-2 text-sm text-white shadow md:hidden">
          Filter
        </button>
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
                pathOptions={{ color: "#fff", weight: 1.5, fillColor: color, fillOpacity: 0.9 }}>
                <Popup><ReportPopup d={p} /></Popup>
              </CircleMarker>
            );
          })}
          {found && (
            <CircleMarker key={`f${found.id}`} center={found.pos} radius={10}
              pathOptions={{ color: "#fff", fillColor: STATUS_MAP[found.status].color, fillOpacity: 1 }}
              ref={(m) => { if (m) window.setTimeout(() => m.openPopup(), 0); }}>
              <Popup><ReportPopup d={found} /></Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-[2000] md:hidden" role="dialog" aria-label="Filter">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] overflow-y-auto rounded-t-xl bg-white p-4">
            <div className="mb-2 flex justify-between">
              <b>Filter</b>
              <button onClick={() => setDrawer(false)} aria-label="Tutup">Tutup</button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </div>
  );
}
