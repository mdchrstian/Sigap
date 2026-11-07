import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { parseError, type FormErrors } from "../features/auth/errors";

const input = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<FormErrors>({ fields: {}, general: "" });
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr({ fields: {}, general: "" });
    try {
      await register(form);
      nav("/", { replace: true });
    } catch (ex) {
      setErr(parseError(ex));
      setPending(false);
    }
  }

  const field = (id: keyof typeof form, label: string, type: string) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} required className={input} value={form[id]} onChange={set(id)} />
      {err.fields[id] && <p className="text-sm text-red-600">{err.fields[id]}</p>}
    </div>
  );

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Daftar</h1>
      <form onSubmit={submit} className="space-y-4">
        {err.general && <p role="alert" className="text-sm text-red-600">{err.general}</p>}
        {field("full_name", "Nama lengkap", "text")}
        {field("email", "Email", "email")}
        {field("password", "Kata sandi", "password")}
        <button disabled={pending} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50">
          Daftar
        </button>
      </form>
      <p className="mt-4 text-sm">
        Sudah punya akun? <Link to="/masuk" className="text-primary underline">Masuk</Link>
      </p>
    </div>
  );
}
