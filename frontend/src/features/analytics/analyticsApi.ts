import { api } from "../../lib/api";
import type { ReportStatus } from "../../lib/status";

export interface Summary {
  total: number;
  by_status: { status: ReportStatus; label: string; count: number }[];
  by_category: { slug: string; name: string; count: number }[];
  by_regency: { regency: string; count: number }[];
  by_week: { week_start: string; count: number }[];
  stale_count: number;
  period: { from: string | null; to: string | null };
  limited_data: boolean;
}

export interface Range { from?: string; to?: string; regency?: string }

export interface Insights {
  summary: string;
  highlights: string[];
  generated_at: string;
  verified: boolean;
  based_on: unknown;
}

export interface StaleItem {
  id: number;
  code: string;
  category: { id: number; slug: string; name: string } | null;
  status: ReportStatus;
  status_label: string;
  regency: string;
  days_since_update: number;
}

export const LIMITED_TEXT = "Data masih terbatas, statistik belum representatif.";
export const UNAVAILABLE_TEXT = "Ringkasan AI tidak tersedia saat ini.";

export function rangeQuery(r: Range): string {
  const p = new URLSearchParams();
  if (r.from) p.set("from", r.from);
  if (r.to) p.set("to", r.to);
  if (r.regency) p.set("regency", r.regency);
  return p.toString();
}

export const fetchSummary = (r: Range = {}) => {
  const q = rangeQuery(r);
  return api<Summary>(`/api/analytics/summary${q ? `?${q}` : ""}`);
};

export const fetchStale = () => api<{ results: StaleItem[] }>("/api/analytics/stale");

export const postInsights = (r: Range) =>
  api<Insights>("/api/analytics/insights", {
    method: "POST",
    body: { from: r.from ?? null, to: r.to ?? null, regency: r.regency ?? "" },
  });

export function periodRange(days: number | null, now = new Date()): Range {
  if (!days) return {};
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const from = new Date(now.getTime() - days * 86400000);
  return { from: iso(from), to: iso(now) };
}
