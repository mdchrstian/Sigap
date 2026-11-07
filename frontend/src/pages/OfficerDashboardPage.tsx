import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChartColumn, ClipboardList, Search } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { Button, EmptyState, Input, Select, SignPlate } from "../components/ui";
import { STATUS_MAP, type ReportStatus } from "../lib/status";
import { useAuth } from "../features/auth/AuthContext";
import { REGENCIES } from "../features/map/mapApi";
import {
  fetchCategories, fetchOfficerList, fetchSummary, type OfficerFilters, type OfficerItem,
} from "../features/officer/officerApi";

const PAGE_SIZE = 20;

function Hidden({ item }: { item: OfficerItem }) {
  return item.is_hidden ? (
    <span className="ml-2 rounded-lg bg-marka-soft px-2 py-1 text-xs font-semibold text-ink">Disembunyikan</span>
  ) : null;
}

function relativeDate(s: string, now = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(s).getTime()) / 86400000);
  if (days <= 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 30) return `${days} hari lalu`;
  return new Date(s).toLocaleDateString("id-ID");
}

const group = (r: OfficerItem) => (r.master_count > 1 ? `${r.master_count} laporan` : "");

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

  const tabs: { key: string; label: string; count?: number }[] = [
    { key: "", label: "Semua", count: summary.data ? total : undefined },
    ...(Object.keys(STATUS_MAP) as ReportStatus[]).map((s) => ({
      key: s, label: STATUS_MAP[s].label, count: summary.data ? counts[s] ?? 0 : undefined,
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <SignPlate tone="info" className="flex-1">Dasbor Petugas</SignPlate>
        <Button variant="secondary" icon={ChartColumn} to="/petugas/statistik">Statistik</Button>
        {user?.role === "admin" && (
          <a href="/admin/"
            className="inline-flex h-12 items-center rounded-lg px-6 text-sm font-semibold text-ink hover:bg-line">
            Buka Admin
          </a>
        )}
      </div>

      <div role="tablist" className="flex flex-wrap gap-x-4 gap-y-2 border-b border-line">
        {tabs.map((t) => {
          const active = filters.status === t.key;
          return (
            <button key={t.key} role="tab" aria-selected={active} onClick={() => set({ status: t.key })}
              className={`-mb-px flex h-12 items-center gap-2 border-b-[3px] px-2 text-sm font-semibold ${
                active ? "border-marka text-ink" : "border-transparent text-muted hover:text-ink"
              }`}>
              {t.label}
              {t.count !== undefined && <span className="font-mono tabular-nums">({t.count})</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-48 flex-1">
          <Select aria-label="Kategori" value={filters.category}
            onChange={(e) => set({ category: e.target.value })}>
            <option value="">Semua kategori</option>
            {(cats.data ?? []).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Select>
        </div>
        <div className="min-w-48 flex-1">
          <Select aria-label="Kabupaten/Kota" value={filters.regency}
            onChange={(e) => set({ regency: e.target.value })}>
            <option value="">Semua kabupaten/kota</option>
            {REGENCIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
        <div className="relative min-w-48 flex-1">
          <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-muted" />
          <Input aria-label="Cari" type="search" placeholder="Cari kode atau deskripsi"
            className="pl-12" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {list.isError && <p role="alert" className="font-semibold text-danger">Gagal memuat laporan.</p>}
      {list.isLoading && <p>Memuat...</p>}
      {list.data && items.length === 0 && (
        <EmptyState icon={ClipboardList} title="Tidak ada laporan untuk filter ini." />
      )}

      {items.length > 0 && (
        <>
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="sticky top-0 bg-ground">
              <tr className="border-b border-line-strong">
                <th className="px-3 py-3">Kode</th><th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3">Kab/Kota</th><th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Grup</th><th className="px-3 py-3">Diperbarui</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="h-16 border-b border-line hover:bg-surface">
                  <td className="px-3 font-mono font-semibold tabular-nums">
                    <Link className="underline underline-offset-4" to={`/petugas/laporan/${r.id}`}>{r.code}</Link>
                    <Hidden item={r} />
                  </td>
                  <td className="px-3">{r.category?.name}</td>
                  <td className="px-3">{r.regency}</td>
                  <td className="px-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3">{group(r)}</td>
                  <td className="px-3 text-muted">{relativeDate(r.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="m-0 list-none border-t border-line p-0 md:hidden">
            {items.map((r) => (
              <li key={r.id} className="border-b border-line">
                <Link to={`/petugas/laporan/${r.id}`} className="flex flex-col gap-2 py-4">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold tabular-nums">{r.code}</span>
                    <Hidden item={r} />
                    <StatusBadge status={r.status} />
                  </span>
                  <span className="text-sm">{r.category?.name} · {r.regency}</span>
                  <span className="text-sm text-muted">
                    {group(r) && `${group(r)} · `}{relativeDate(r.updated_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        <Button variant="secondary" disabled={filters.page <= 1}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Sebelumnya</Button>
        <span>Halaman {filters.page} dari {pages}</span>
        <Button variant="secondary" disabled={filters.page >= pages}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Berikutnya</Button>
      </div>
    </div>
  );
}
