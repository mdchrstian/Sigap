import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import { ImageOff } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { Button, Dialog, MarkaRoute, Panel } from "../../components/ui";
import { ApiError } from "../../lib/api";
import Comments from "./Comments";
import { fetchDetail, fmtDate, type DetailReport } from "./api";
import { buildTimeline } from "./timeline";

const catName = (c: unknown): string =>
  typeof c === "string" ? c : c && typeof c === "object" ? String((c as { name?: string }).name ?? "") : "";

export default function ReportDetailView({ id }: { id: string }) {
  const [r, setR] = useState<DetailReport | null>(null);
  const [err, setErr] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setR(null);
    setErr("");
    fetchDetail(id)
      .then((d) => alive && setR(d))
      .catch((e) => {
        if (!alive) return;
        setErr(e instanceof ApiError && e.status === 404 ? "Laporan tidak ditemukan" : "Gagal memuat laporan.");
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (err) return <p role="alert" className="py-8 text-center text-lg">{err}</p>;
  if (!r) return <p className="py-8 text-center">Memuat...</p>;

  const obs = Array.isArray(r.ai.observations)
    ? r.ai.observations
    : r.ai.observations
      ? [r.ai.observations]
      : [];

  return (
    <article className="mx-auto flex max-w-6xl flex-col gap-8 overflow-x-hidden px-4 py-8 sm:px-6 md:py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-base font-semibold tabular-nums text-muted">{r.code}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold">{r.category.name}</h1>
          <StatusBadge status={r.status} />
        </div>
        <p className="text-muted">Dilaporkan {fmtDate(r.created_at)}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          {r.images.length ? (
            <div className="grid grid-cols-2 gap-2">
              {r.images.map((im) => (
                <button key={im.id} type="button" onClick={() => setLightbox(im.url)} aria-label="Perbesar foto"
                  className="rounded-xl">
                  <img src={im.url} alt={`Foto ${r.category.name}`}
                    className="aspect-square w-full rounded-xl border border-line object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center gap-2 rounded-xl border border-line bg-ground text-muted">
              <ImageOff size={20} aria-hidden="true" />
              Tidak ada foto
            </div>
          )}
          <Dialog open={!!lightbox} onClose={() => setLightbox(null)} title="Foto laporan">
            {lightbox && <img src={lightbox} alt={`Foto ${r.category.name}`} className="max-h-96 w-full rounded-lg object-contain" />}
          </Dialog>

          <p className="max-w-[68ch] whitespace-pre-wrap break-words">{r.description}</p>
          <p className="break-words text-muted">{[r.address, r.regency].filter(Boolean).join(", ")}</p>

          <div className="h-48 overflow-hidden rounded-xl border border-line">
            <MapContainer
              center={[r.latitude, r.longitude]}
              zoom={15}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              zoomControl={false}
              keyboard={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <CircleMarker center={[r.latitude, r.longitude]} radius={10} />
            </MapContainer>
          </div>
          <div>
            <Button variant="secondary" to="/peta">Lihat di peta</Button>
          </div>

          {r.master && r.master.report_count > 1 && (
            <p className="rounded-lg bg-info-soft p-4">
              Laporan ini tergabung dengan {r.master.report_count - 1} laporan lain tentang masalah yang sama.
            </p>
          )}

          {r.ai.used && (
            <aside className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 text-sm">
              <h2 className="font-semibold">Dibantu AI</h2>
              {catName(r.ai.suggested_category) && <p>Kategori: {catName(r.ai.suggested_category)}</p>}
              {r.ai.suggested_description && <p>Deskripsi: {r.ai.suggested_description}</p>}
              {obs.length > 0 && (
                <ul className="list-disc pl-6">{obs.map((o, i) => <li key={i}>{typeof o === "string" ? o : JSON.stringify(o)}</li>)}</ul>
              )}
              <p className="text-muted">Saran AI telah ditinjau pelapor.</p>
            </aside>
          )}
        </div>

        <section aria-labelledby="riwayat" className="min-w-0">
          <Panel>
            <h2 id="riwayat" className="mb-6 text-lg font-bold">Riwayat Status</h2>
            <div className="break-words">
              <MarkaRoute steps={buildTimeline(r)} />
            </div>
          </Panel>
        </section>
      </div>

      <Comments reportId={id} />
    </article>
  );
}
