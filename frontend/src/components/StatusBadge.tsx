import { STATUS_MAP, type ReportStatus } from "../lib/status";

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: s.color }}
    >
      {s.label}
    </span>
  );
}
