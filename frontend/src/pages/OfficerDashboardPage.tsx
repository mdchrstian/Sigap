import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import StatusBadge from "../components/StatusBadge";
import { STATUS_MAP, type ReportStatus } from "../lib/status";
import { useAuth } from "../features/auth/AuthContext";
import { REGENCIES } from "../features/map/mapApi";
import {
  fetchCategories, fetchOfficerList, fetchSummary, type OfficerFilters, type OfficerItem,
} from "../features/officer/officerApi";

const PAGE_SIZE = 20;

function Hidden({ item }: { item: OfficerItem }) {
  return item.is_hidden ? (
    <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold">Disembunyikan</span>
  ) : null;
}

const fmt = (s: string) => new Date(s).toLocaleDateString("id-ID");

export default function OfficerDashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<OfficerFilters>({
    status: "", category: "", regency: "", q: "", page: 1,
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === search ? f : { ...f, q: search, page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search]);

  const list = useQuery({ queryKey: ["officer-list", filters], queryFn: () => fetchOfficerList(filters) });
  const summary = useQuery({ queryKey: ["officer-summary"], queryFn: fetchSummary });
  const cats = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const counts: Record<string, number> = {};
  let total = 0;
  for (const c of summary.data?.by_status ?? []) {
    counts[c.status] = c.count;
    total += c.count;
  }
  const set = (patch: Partial<OfficerFilters>) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const items = list.data?.results ?? [];
  const pages = Math.max(1, Math.ceil((list.data?.count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Dasbor Petugas</h1>
        <div className="flex gap-3 text-sm font-semibold">
          <Link className="text-[#2D6CDF] underline" to="/petugas/statistik">Statistik</Link>
          {user?.role === "admin" && (
            <a className="text-[#2D6CDF] underline" href="/admin/">Buka Admin</a>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        <button role="tab" aria-selected={filters.status === ""} onClick={() => set({ status: "" })}
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm ${filters.status === "" ? "bg-slate-800 text-white" : ""}`}>
          Semua{summary.data ? ` (${total})` : ""}
        </button>
        {(Object.keys(STATUS_MAP) as ReportStatus[]).map((s) => (
          <button key={s} role="tab" aria-selected={filters.status === s} onClick={() => set({ status: s })}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm ${filters.status === s ? "bg-slate-800 text-white" : ""}`}>
            {STATUS_MAP[s].label}{summary.data ? ` (${counts[s] ?? 0})` : ""}
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <select aria-label="Kategori" className="rounded border p-2" value={filters.category}
          onChange={(e) => set({ category: e.target.value })}>
          <option value="">Semua kategori</option>
          {(cats.data ?? []).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select aria-label="Kabupaten/Kota" className="rounded border p-2" value={filters.regency}
          onChange={(e) => set({ regency: e.target.value })}>
          <option value="">Semua kabupaten/kota</option>
          {REGENCIES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input aria-label="Cari" type="search" placeholder="Cari kode atau deskripsi"
          className="rounded border p-2" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {list.isError && <p role="alert" className="text-red-600">Gagal memuat laporan.</p>}
      {list.isLoading && <p>Memuat...</p>}
      {list.data && items.length === 0 && <p>Tidak ada laporan.</p>}

      {items.length > 0 && (
        <>
          <table className="hidden w-full text-left text-sm md:table">
            <thead>
              <tr className="border-b">
                <th className="p-2">Foto</th><th className="p-2">Kode</th><th className="p-2">Kategori</th>
                <th className="p-2">Deskripsi</th><th className="p-2">Status</th>
                <th className="p-2">Kab/Kota</th><th className="p-2">Pelapor</th><th className="p-2">Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b align-top">
                  <td className="p-2">
                    {r.thumbnail_url && <img src={r.thumbnail_url} alt="" className="h-12 w-12 rounded object-cover" />}
                  </td>
                  <td className="p-2 font-semibold">
                    <Link className="text-[#2D6CDF] underline" to={`/petugas/laporan/${r.id}`}>{r.code}</Link>
                    <Hidden item={r} />
                  </td>
                  <td className="p-2">{r.category?.name}</td>
                  <td className="max-w-xs p-2">{r.description}</td>
                  <td className="p-2"><StatusBadge status={r.status} /></td>
                  <td className="p-2">{r.regency}</td>
                  <td className="p-2">{r.reporter_name}</td>
                  <td className="p-2">{fmt(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="space-y-3 md:hidden">
            {items.map((r) => (
              <li key={r.id} className="rounded border p-3">
                <Link to={`/petugas/laporan/${r.id}`} className="flex gap-3">
                  {r.thumbnail_url && <img src={r.thumbnail_url} alt="" className="h-16 w-16 rounded object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{r.code}<Hidden item={r} /></div>
                    <div className="text-xs text-slate-600">{r.category?.name} · {r.regency} · {fmt(r.created_at)}</div>
                    <p className="line-clamp-2 text-sm">{r.description}</p>
                    <div className="mt-1"><StatusBadge status={r.status} /></div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex items-center justify-between text-sm">
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={filters.page <= 1}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Sebelumnya</button>
        <span>Halaman {filters.page} dari {pages}</span>
        <button className="rounded border px-3 py-1 disabled:opacity-50" disabled={filters.page >= pages}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Berikutnya</button>
      </div>
    </div>
  );
}
