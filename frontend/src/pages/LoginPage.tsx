import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { parseError, type FormErrors } from "../features/auth/errors";

const input = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<FormErrors>({ fields: {}, general: "" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr({ fields: {}, general: "" });
    try {
      await login(email, password);
      nav(next && next.startsWith("/") && !next.startsWith("//") ? next : "/", { replace: true });
    } catch (ex) {
      setErr(parseError(ex));
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Masuk</h1>
      <form onSubmit={submit} className="space-y-4">
        {err.general && <p role="alert" className="text-sm text-red-600">{err.general}</p>}
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          {err.fields.email && <p className="text-sm text-red-600">{err.fields.email}</p>}
        </div>
        <div>
          <label htmlFor="password">Kata sandi</label>
          <input id="password" type="password" required className={input} value={password} onChange={(e) => setPassword(e.target.value)} />
          {err.fields.password && <p className="text-sm text-red-600">{err.fields.password}</p>}
        </div>
        <button disabled={pending} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50">
          Masuk
        </button>
      </form>
      <p className="mt-4 text-sm">
        Belum punya akun? <Link to="/daftar" className="text-primary underline">Daftar</Link>
      </p>
    </div>
  );
}
