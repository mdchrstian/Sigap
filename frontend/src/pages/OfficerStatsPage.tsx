import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button, Panel, Select, SignPlate, Field } from "../components/ui";
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
    <div className="flex flex-col gap-8">
      <Link to="/petugas" className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
        <ArrowLeft size={20} aria-hidden="true" />Kembali ke dasbor
      </Link>
      <SignPlate tone="info">Statistik</SignPlate>

      <div className="flex flex-wrap items-end gap-6">
        <div role="group" aria-label="Periode" className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Button key={p.days} variant={days === p.days ? "primary" : "secondary"}
              aria-pressed={days === p.days} onClick={() => setDays(p.days)}>
              {p.label}
            </Button>
          ))}
        </div>
        <div className="min-w-64">
          <Field label="Kabupaten/Kota" htmlFor="stats-regency">
            <Select value={regency} onChange={(e) => setRegency(e.target.value)}>
              <option value="">Semua kabupaten/kota</option>
              {REGENCIES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </Field>
        </div>
      </div>

      {summary.isLoading && <p>Memuat...</p>}
      {summary.isError && <p role="alert" className="font-semibold text-danger">Gagal memuat statistik.</p>}

      {d && (
        <>
          {d.limited_data && (
            <p role="status" className="rounded-lg bg-marka-soft p-4 text-sm font-semibold text-ink">{LIMITED_TEXT}</p>
          )}

          <Panel as="section" className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Laporan per status</h2>
            <table className="w-full text-left text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line-strong">
                  <th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-12 border-b border-line">
                  <td className="px-3 font-semibold">Total</td>
                  <td className="px-3 text-right font-mono font-semibold">{d.total}</td>
                </tr>
                {d.by_status.map((s) => (
                  <tr key={s.status} className="h-12 border-b border-line hover:bg-ground">
                    <td className="px-3">{s.label}</td>
                    <td className="px-3 text-right font-mono">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBar data={d.by_category} />
            <WeekLine data={d.by_week} />
          </div>

          <Panel as="section" className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Laporan per kabupaten/kota</h2>
            {d.by_regency.length === 0 ? (
              <p className="text-sm text-muted">Belum ada data untuk ditampilkan.</p>
            ) : (
              <table className="w-full text-left text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-line-strong">
                    <th className="px-3 py-3">Kabupaten/Kota</th><th className="px-3 py-3 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {d.by_regency.map((r) => (
                    <tr key={r.regency} className="h-12 border-b border-line hover:bg-ground">
                      <td className="px-3">{r.regency}</td>
                      <td className="px-3 text-right font-mono">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </>
      )}

      <Panel as="section" className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Laporan tertunda{d ? ` (${d.stale_count})` : ""}</h2>
        {stale.isError && <p role="alert" className="font-semibold text-danger">Gagal memuat laporan tertunda.</p>}
        {stale.data && stale.data.results.length === 0 && <p className="text-sm text-muted">Tidak ada laporan tertunda.</p>}
        {stale.data && stale.data.results.length > 0 && (
          <ul className="m-0 list-none p-0">
            {stale.data.results.map((r) => (
              <li key={r.id} className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line py-3 text-sm">
                <Link className="font-mono font-semibold tabular-nums underline underline-offset-4"
                  to={`/petugas/laporan/${r.id}`}>{r.code}</Link>
                <span>{r.category?.name}</span>
                <span>{r.status_label}</span>
                <span className="text-muted">{r.days_since_update} hari tanpa pembaruan</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <InsightsCard range={range} />
    </div>
  );
}
