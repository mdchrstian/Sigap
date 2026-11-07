import { Button, SignPlate } from "../components/ui";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-8">
      <SignPlate>Halaman tidak ditemukan</SignPlate>
      <p className="max-w-[68ch]">Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
      <Button to="/">Kembali ke Beranda</Button>
    </div>
  );
}
