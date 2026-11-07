import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import StatusBadge from "../components/StatusBadge";
import StatusForm from "../features/officer/StatusForm";
import { fetchDetail, postStatus } from "../features/officer/officerApi";
import type { ReportStatus } from "../lib/status";

const fmt = (s: string) => new Date(s).toLocaleString("id-ID");

export default function OfficerReportPage() {
  const { id = "" } = useParams();
  const [toast, setToast] = useState("");
  const q = useQuery({ queryKey: ["officer-report", id], queryFn: () => fetchDetail(id) });

  if (q.isLoading) return <p>Memuat...</p>;
  if (q.isError || !q.data) return <p role="alert" className="text-red-600">Laporan tidak ditemukan.</p>;
  const r = q.data;
  const count = r.master?.report_count ?? 1;

  async function submit(status: ReportStatus, note: string) {
    try {
      const res = await postStatus(r.id, status, note);
      setToast(`Status diperbarui (${res.updated.length} laporan)`);
      setTimeout(() => setToast(""), 4000);
      await q.refetch();
    } catch (e) {
      await q.refetch();
      throw e;
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/petugas" className="text-sm text-[#2D6CDF] underline">&larr; Kembali ke dasbor</Link>
      {toast && (
        <div role="status" className="fixed right-4 top-4 z-[3000] rounded bg-slate-900 px-4 py-2 text-white shadow">
          {toast}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{r.code}</h1>
        <StatusBadge status={r.status} />
        <span className="text-sm text-slate-600">{r.category?.name}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="flex flex-wrap gap-2">
            {r.images.map((i) => (
              <a key={i.id} href={i.url} target="_blank" rel="noreferrer">
                <img src={i.url} alt={`Foto ${r.code}`} className="h-40 rounded object-cover" />
              </a>
            ))}
          </section>

          <section>
            <h2 className="font-semibold">Deskripsi</h2>
            <p className="whitespace-pre-wrap">{r.description}</p>
          </section>

          <section>
            <h2 className="font-semibold">Lokasi</h2>
            <p className="mb-2 text-sm">{r.address || "-"}{r.regency ? `, ${r.regency}` : ""}</p>
            <div className="h-56 overflow-hidden rounded border">
              <MapContainer center={[r.latitude, r.longitude]} zoom={15} className="h-full w-full">
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap" />
                <CircleMarker center={[r.latitude, r.longitude]} radius={10} />
              </MapContainer>
            </div>
          </section>

          <section>
            <h2 className="font-semibold">Analisis AI</h2>
            <p className="mb-2 text-xs text-slate-600">Hanya sebagai konteks; keputusan ada pada petugas.</p>
            {r.ai.used ? (
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded border p-3">
                  <div className="font-semibold">Saran AI</div>
                  <div>Kategori: {r.ai.suggested_category?.name ?? "-"}</div>
                  <p>{r.ai.suggested_description || "-"}</p>
                  {r.ai.observations && <p className="mt-1 text-slate-600">{r.ai.observations}</p>}
                </div>
                <div className="rounded border p-3">
                  <div className="font-semibold">Final (pelapor)</div>
                  <div>Kategori: {r.category?.name ?? "-"}</div>
                  <p>{r.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm">AI tidak digunakan.</p>
            )}
          </section>

          <section>
            <h2 className="font-semibold">Riwayat</h2>
            <ol className="mt-2 space-y-2 border-l-2 pl-4">
              {r.history.map((h, i) => (
                <li key={i}>
                  <div className="text-sm font-semibold">
                    {h.status_label}
                    <span className="font-normal text-slate-600">
                      {" "}oleh {h.actor_name ?? h.actor_role_label} ({h.actor_role_label}) · {fmt(h.created_at)}
                    </span>
                  </div>
                  {h.note && <p className="text-sm">{h.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded border p-3">
            <h2 className="mb-2 font-semibold">Ubah status</h2>
            <StatusForm key={r.status} current={r.status} masterCount={count} onSubmit={submit} />
          </section>
          <section className="rounded border p-3 text-sm">
            <h2 className="mb-1 font-semibold">Pelapor</h2>
            {r.reporter ? (
              <>
                <div>{r.reporter.full_name}</div>
                <div className="text-slate-600">{r.reporter.email}</div>
              </>
            ) : "-"}
          </section>
          <section className="rounded border p-3 text-sm">
            <h2 className="mb-1 font-semibold">Grup laporan</h2>
            {r.master ? (
              <p>Grup #{r.master.id}: {r.master.report_count} laporan.</p>
            ) : (
              <p>Tidak ada grup.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
