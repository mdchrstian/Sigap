import { useEffect, useRef } from "react";
import { analyzePhoto, type Category } from "./api";
import { FieldErrors, StepNav, type StepProps } from "./StepNav";

export const NOTICE = "Analisis AI tidak tersedia. Silakan isi laporan secara manual.";

export default function ReviewStep(
  { draft, patch, onNext, onBack, errors, cats }: StepProps & { cats: Category[] },
) {
  const { ai } = draft;
  const started = useRef(false);

  useEffect(() => {
    if (started.current || cats.length === 0 || ai.status !== "idle" || draft.files.length === 0) return;
    started.current = true;
    patch({ ai: { status: "loading" } });
    analyzePhoto(draft.files[0]).then(
      (result) => {
        const cat = cats.find((c) => c.slug === result.category_slug);
        patch({
          ai: { status: "done", result },
          ...(result.is_infrastructure
            ? { categoryId: cat?.id ?? "", description: result.description }
            : {}),
        });
      },
      () => patch({ ai: { status: "error" } }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ai.status, cats]);

  const r = ai.result;
  const len = draft.description.trim().length;
  const valid = draft.categoryId !== "" && len >= 10 && len <= 2000;

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Tinjau</h2>
      {ai.status === "loading" && <p role="status">AI sedang menganalisis foto…</p>}
      {ai.status === "loading" && (
        <button type="button" className="mt-1 text-sm text-[#2D6CDF] underline"
          onClick={() => patch({ ai: { status: "skipped" } })}>
          Isi manual
        </button>
      )}
      {ai.status === "error" && (
        <p role="alert" className="rounded bg-amber-50 p-3 text-sm text-amber-800">{NOTICE}</p>
      )}
      {ai.status === "done" && r && r.is_infrastructure && (
        <div className="mb-3 rounded bg-blue-50 p-3 text-sm">
          <span className="inline-block rounded-full bg-[#2D6CDF] px-2.5 py-0.5 text-xs font-semibold text-white">
            Saran AI · Perlu ditinjau
          </span>
          {r.observations.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {r.observations.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          )}
        </div>
      )}
      {ai.status === "done" && r && !r.is_infrastructure && (
        <p role="alert" className="mb-3 rounded bg-amber-50 p-3 text-sm text-amber-800">
          Foto ini tampaknya bukan masalah infrastruktur. Periksa kembali foto Anda atau isi laporan secara manual.
        </p>
      )}
      {ai.status !== "loading" && (
        <>
          <label className="mt-3 block text-sm font-medium" htmlFor="cat">Kategori</label>
          <select
            id="cat"
            value={draft.categoryId}
            onChange={(e) => patch({ categoryId: e.target.value ? Number(e.target.value) : "" })}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">Pilih kategori</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="mt-3 block text-sm font-medium" htmlFor="desc">Deskripsi</label>
          <textarea
            id="desc"
            rows={5}
            maxLength={2000}
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          <p className="text-right text-xs text-slate-500">{len}/2000 (min. 10)</p>
          <FieldErrors errors={errors} keys={["category_id", "description"]} />
        </>
      )}
      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!valid || ai.status === "loading"} />
    </section>
  );
}
