import { useEffect, useRef } from "react";
import { Button, Field, Panel, Select, Textarea } from "../../components/ui";
import { analyzePhoto, type Category } from "./api";
import { FieldErrors, StepNav, type StepProps } from "./StepNav";

export const NOTICE = "AI sedang tidak tersedia. Silakan isi kategori dan deskripsi sendiri.";

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
  const aiDraft = ai.status === "done" && r && r.is_infrastructure;

  const form = (
    <div className="flex flex-col gap-6">
      <Field label="Kategori" htmlFor="cat">
        <Select
          id="cat"
          value={draft.categoryId}
          onChange={(e) => patch({ categoryId: e.target.value ? Number(e.target.value) : "" })}
        >
          <option value="">Pilih kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </Field>
      <Field label="Deskripsi" htmlFor="desc" hint={`${len}/2000 (min. 10)`}>
        <Textarea
          id="desc"
          rows={5}
          maxLength={2000}
          value={draft.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </Field>
      <FieldErrors errors={errors} keys={["category_id", "description"]} />
    </div>
  );

  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold">Tinjau</h2>
      {ai.status === "loading" && (
        <div className="flex flex-col items-start gap-3">
          <p role="status" className="flex items-center gap-2 font-semibold">
            AI sedang membaca foto...
          </p>
          <Button variant="secondary" onClick={() => patch({ ai: { status: "skipped" } })}>
            Isi manual
          </Button>
        </div>
      )}
      {ai.status === "error" && (
        <p role="alert" className="mb-6 rounded-lg bg-marka-soft p-4 text-ink">{NOTICE}</p>
      )}
      {ai.status === "done" && r && !r.is_infrastructure && (
        <p role="alert" className="mb-6 rounded-lg bg-marka-soft p-4 text-ink">
          Foto ini tampaknya bukan masalah infrastruktur. Periksa kembali foto Anda atau isi laporan secara manual.
        </p>
      )}
      {ai.status !== "loading" &&
        (aiDraft ? (
          <Panel>
            <span className="mb-4 inline-block rounded-lg bg-rambu-soft px-3 py-1 text-sm font-semibold text-rambu-dark">
              Draf AI · Perlu ditinjau
            </span>
            {r.observations.length > 0 && (
              <ul className="mb-6 list-disc pl-6">
                {r.observations.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            )}
            {form}
          </Panel>
        ) : (
          form
        ))}
      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!valid || ai.status === "loading"} />
    </section>
  );
}
