import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Camera, Menu, X } from "lucide-react";
import NotificationBell from "../../features/notifications/NotificationBell";
import { useAuth } from "../../features/auth/AuthContext";
import { Button } from "../ui";

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
    `flex items-center rounded-lg px-3 text-sm font-semibold transition-colors duration-150 h-12 md:h-16 md:rounded-none md:border-b-3 ${
      isActive
        ? "text-rambu md:border-marka"
        : "text-ink hover:bg-ground md:border-transparent"
    }`;
  const mobileCls = (a: { isActive: boolean }) => `${cls(a)} md:hidden`;
  const doLogout = () => {
    setMenu(false);
    setOpen(false);
    logout();
    navigate("/masuk");
  };
  const plain =
    "flex h-12 items-center rounded-lg px-3 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-ground";
  const name = user ? user.full_name || user.email : "";
  return (
    <header className="sticky top-0 z-[1000] border-b border-line bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="shrink-0 rounded-lg bg-rambu px-3 py-1 font-display text-lg font-extrabold text-white outline-2 -outline-offset-4 outline-white focus-visible:outline-marka"
        >
          Sigap
        </Link>
        <nav className="hidden h-full items-stretch gap-1 md:flex" aria-label="Utama">
          {all.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={cls}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user && <NotificationBell />}
          {user ? (
            <div className="relative hidden md:block">
              <button
                className={`${plain} max-w-48`}
                aria-expanded={menu}
                onClick={() => setMenu((m) => !m)}
              >
                <span className="truncate">{name}</span>
              </button>
              {menu && (
                <div className="absolute right-0 mt-1 w-40 rounded-lg border border-line bg-surface py-1 shadow-overlay">
                  <Link
                    to="/profil"
                    className="flex h-12 items-center px-3 text-sm font-semibold hover:bg-ground"
                    onClick={() => setMenu(false)}
                  >
                    Profil
                  </Link>
                  <button
                    className="flex h-12 w-full items-center px-3 text-left text-sm font-semibold hover:bg-ground"
                    onClick={doLogout}
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Link to="/masuk" className={plain}>
                Masuk
              </Link>
              <Link to="/daftar" className={plain}>
                Daftar
              </Link>
            </div>
          )}
          <Button to="/lapor" icon={Camera}>
            Buat Laporan
          </Button>
          <button
            className="flex size-12 items-center justify-center rounded-lg hover:bg-ground md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex w-full flex-col gap-1 border-t border-line bg-surface px-4 py-2 md:hidden" aria-label="Menu seluler">
          {all.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={mobileCls} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/profil" className={mobileCls} onClick={() => setOpen(false)}>
                <span className="truncate">Profil ({name})</span>
              </NavLink>
              <button className={`${plain} text-left`} onClick={doLogout}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <NavLink to="/masuk" className={mobileCls} onClick={() => setOpen(false)}>
                Masuk
              </NavLink>
              <NavLink to="/daftar" className={mobileCls} onClick={() => setOpen(false)}>
                Daftar
              </NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
