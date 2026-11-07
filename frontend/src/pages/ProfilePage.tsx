import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth, type Role } from "../features/auth/AuthContext";
import { parseError, type FormErrors } from "../features/auth/errors";

const ROLE: Record<Role, string> = { public: "Warga", officer: "Petugas", admin: "Administrator" };

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState(user?.full_name ?? "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<FormErrors>({ fields: {}, general: "" });
  if (!user) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    setErr({ fields: {}, general: "" });
    try {
      await api("/api/auth/me", { method: "PATCH", body: { full_name: name } });
      await refreshUser();
      setSaved(true);
    } catch (ex) {
      setErr(parseError(ex));
    }
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Profil</h1>
      <dl className="mb-4 space-y-1 text-sm">
        <div><dt className="inline font-medium">Email: </dt><dd className="inline">{user.email}</dd></div>
        <div><dt className="inline font-medium">Peran: </dt><dd className="inline">{ROLE[user.role]}</dd></div>
      </dl>
      <form onSubmit={submit} className="space-y-4">
        {err.general && <p role="alert" className="text-sm text-red-600">{err.general}</p>}
        <div>
          <label htmlFor="full_name">Nama lengkap</label>
          <input id="full_name" required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
          {err.fields.full_name && <p className="text-sm text-red-600">{err.fields.full_name}</p>}
        </div>
        <button disabled={pending} className="rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50">Simpan</button>
        {saved && <span role="status" className="ml-2 text-sm text-green-700">Tersimpan</span>}
      </form>
      <button
        onClick={() => { logout(); nav("/masuk"); }}
        className="mt-6 rounded-md border border-slate-300 px-4 py-2 font-medium"
      >
        Keluar
      </button>
    </div>
  );
}
