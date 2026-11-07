import { STATUS_MAP, type ReportStatus } from "../lib/status";

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const s = STATUS_MAP[status];
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      <Icon size={16} aria-hidden="true" />
      {s.label}
    </span>
  );
}
