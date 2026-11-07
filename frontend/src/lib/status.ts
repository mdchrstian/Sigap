export type ReportStatus =
  | "submitted"
  | "under_review"
  | "verified"
  | "in_progress"
  | "completed"
  | "rejected";

export const STATUS_MAP: Record<ReportStatus, { label: string; color: string }> = {
  submitted: { label: "Dikirim", color: "#64748b" },
  under_review: { label: "Ditinjau", color: "#d97706" },
  verified: { label: "Terverifikasi", color: "#2D6CDF" },
  in_progress: { label: "Dalam Pengerjaan", color: "#ea580c" },
  completed: { label: "Selesai", color: "#176B5B" },
  rejected: { label: "Ditolak", color: "#dc2626" },
};
