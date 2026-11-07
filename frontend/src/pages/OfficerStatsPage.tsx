import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { REGENCIES } from "../features/map/mapApi";
import { CategoryBar, WeekLine } from "../features/analytics/Charts";
import InsightsCard from "../features/analytics/InsightsCard";
import {
  fetchStale, fetchSummary, LIMITED_TEXT, periodRange,
} from "../features/analytics/analyticsApi";

const PERIODS = [
  { label: "30 hari", days: 30 },
  { label: "90 hari", days: 90 },
  { label: "Semua", days: 0 },
];

export default function OfficerStatsPage() {
  const [days, setDays] = useState(0);
  const [regency, setRegency] = useState("");
  const range = { ...periodRange(days || null), regency: regency || undefined };

  const summary = useQuery({
    queryKey: ["stats-summary", days, regency],
    queryFn: () => fetchSummary(range),
  });
  const stale = useQuery({ queryKey: ["stats-stale"], queryFn: fetchStale });
  const d = summary.data;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Statistik</h1>

      <div className="grid gap-2 sm:grid-cols-2">
        <select aria-label="Periode" className="rounded border p-2" value={days}
          onChange={(e) => setDays(Number(e.target.value))}>
          {PERIODS.map((p) => <option key={p.days} value={p.days}>{p.label}</option>)}
        </select>
        <select aria-label="Kabupaten/Kota" className="rounded border p-2" value={regency}
          onChange={(e) => setRegency(e.target.value)}>
          <option value="">Semua kabupaten/kota</option>
          {REGENCIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {summary.isLoading && <p>Memuat...</p>}
      {summary.isError && <p role="alert" className="text-red-600">Gagal memuat statistik.</p>}

      {d && (
        <>
          {d.limited_data && (
            <p role="status" className="rounded border border-amber-400 bg-amber-50 p-2 text-sm text-amber-900">{LIMITED_TEXT}</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded border bg-white p-3">
              <div className="text-2xl font-bold">{d.total}</div>
              <div className="text-sm text-slate-600">Total</div>
            </div>
            {d.by_status.map((s) => (
              <div key={s.status} className="rounded border bg-white p-3">
                <div className="text-2xl font-bold">{s.count}</div>
                <div className="text-sm text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CategoryBar data={d.by_category} />
            <WeekLine data={d.by_week} />
          </div>

          <section className="rounded border bg-white p-3">
            <h2 className="mb-2 font-semibold">Laporan per kabupaten/kota</h2>
            {d.by_regency.length === 0 ? (
              <p className="text-sm text-slate-600">Belum ada data untuk ditampilkan.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b"><th className="p-2">Kabupaten/Kota</th><th className="p-2">Jumlah</th></tr></thead>
                <tbody>
                  {d.by_regency.map((r) => (
                    <tr key={r.regency} className="border-b"><td className="p-2">{r.regency}</td><td className="p-2">{r.count}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      <section className="rounded border bg-white p-3">
        <h2 className="mb-2 font-semibold">Laporan tertunda{d ? ` (${d.stale_count})` : ""}</h2>
        {stale.isError && <p role="alert" className="text-red-600">Gagal memuat laporan tertunda.</p>}
        {stale.data && stale.data.results.length === 0 && <p className="text-sm text-slate-600">Tidak ada laporan tertunda.</p>}
        {stale.data && stale.data.results.length > 0 && (
          <ul className="divide-y text-sm">
            {stale.data.results.map((r) => (
              <li key={r.id} className="py-2">
                <Link className="font-semibold text-[#2D6CDF] underline" to={`/petugas/laporan/${r.id}`}>{r.code}</Link>
                <span className="ml-2">{r.category?.name} · {r.status_label} · {r.days_since_update} hari tanpa pembaruan</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InsightsCard range={range} />
    </div>
  );
}
