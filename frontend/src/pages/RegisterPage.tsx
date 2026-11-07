import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button, Field, Input, Panel } from "../components/ui";
import { useAuth } from "../features/auth/AuthContext";
import { parseError, type FormErrors } from "../features/auth/errors";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
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

  return (
    <div className="mx-auto max-w-md px-4 py-8 md:py-12">
      <Panel>
        <h1 className="mb-6 font-display text-xl font-extrabold">Daftar</h1>
        <form onSubmit={submit} className="flex flex-col gap-6">
          {err.general && (
            <p role="alert" className="rounded-lg bg-danger-soft p-3 font-semibold text-danger">{err.general}</p>
          )}
          <Field label="Nama lengkap" htmlFor="full_name" error={err.fields.full_name}>
            <Input id="full_name" type="text" required value={form.full_name} onChange={set("full_name")} />
          </Field>
          <Field label="Email" htmlFor="email" error={err.fields.email}>
            <Input id="email" type="email" required value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Kata sandi" htmlFor="password" error={err.fields.password}>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                required
                className="w-full pr-14"
                value={form.password}
                onChange={set("password")}
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
          <Button type="submit" size="lg" loading={pending} className="w-full">Daftar</Button>
        </form>
        <p className="mt-6">
          Sudah punya akun? <Link to="/masuk" className="font-semibold text-rambu underline">Masuk</Link>
        </p>
      </Panel>
    </div>
  );
}
