import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button, Field, Input, Panel } from "../components/ui";
import { useAuth } from "../features/auth/AuthContext";
import { parseError, type FormErrors } from "../features/auth/errors";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Panel>
        <h1 className="mb-6 font-display text-xl font-extrabold">Masuk</h1>
        <form onSubmit={submit} className="flex flex-col gap-6">
          {err.general && (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 font-semibold text-danger">{err.general}</p>
          )}
          <Field label="Email" htmlFor="email" error={err.fields.email}>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Kata sandi" htmlFor="password" error={err.fields.password}>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                required
                className="w-full pr-14"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                variant="quiet"
                icon={show ? EyeOff : Eye}
                aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                onClick={() => setShow(!show)}
                className="absolute right-0 top-0 h-12 px-3"
              />
            </div>
          </Field>
          <Button type="submit" size="lg" loading={pending} className="w-full">Masuk</Button>
        </form>
        <p className="mt-6">
          Belum punya akun? <Link to="/daftar" className="font-semibold text-rambu underline">Daftar</Link>
        </p>
      </Panel>
    </div>
  );
}
