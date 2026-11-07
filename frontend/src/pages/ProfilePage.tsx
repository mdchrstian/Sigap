import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button, Field, Input, Panel, useToast } from "../components/ui";
import { api } from "../lib/api";
import { useAuth, type Role } from "../features/auth/AuthContext";
import { parseError, type FormErrors } from "../features/auth/errors";

const ROLE: Record<Role, string> = { public: "Warga", officer: "Petugas", admin: "Administrator" };

export default function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [name, setName] = useState(user?.full_name ?? "");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<FormErrors>({ fields: {}, general: "" });
  if (!user) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr({ fields: {}, general: "" });
    try {
      await api("/api/auth/me", { method: "PATCH", body: { full_name: name } });
      await refreshUser();
      toast("Profil disimpan");
    } catch (ex) {
      setErr(parseError(ex));
    }
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Panel className="flex flex-col gap-6">
        <h1 className="font-display text-xl font-extrabold">Profil</h1>
        <dl className="flex flex-col gap-3">
          <div><dt className="text-sm text-muted">Email</dt><dd className="font-semibold">{user.email}</dd></div>
          <div><dt className="text-sm text-muted">Peran</dt><dd className="font-semibold">{ROLE[user.role]}</dd></div>
        </dl>
        <form onSubmit={submit} className="flex flex-col gap-6">
          {err.general && (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 font-semibold text-danger">{err.general}</p>
          )}
          <Field label="Nama lengkap" htmlFor="full_name" error={err.fields.full_name}>
            <Input id="full_name" required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Button type="submit" size="lg" loading={pending} className="w-full">Simpan</Button>
        </form>
        <Button
          variant="secondary"
          icon={LogOut}
          onClick={() => { logout(); nav("/masuk"); }}
          className="w-full border-danger text-danger"
        >
          Keluar
        </Button>
      </Panel>
    </div>
  );
}
