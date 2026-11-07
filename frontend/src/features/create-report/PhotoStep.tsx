import { useEffect, useMemo, useState } from "react";
import { downscale, MAX_FILES, validateImage } from "../../lib/image";
import { FieldErrors, StepNav, type StepProps } from "./StepNav";

export default function PhotoStep({ draft, patch, onNext, errors }: StepProps) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const urls = useMemo(() => draft.files.map((f) => URL.createObjectURL(f)), [draft.files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  async function add(list: FileList | null) {
    if (!list) return;
    setMsg("");
    const picked = Array.from(list);
    if (draft.files.length + picked.length > MAX_FILES) {
      return setMsg(`Maksimal ${MAX_FILES} foto.`);
    }
    for (const f of picked) {
      const err = validateImage(f);
      if (err) return setMsg(`${f.name}: ${err}`);
    }
    setBusy(true);
    try {
      const out = await Promise.all(picked.map(downscale));
      patch({ files: [...draft.files, ...out], ai: { status: "idle" } });
    } catch {
      setMsg("Foto tidak dapat diproses.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Foto</h2>
      <p className="mb-3 text-sm text-slate-600">
        Unggah 1 sampai 3 foto (JPG, PNG, WebP, maks 8 MB). Hindari memotret wajah atau pelat nomor kendaraan.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        aria-label="Pilih foto"
        disabled={busy}
        onChange={(e) => { void add(e.target.files); e.target.value = ""; }}
        className="block w-full text-sm"
      />
      {busy && <p className="mt-2 text-sm">Memproses foto…</p>}
      {msg && <p role="alert" className="mt-2 text-sm text-red-600">{msg}</p>}
      <FieldErrors errors={errors} keys={["images"]} />
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {urls.map((u, i) => (
          <li key={u} className="relative">
            <img src={u} alt={`Foto ${i + 1}`} className="aspect-square w-full rounded object-cover" />
            <button
              type="button"
              aria-label={`Hapus foto ${i + 1}`}
              onClick={() => patch({ files: draft.files.filter((_, j) => j !== i), ai: { status: "idle" } })}
              className="absolute right-1 top-1 rounded-full bg-black/70 px-2 text-white"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <StepNav onNext={onNext} nextDisabled={draft.files.length === 0 || busy} />
    </section>
  );
}
