import { MarkaRoute, type MarkaStep } from "../../components/ui";

const STEPS: MarkaStep[] = [
  { title: "Foto & lokasi", description: "Ambil foto, titik lokasi terisi otomatis.", state: "current" },
  { title: "AI menyusun draf", description: "Kategori dan deskripsi disarankan; Anda yang memastikan.", state: "upcoming" },
  { title: "Ditinjau petugas", description: "Laporan serupa di lokasi yang sama digabung.", state: "upcoming" },
  { title: "Dalam Pengerjaan", description: "Status diperbarui beserta catatan petugas.", state: "upcoming" },
  { title: "Selesai", description: "Anda mendapat notifikasi.", state: "upcoming" },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="cara-kerja" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <h2 id="cara-kerja" className="mb-8 font-display text-2xl font-extrabold text-ink">
        Dari foto sampai selesai
      </h2>
      <div className="max-w-xl">
        <MarkaRoute animate steps={STEPS} />
      </div>
    </section>
  );
}
