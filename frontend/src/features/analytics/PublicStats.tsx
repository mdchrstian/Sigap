import { useQuery } from "@tanstack/react-query";
import { CategoryBar } from "./Charts";
import { fetchSummary, LIMITED_TEXT, type Summary } from "./analyticsApi";

export function PublicStatsView({ data }: { data: Summary }) {
  const done = data.by_status.find((s) => s.status === "completed")?.count ?? 0;
  return (
    <div className="space-y-3">
      {data.limited_data && (
        <p role="status" className="rounded border border-amber-400 bg-amber-50 p-2 text-sm text-amber-900">
          {LIMITED_TEXT}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border bg-white p-3">
          <div className="text-2xl font-bold" data-testid="stat-total">{data.total}</div>
          <div className="text-sm text-slate-600">Total laporan</div>
        </div>
        <div className="rounded border bg-white p-3">
          <div className="text-2xl font-bold" data-testid="stat-done">{done}</div>
          <div className="text-sm text-slate-600">Laporan selesai</div>
        </div>
      </div>
      <CategoryBar data={data.by_category} />
    </div>
  );
}

export default function PublicStats() {
  const q = useQuery({ queryKey: ["public-summary"], queryFn: () => fetchSummary() });
  if (q.isLoading) return <p>Memuat statistik...</p>;
  if (q.isError || !q.data) return <p role="alert" className="text-red-600">Gagal memuat statistik.</p>;
  return <PublicStatsView data={q.data} />;
}
