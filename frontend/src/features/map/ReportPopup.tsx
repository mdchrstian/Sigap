import { Button } from "../../components/ui";
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
    <div className="flex flex-col items-start gap-2 text-sm">
      <div className="font-mono text-base font-semibold tabular-nums">{d.code}</div>
      <div>{d.category_name}</div>
      <StatusBadge status={d.status} />
      <div className="text-muted">{new Date(d.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</div>
      {d.master_count > 1 && <div>Bergabung dengan {d.master_count} laporan</div>}
      <Button variant="quiet" to={`/laporan/${d.id}`}>Lihat detail</Button>
    </div>
  );
}
