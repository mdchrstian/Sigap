import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Beranda", end: true },
  { to: "/peta", label: "Jelajahi Peta" },
  { to: "/laporan-saya", label: "Laporan Saya" },
  { to: "/notifikasi", label: "Notifikasi" },
  { to: "/profil", label: "Profil" },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const cls = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-primary-light text-primary" : "hover:bg-primary-light"}`;
  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-primary">Sigap</Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/lapor" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            Buat Laporan
          </Link>
          <button
            className="rounded-md p-2 md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-2 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
