import { useMemo } from "react";
import { FieldErrors, StepNav, type StepProps } from "./StepNav";
import type { Category } from "./api";

export default function SubmitStep(
  { draft, onNext, onBack, errors, cats, busy }:
  StepProps & { cats: Category[]; busy: boolean },
) {
  const urls = useMemo(() => draft.files.map((f) => URL.createObjectURL(f)), [draft.files]);
  const cat = cats.find((c) => c.id === draft.categoryId);
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Kirim</h2>
      <div className="flex gap-2">
        {urls.map((u, i) => <img key={u} src={u} alt={`Foto ${i + 1}`} className="h-20 w-20 rounded object-cover" />)}
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div><dt className="font-medium">Kategori</dt><dd>{cat?.name}</dd></div>
        <div><dt className="font-medium">Deskripsi</dt><dd className="whitespace-pre-wrap">{draft.description}</dd></div>
        <div><dt className="font-medium">Lokasi</dt><dd>{draft.address || `${draft.loc?.lat.toFixed(5)}, ${draft.loc?.lng.toFixed(5)}`}</dd></div>
        {draft.linkTo && <div><dt className="font-medium">Ditautkan ke laporan serupa</dt><dd>#{draft.linkTo}</dd></div>}
      </dl>
      <FieldErrors errors={errors} keys={["detail", "link_to_report_id"]} />
      <StepNav onBack={onBack} onNext={onNext} nextDisabled={busy} nextLabel={busy ? "Mengirim…" : "Kirim Laporan"} />
    </section>
  );
}
