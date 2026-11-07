import { BadgeCheck, CircleCheck, CircleX, Construction, Inbox, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ReportStatus =
  | "submitted"
  | "under_review"
  | "verified"
  | "in_progress"
  | "completed"
  | "rejected";

export interface StatusInfo {
  label: string;
  /** solid colour for charts */
  color: string;
  bg: string;
  fg: string;
  icon: LucideIcon;
}

export const STATUS_MAP: Record<ReportStatus, StatusInfo> = {
  submitted: { label: "Dikirim", color: "#6B7780", bg: "#E6E8EA", fg: "#2E3A40", icon: Inbox },
  under_review: { label: "Ditinjau", color: "#1F4FA3", bg: "#DCE6F7", fg: "#173D80", icon: Search },
  verified: { label: "Terverifikasi", color: "#2F8F72", bg: "#D9EFE6", fg: "#08513B", icon: BadgeCheck },
  in_progress: { label: "Dalam Pengerjaan", color: "#C99A00", bg: "#FFF1B8", fg: "#5A4500", icon: Construction },
  completed: { label: "Selesai", color: "#08513B", bg: "#0A6B4E", fg: "#FFFFFF", icon: CircleCheck },
  rejected: { label: "Ditolak", color: "#B42318", bg: "#FBE0DD", fg: "#8A1C12", icon: CircleX },
};
