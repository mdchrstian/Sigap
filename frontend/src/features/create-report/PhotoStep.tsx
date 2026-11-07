import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, X } from "lucide-react";
import { Button, Panel } from "../../components/ui";
import { downscale, MAX_FILES, validateImage } from "../../lib/image";
import { FieldErrors, StepNav, type StepProps } from "./StepNav";

export default function PhotoStep({ draft, patch, onNext, errors }: StepProps) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const replacing = useRef(false);
  const handed = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const urls = useMemo(() => draft.files.map((f) => URL.createObjectURL(f)), [draft.files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  async function add(picked: File[], replace = false) {
    if (!picked.length) return;
    setMsg("");
    const base = replace ? [] : draft.files;
    if (base.length + picked.length > MAX_FILES) {
      return setMsg(`Maksimal ${MAX_FILES} foto.`);
    }
    for (const f of picked) {
      const err = validateImage(f);
      if (err) return setMsg(`${f.name}: ${err}`);
    }
    setBusy(true);
    try {
      const out = await Promise.all(picked.map(downscale));
      patch({ files: [...base, ...out], ai: { status: "idle" } });
    } catch {
      setMsg("Foto tidak dapat diproses.");
    } finally {
      setBusy(false);
    }
  }

  // Contract with the landing page: router state { photo: File } preselects the photo, no auto-advance.
  useEffect(() => {
    if (handed.current) return;
    const photo = (location.state as { photo?: unknown } | null)?.photo;
    if (!(photo instanceof File)) return;
    handed.current = true;
    void add([photo]);
    navigate(".", { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const has = draft.files.length > 0;

  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold">Foto</h2>
      <p className="mb-4 text-muted">
        Unggah 1 sampai 3 foto (JPG, PNG, WebP, maks 8 MB). Hindari memotret wajah atau pelat nomor kendaraan.
      </p>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        aria-label="Pilih foto"
        disabled={busy}
        onChange={(e) => {
          const list = Array.from(e.target.files ?? []);
          e.target.value = "";
          void add(list, replacing.current);
        }}
      />
      <Panel className="flex flex-col items-center gap-4 border-2 border-dashed border-line-strong text-center">
        {has ? (
          <ul className="grid w-full grid-cols-3 gap-3">
            {urls.map((u, i) => (
              <li key={u} className="relative">
                <img src={u} alt={`Foto ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                <button
                  type="button"
                  aria-label={`Hapus foto ${i + 1}`}
                  onClick={() => patch({ files: draft.files.filter((_, j) => j !== i), ai: { status: "idle" } })}
                  className="absolute right-1 top-1 flex h-12 w-12 items-center justify-center rounded-lg bg-aspal text-white"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <Camera size={48} aria-hidden="true" className="text-rambu" />
            <p className="font-semibold">Ambil atau pilih foto kerusakan</p>
          </>
        )}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            variant={has ? "secondary" : "primary"}
            size="lg"
            icon={Camera}
            disabled={busy}
            onClick={() => { replacing.current = has; input.current?.click(); }}
            className="w-full sm:w-auto"
          >
            {has ? "Ganti foto" : "Pilih foto"}
          </Button>
          {has && draft.files.length < MAX_FILES && (
            <Button
              variant="quiet"
              size="lg"
              disabled={busy}
              onClick={() => { replacing.current = false; input.current?.click(); }}
              className="w-full sm:w-auto"
            >
              Tambah foto
            </Button>
          )}
        </div>
      </Panel>
      {busy && <p role="status" className="mt-3 text-muted">Memproses foto…</p>}
      {msg && <p role="alert" className="mt-3 font-semibold text-danger">{msg}</p>}
      <FieldErrors errors={errors} keys={["images"]} />
      <StepNav onNext={onNext} nextDisabled={draft.files.length === 0 || busy} />
    </section>
  );
}
