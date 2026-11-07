import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import type { ReportStatus } from "../../lib/status";

export interface PopupData {
  id: number;
  code: string;
  category_name: string;
  status: ReportStatus;
  created_at: string;
  master_count: number;
}

export default function ReportPopup({ d }: { d: PopupData }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="font-bold">{d.code}</div>
      <div>{d.category_name}</div>
      <StatusBadge status={d.status} />
      <div>{new Date(d.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</div>
      {d.master_count > 1 && <div>Bergabung dengan {d.master_count} laporan</div>}
      <Link to={`/laporan/${d.id}`} className="font-semibold text-blue-700 underline">Lihat detail</Link>
    </div>
  );
}
