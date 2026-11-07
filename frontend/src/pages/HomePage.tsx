import { Link } from "react-router-dom";
import PublicStats from "../features/analytics/PublicStats";

const STEPS = ["AI membantu menyusun laporan", "Warga mengonfirmasi", "Petugas memverifikasi"];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-[#e8f3ef] p-6 sm:p-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Laporkan kerusakan fasilitas publik di Bali</h1>
        <p className="mt-3 max-w-xl">
          Sigap membantu warga melaporkan jalan rusak, lampu mati, dan fasilitas umum lain
          langsung ke petugas, lengkap dengan foto dan lokasi.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/lapor" className="rounded bg-[#176B5B] px-5 py-2 font-semibold text-white">Buat Laporan</Link>
          <Link to="/peta" className="rounded border border-[#176B5B] px-5 py-2 font-semibold text-[#176B5B]">Jelajahi Peta</Link>
        </div>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="mb-3 text-xl font-semibold">Cara kerja</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3 rounded border bg-white p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#176B5B] font-bold text-white">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stats">
        <h2 id="stats" className="mb-3 text-xl font-semibold">Statistik laporan</h2>
        <PublicStats />
      </section>
    </div>
  );
}
