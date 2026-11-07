import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import StatusBadge from "../../components/StatusBadge";
import { ApiError } from "../../lib/api";
import Comments from "./Comments";
import { fetchDetail, fmtDate, fmtDateTime, type DetailReport } from "./api";

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
    <article className="mx-auto max-w-3xl space-y-6 overflow-x-hidden">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{r.code}</h1>
          <StatusBadge status={r.status} />
        </div>
        <p className="text-slate-600">{r.category.name} &middot; {fmtDate(r.created_at)}</p>
      </header>

      {r.images.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {r.images.map((im) => (
            <button key={im.id} onClick={() => setLightbox(im.url)} aria-label="Perbesar foto">
              <img src={im.url} alt={`Foto ${r.code}`} className="aspect-square w-full rounded object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded bg-slate-100 text-slate-500">
          Tidak ada foto
        </div>
      )}
      {lightbox && (
        <div
          role="dialog"
          aria-label="Foto"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4"
        >
          <img src={lightbox} alt="Foto laporan" className="max-h-full max-w-full" />
        </div>
      )}

      <p className="whitespace-pre-wrap break-words">{r.description}</p>
      <p className="text-slate-600">{[r.address, r.regency].filter(Boolean).join(", ")}</p>

      <div className="h-48 overflow-hidden rounded">
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
      <Link to="/peta" className="inline-block text-[#2D6CDF] underline">Lihat di peta</Link>

      {r.master && r.master.report_count > 1 && (
        <p className="rounded bg-blue-50 p-3">
          Laporan ini tergabung dengan {r.master.report_count - 1} laporan lain tentang masalah yang sama.
        </p>
      )}

      {r.ai.used && (
        <aside className="rounded border border-violet-300 bg-violet-50 p-3 text-sm">
          <h2 className="font-semibold">Dibantu AI</h2>
          {r.ai.suggested_category && <p>Kategori: {r.ai.suggested_category}</p>}
          {r.ai.suggested_description && <p>Deskripsi: {r.ai.suggested_description}</p>}
          {obs.length > 0 && (
            <ul className="list-disc pl-5">{obs.map((o, i) => <li key={i}>{o}</li>)}</ul>
          )}
          <p className="mt-1 text-slate-600">Saran AI telah ditinjau pelapor.</p>
        </aside>
      )}

      <section>
        <h2 className="text-lg font-semibold">Riwayat Status</h2>
        <ol className="mt-3 space-y-4 border-l-2 border-slate-300 pl-4">
          {r.history.map((h, i) => (
            <li key={i} data-testid="history-item">
              <p className="font-semibold">{h.status_label}</p>
              <p className="text-sm text-slate-500">{h.actor_role_label} &middot; {fmtDateTime(h.created_at)}</p>
              {h.note && <p className="break-words">{h.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      <Comments reportId={id} />
    </article>
  );
}
