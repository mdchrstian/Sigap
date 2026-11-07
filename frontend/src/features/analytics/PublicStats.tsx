import { useQuery } from "@tanstack/react-query";
import { fetchSummary, LIMITED_TEXT, type Summary } from "./analyticsApi";
import RegencySigns from "../landing/RegencySigns";

export function PublicStatsView({ data }: { data: Summary }) {
  const done = data.by_status.find((s) => s.status === "completed")?.count ?? 0;
  return (
    <div className="flex flex-col gap-6">
      {data.limited_data && (
        <p role="status" className="rounded-lg bg-marka-soft p-4 text-sm text-ink">
          {LIMITED_TEXT}
        </p>
      )}
      {data.total === 0 && data.by_regency.length === 0 ? (
        <p className="text-base text-ink">Belum ada laporan.</p>
      ) : (
        <p className="text-base text-ink">
          Sejauh ini{" "}
          <span className="font-mono font-semibold tabular-nums" data-testid="stat-total">{data.total}</span>{" "}
          laporan masuk,{" "}
          <span className="font-mono font-semibold tabular-nums" data-testid="stat-done">{done}</span>{" "}
          sudah selesai.
        </p>
      )}
      {data.by_regency.length > 0 && <RegencySigns items={data.by_regency} />}
    </div>
  );
}

export default function PublicStats() {
  const q = useQuery({ queryKey: ["public-summary"], queryFn: () => fetchSummary() });
  if (q.isLoading) return <p className="text-base text-muted">Memuat statistik...</p>;
  if (q.isError || !q.data) return <p role="alert" className="text-base text-danger">Gagal memuat statistik.</p>;
  return <PublicStatsView data={q.data} />;
}
