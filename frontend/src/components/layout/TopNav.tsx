import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import NotificationBell from "../../features/notifications/NotificationBell";
import { useAuth } from "../../features/auth/AuthContext";

const links = [
  { to: "/", label: "Beranda", end: true },
  { to: "/peta", label: "Jelajahi Peta" },
  { to: "/laporan-saya", label: "Laporan Saya" },
  { to: "/notifikasi", label: "Notifikasi" },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === "officer" || user?.role === "admin";
  const all: { to: string; label: string; end?: boolean }[] = isStaff
    ? [...links, { to: "/petugas", label: "Dashboard Petugas" }]
    : links;
  const cls = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-primary-light text-primary" : "hover:bg-primary-light"}`;
  const doLogout = () => {
    setMenu(false);
    setOpen(false);
    logout();
    navigate("/masuk");
  };
  const plain = "rounded-md px-3 py-2 text-sm font-medium hover:bg-primary-light";
  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-primary">Sigap</Link>
        <nav className="hidden items-center gap-1 md:flex">
          {all.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          {user ? (
            <div className="relative hidden md:block">
              <button className={plain} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                {user.full_name || user.email}
              </button>
              {menu && (
                <div className="absolute right-0 mt-1 w-40 rounded-md border border-slate-200 bg-white py-1 shadow">
                  <Link to="/profil" className="block px-3 py-2 text-sm hover:bg-primary-light" onClick={() => setMenu(false)}>Profil</Link>
                  <button className="block w-full px-3 py-2 text-left text-sm hover:bg-primary-light" onClick={doLogout}>Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Link to="/masuk" className={plain}>Masuk</Link>
              <Link to="/daftar" className={plain}>Daftar</Link>
            </div>
          )}
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
          {all.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/profil" className={cls} onClick={() => setOpen(false)}>Profil ({user.full_name || user.email})</NavLink>
              <button className={`${plain} text-left`} onClick={doLogout}>Keluar</button>
            </>
          ) : (
            <>
              <NavLink to="/masuk" className={cls} onClick={() => setOpen(false)}>Masuk</NavLink>
              <NavLink to="/daftar" className={cls} onClick={() => setOpen(false)}>Daftar</NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
