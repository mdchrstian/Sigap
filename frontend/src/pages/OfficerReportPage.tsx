import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import StatusBadge from "../components/StatusBadge";
import { MarkaRoute, Panel, SignPlate, useToast } from "../components/ui";
import StatusForm from "../features/officer/StatusForm";
import { fetchDetail, postStatus } from "../features/officer/officerApi";
import type { ReportStatus } from "../lib/status";

const fmt = (s: string) => new Date(s).toLocaleString("id-ID");

export default function OfficerReportPage() {
  const { id = "" } = useParams();
  const toast = useToast();
  const q = useQuery({ queryKey: ["officer-report", id], queryFn: () => fetchDetail(id) });

  if (q.isLoading) return <p>Memuat...</p>;
  if (q.isError || !q.data) return <p role="alert" className="font-semibold text-danger">Laporan tidak ditemukan.</p>;
  const r = q.data;
  const count = r.master?.report_count ?? 1;

  async function submit(status: ReportStatus, note: string) {
    try {
      const res = await postStatus(r.id, status, note);
      toast(`Status diperbarui (${res.updated.length} laporan)`);
      await q.refetch();
    } catch (e) {
      await q.refetch();
      throw e;
    }
  }

  const steps = r.history.map((h, i) => ({
    title: h.status_label,
    description: h.note || undefined,
    meta: `oleh ${h.actor_name ?? h.actor_role_label} (${h.actor_role_label}) · ${fmt(h.created_at)}`,
    state: (i === r.history.length - 1 ? "current" : "done") as "current" | "done",
  }));

  return (
    <div className="flex flex-col gap-8">
      <Link to="/petugas" className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
        <ArrowLeft size={20} aria-hidden="true" />Kembali ke dasbor
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <SignPlate tone="info" className="font-mono">{r.code}</SignPlate>
        <StatusBadge status={r.status} />
        <span className="text-sm text-muted">{r.category?.name}</span>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-8 md:col-span-2">
          <section className="flex flex-wrap gap-3">
            {r.images.map((i) => (
              <a key={i.id} href={i.url} target="_blank" rel="noreferrer">
                <img src={i.url} alt={`Foto ${r.code}`} className="h-48 rounded-lg object-cover" />
              </a>
            ))}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-bold">Deskripsi</h2>
            <p className="whitespace-pre-wrap">{r.description}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Analisis AI</h2>
            <p className="text-sm text-muted">Hanya sebagai konteks; keputusan ada pada petugas.</p>
            {r.ai.used ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Panel className="flex flex-col gap-2 text-sm">
                  <h3 className="font-semibold">Saran AI</h3>
                  <div>Kategori: {r.ai.suggested_category?.name ?? "-"}</div>
                  <p>{r.ai.suggested_description || "-"}</p>
                  {r.ai.observations && <p className="text-muted">{r.ai.observations}</p>}
                </Panel>
                <Panel className="flex flex-col gap-2 text-sm">
                  <h3 className="font-semibold">Final (pelapor)</h3>
                  <div>Kategori: {r.category?.name ?? "-"}</div>
                  <p>{r.description}</p>
                </Panel>
              </div>
            ) : (
              <p className="text-sm">AI tidak digunakan.</p>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold">Lokasi</h2>
            <p className="text-sm">{r.address || "-"}{r.regency ? `, ${r.regency}` : ""}</p>
            <div className="h-64 overflow-hidden rounded-xl border border-line">
              <MapContainer center={[r.latitude, r.longitude]} zoom={15} className="h-full w-full">
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap" />
                <CircleMarker center={[r.latitude, r.longitude]} radius={10} />
              </MapContainer>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <Panel as="section" className="flex flex-col gap-2 text-sm">
            <h2 className="text-lg font-bold">Pelapor</h2>
            {r.reporter ? (
              <>
                <div>{r.reporter.full_name}</div>
                <div className="text-muted">{r.reporter.email}</div>
              </>
            ) : "-"}
            <p className="text-muted">
              {r.master ? `Grup #${r.master.id}: ${r.master.report_count} laporan.` : "Tidak ada grup."}
            </p>
          </Panel>
          <Panel as="section" className="flex flex-col gap-6">
            <h2 className="text-lg font-bold">Ubah status</h2>
            <StatusForm key={r.status} current={r.status} masterCount={count} onSubmit={submit} />
          </Panel>
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">Riwayat</h2>
            <MarkaRoute steps={steps} />
          </section>
        </aside>
      </div>
    </div>
  );
}
