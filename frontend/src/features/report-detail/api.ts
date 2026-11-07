import { api } from "../../lib/api";
import type { ReportStatus } from "../../lib/status";

export interface DetailReport {
  id: number;
  code: string;
  category: { id: number; slug: string; name: string };
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
    suggested_category?: { id: number; slug: string; name: string } | string | null;
    suggested_description?: string | null;
    observations?: string[] | string | null;
  };
  history: {
    to_status: ReportStatus;
    status_label: string;
    note: string;
    actor_role_label: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
  is_mine: boolean;
}

export interface CommentItem {
  id: number;
  body: string;
  image_url: string | null;
  author_label: string;
  is_mine: boolean;
  created_at: string;
}

export interface Page<T> {
  results: T[];
  next: string | null;
}

export interface MineItem {
  id: number;
  code: string;
  category: { name: string } | string;
  status: ReportStatus;
  regency: string;
  created_at: string;
  thumbnail_url?: string | null;
  images?: { url: string }[];
}

export const fetchDetail = (id: string) => api<DetailReport>(`/api/reports/${id}`);
export const fetchComments = (id: string, page: number) =>
  api<Page<CommentItem>>(`/api/reports/${id}/comments?page=${page}`);
export const postComment = (id: string, body: string, image: File | null) => {
  const form = new FormData();
  form.append("body", body);
  if (image) form.append("image", image);
  return api<CommentItem>(`/api/reports/${id}/comments`, { method: "POST", form });
};
export const deleteComment = (id: number) => api(`/api/comments/${id}`, { method: "DELETE" });
export const fetchMine = (page: number) => api<Page<MineItem>>(`/api/reports/mine?page=${page}`);

export const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
export const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
