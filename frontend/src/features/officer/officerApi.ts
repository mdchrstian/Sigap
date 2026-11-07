import { api } from "../../lib/api";
import type { ReportStatus } from "../../lib/status";

export const NEXT_STATUSES: Record<ReportStatus, ReportStatus[]> = {
  submitted: ["under_review", "rejected"],
  under_review: ["verified", "rejected"],
  verified: ["in_progress", "rejected"],
  in_progress: ["completed", "rejected"],
  completed: [],
  rejected: [],
};

export const NOTE_REQUIRED: ReportStatus[] = ["completed", "rejected"];
export const MIN_NOTE = 10;

export interface OfficerItem {
  id: number;
  code: string;
  category: { id: number; slug: string; name: string } | null;
  description: string;
  status: ReportStatus;
  status_label: string;
  regency: string;
  thumbnail_url: string | null;
  master_id: number | null;
  master_count: number;
  reporter_name: string;
  created_at: string;
  updated_at: string;
  is_hidden: boolean;
}

export interface OfficerPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: OfficerItem[];
}

export interface OfficerFilters {
  status: string;
  category: string;
  regency: string;
  q: string;
  page: number;
}

export function buildListQuery(f: OfficerFilters): string {
  const p = new URLSearchParams();
  if (f.status) p.set("status", f.status);
  if (f.category) p.set("category", f.category);
  if (f.regency) p.set("regency", f.regency);
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.page > 1) p.set("page", String(f.page));
  return p.toString();
}

export const fetchOfficerList = (f: OfficerFilters) =>
  api<OfficerPage>(`/api/officer/reports?${buildListQuery(f)}`);

export interface StatusCount { status: ReportStatus; label: string; count: number }
export const fetchSummary = () =>
  api<{ by_status: StatusCount[] }>("/api/analytics/summary");

export interface Cat { id: number; slug: string; name: string }
export const fetchCategories = () => api<Cat[]>("/api/reports/categories");

export interface HistoryItem {
  to_status: ReportStatus;
  status_label: string;
  note: string;
  actor_role_label: string;
  actor_name?: string | null;
  created_at: string;
}

export interface OfficerDetail {
  id: number;
  code: string;
  category: Cat | null;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  regency: string;
  status: ReportStatus;
  status_label: string;
  images: { id: number; url: string }[];
  master: { id: number; report_count: number } | null;
  ai: {
    used: boolean;
    suggested_category: Cat | null;
    suggested_description: string;
    observations: string;
  };
  created_at: string;
  updated_at: string;
  reporter?: { id: number; full_name: string; email: string };
  history: HistoryItem[];
}

export const fetchDetail = (id: string | number) => api<OfficerDetail>(`/api/reports/${id}`);

export const postStatus = (id: number, status: string, note: string) =>
  api<{ updated: number[]; report: OfficerDetail }>(`/api/officer/reports/${id}/status`, {
    method: "POST",
    body: { status, note },
  });

export function confirmText(masterCount: number): string {
  const base = "Ubah status laporan ini?";
  return masterCount > 1
    ? `${base} Perubahan ini juga berlaku untuk ${masterCount - 1} laporan lain dalam grup.`
    : base;
}
