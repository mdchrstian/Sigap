import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { Button, EmptyState } from "../../components/ui";
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-display text-2xl font-bold">Laporan Saya</h1>
      {error && <p role="alert" className="font-semibold text-danger">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Anda belum membuat laporan."
          action={<Button to="/lapor">Buat Laporan</Button>}
        />
      )}
      <ul className="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface">
        {items.map((m) => {
          const thumb = m.thumbnail_url ?? m.images?.[0]?.url;
          const cat = typeof m.category === "string" ? m.category : m.category?.name;
          return (
            <li key={m.id}>
              <Link to={`/laporan/${m.id}`} className="flex items-center gap-4 p-4 no-underline hover:bg-ground">
                {thumb ? (
                  <img src={thumb} alt="" className="size-16 shrink-0 rounded-lg border border-line object-cover" />
                ) : (
                  <div className="size-16 shrink-0 rounded-lg border border-line bg-ground" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <span className="font-mono font-semibold tabular-nums">{m.code}</span>
                    <span className="text-muted"> &middot; </span>
                    <span className="font-semibold">{cat}</span>
                  </p>
                  <p className="truncate text-sm text-muted">{m.regency} &middot; {fmtDate(m.created_at)}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={m.status} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {(page > 1 || hasNext) && (
        <div className="flex gap-3">
          {hasNext && (
            <Button variant="secondary" loading={loading} onClick={() => load(page + 1)}>
              Muat lebih banyak
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
