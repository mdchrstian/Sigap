import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const link = "inline-flex h-12 items-center text-sm font-semibold text-white underline underline-offset-3";
  return (
    <footer className="relative bg-aspal text-white">
      <svg className="absolute inset-x-0 top-0 h-1 w-full" aria-hidden="true" focusable="false">
        <line x1="0" x2="100%" y1="2" y2="2" className="stroke-marka" strokeWidth="4" strokeDasharray="8 8" />
      </svg>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-display text-lg font-extrabold">Sigap</p>
          <p className="max-w-[68ch] text-sm">Layanan pelaporan kerusakan fasilitas publik di Bali.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1">
          <Link to="/peta" className={link}>Peta</Link>
          <Link to="/lapor" className={link}>Buat Laporan</Link>
          {user ? (
            <Link to="/profil" className={link}>Profil</Link>
          ) : (
            <Link to="/masuk" className={link}>Masuk</Link>
          )}
        </nav>
      </div>
    </footer>
  );
}
