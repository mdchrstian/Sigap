import Hero from "../features/landing/Hero";
import HowItWorks from "../features/landing/HowItWorks";
import PublicStats from "../features/analytics/PublicStats";
import { Button } from "../components/ui";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <section aria-labelledby="wilayah" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <h2 id="wilayah" className="mb-6 font-display text-2xl font-extrabold text-ink">
            Laporan di seluruh Bali
          </h2>
          <PublicStats />
        </div>
      </section>
      <section aria-labelledby="penutup" className="bg-rambu">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:py-24">
          <h2 id="penutup" className="font-display text-2xl font-extrabold text-white">
            Ada yang rusak di sekitar Anda?
          </h2>
          <Button size="lg" variant="secondary" to="/lapor">Buat Laporan</Button>
        </div>
      </section>
    </>
  );
}
