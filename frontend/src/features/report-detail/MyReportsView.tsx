import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { fetchMine, fmtDate, type MineItem } from "./api";

export default function MyReportsView() {
  const [items, setItems] = useState<MineItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const r = await fetchMine(p);
      setItems((prev) => (p === 1 ? r.results : [...prev, ...r.results]));
      setHasNext(!!r.next);
      setPage(p);
    } catch {
      setError("Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Laporan Saya</h1>
      {error && <p role="alert" className="mt-2 text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-slate-600">Anda belum membuat laporan.</p>
          <Link to="/lapor" className="inline-block rounded bg-[#2D6CDF] px-4 py-2 text-white">
            Buat Laporan
          </Link>
        </div>
      )}
      <ul className="mt-4 space-y-3">
        {items.map((m) => {
          const thumb = m.thumbnail_url ?? m.images?.[0]?.url;
          const cat = typeof m.category === "string" ? m.category : m.category?.name;
          return (
            <li key={m.id}>
              <Link to={`/laporan/${m.id}`} className="flex gap-3 rounded border p-3 hover:bg-slate-50">
                {thumb ? (
                  <img src={thumb} alt="" className="h-20 w-20 shrink-0 rounded object-cover" />
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded bg-slate-100" />
                )}
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.code}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <p>{cat}</p>
                  <p className="text-sm text-slate-500">{m.regency} &middot; {fmtDate(m.created_at)}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {hasNext && (
        <button disabled={loading} onClick={() => load(page + 1)} className="mt-4 rounded border px-4 py-2">
          Muat lebih banyak
        </button>
      )}
    </div>
  );
}
