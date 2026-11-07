import { api, ApiError } from "../../lib/api";
import type { ReportStatus } from "../../lib/status";

export interface MapFilters {
  category: string[];
  status: string[];
  regency: string;
  days: number; // 0 = all
}

export interface MapProps {
  id: number;
  code: string;
  category_slug: string;
  category_name: string;
  status: ReportStatus;
  status_label: string;
  created_at: string;
  master_count: number;
}

export interface MapFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: MapProps;
}

export interface MapCollection {
  type: "FeatureCollection";
  truncated: boolean;
  features: MapFeature[];
}

export const REGENCIES = [
  "Badung", "Bangli", "Buleleng", "Denpasar", "Gianyar",
  "Jembrana", "Karangasem", "Klungkung", "Tabanan",
];

export const EMPTY_FILTERS: MapFilters = { category: [], status: [], regency: "", days: 0 };

export function buildMapQuery(bbox: string, f: MapFilters, now = new Date()): string {
  const q = new URLSearchParams({ bbox });
  if (f.category.length) q.set("category", f.category.join(","));
  if (f.status.length) q.set("status", f.status.join(","));
  if (f.regency) q.set("regency", f.regency);
  if (f.days) {
    const d = new Date(now.getTime() - f.days * 86400000);
    q.set("from", d.toISOString().slice(0, 10));
  }
  return q.toString();
}

export function fetchMap(query: string): Promise<MapCollection> {
  return api<MapCollection>(`/api/reports/map?${query}`);
}

export interface ReportDetail {
  id: number;
  code: string;
  category: { slug: string; name: string };
  status: ReportStatus;
  status_label: string;
  latitude: number;
  longitude: number;
  created_at: string;
  master: { report_count: number } | null;
}

export type SearchResult =
  | { kind: "report"; report: ReportDetail }
  | { kind: "place"; lat: number; lng: number }
  | { kind: "none" };

export async function runSearch(raw: string): Promise<SearchResult> {
  const q = raw.trim();
  if (!q) return { kind: "none" };
  const m = /^SGP-(\d+)$/i.exec(q);
  try {
    if (m) {
      const report = await api<ReportDetail>(`/api/reports/${Number(m[1])}`);
      return { kind: "report", report };
    }
    const res = await api<{ latitude: number; longitude: number }[]>(
      `/api/locations/search?q=${encodeURIComponent(q)}`,
    );
    if (!res.length) return { kind: "none" };
    return { kind: "place", lat: res[0].latitude, lng: res[0].longitude };
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) return { kind: "none" };
    throw e;
  }
}
