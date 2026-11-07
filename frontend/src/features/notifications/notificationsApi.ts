import { api } from "../../lib/api";

export interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  body: string;
  is_read: boolean;
  report_id: number | null;
  created_at: string;
}
export interface NotificationPage {
  count: number;
  next: string | null;
  results: NotificationItem[];
  unread_count: number;
}

export const fetchUnreadCount = () =>
  api<{ unread_count: number }>("/api/notifications/unread-count").then((r) => r.unread_count);
export const fetchNotifications = (page: number) =>
  api<NotificationPage>(`/api/notifications?page=${page}`);
export const markRead = (id: number) => api(`/api/notifications/${id}/read`, { method: "POST" });
export const markAllRead = () => api("/api/notifications/read-all", { method: "POST" });

export function badgeText(n: number): string | null {
  if (n <= 0) return null;
  return n > 9 ? "9+" : String(n);
}

export function relativeTime(iso: string, now: number = Date.now()): string {
  const rtf = new Intl.RelativeTimeFormat("id", { numeric: "always" });
  const sec = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(sec);
  if (abs < 60) return rtf.format(sec, "second");
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  return rtf.format(Math.round(sec / 86400), "day");
}
