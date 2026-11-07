import { useMemo } from "react";
import { Button, SignPlate } from "../../components/ui";
import { FieldErrors, StepNav, type StepProps } from "./StepNav";
import type { Category } from "./api";

export interface Created { id: number; code?: string }

export function SuccessScreen({ created, onAgain }: { created: Created; onAgain: () => void }) {
  return (
    <section className="flex flex-col gap-6">
      <SignPlate tone="rambu" level={2}>Laporan terkirim</SignPlate>
      {created.code && (
        <p>
          Kode laporan Anda: <strong className="font-mono text-lg font-semibold tabular-nums">{created.code}</strong>
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button to={`/laporan/${created.id}`} size="lg" className="w-full sm:w-auto">Lihat laporan</Button>
        <Button variant="secondary" size="lg" onClick={onAgain} className="w-full sm:w-auto">
          Buat laporan lain
        </Button>
      </div>
    </section>
  );
}

export default function SubmitStep(
  { draft, onNext, onBack, errors, cats, busy }:
  StepProps & { cats: Category[]; busy: boolean },
) {
  const urls = useMemo(() => draft.files.map((f) => URL.createObjectURL(f)), [draft.files]);
  const cat = cats.find((c) => c.id === draft.categoryId);
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold">Kirim</h2>
      <div className="flex gap-2">
        {urls.map((u, i) => <img key={u} src={u} alt={`Foto ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />)}
      </div>
      <dl className="mt-4 flex flex-col gap-3">
        <div><dt className="text-sm text-muted">Kategori</dt><dd className="font-semibold">{cat?.name}</dd></div>
        <div><dt className="text-sm text-muted">Deskripsi</dt><dd className="whitespace-pre-wrap">{draft.description}</dd></div>
        <div><dt className="text-sm text-muted">Lokasi</dt><dd>{draft.address || `${draft.loc?.lat.toFixed(5)}, ${draft.loc?.lng.toFixed(5)}`}</dd></div>
        {draft.linkTo && <div><dt className="text-sm text-muted">Ditautkan ke laporan serupa</dt><dd>#{draft.linkTo}</dd></div>}
      </dl>
      <FieldErrors errors={errors} keys={["detail", "link_to_report_id"]} />
      <StepNav onBack={onBack} onNext={onNext} nextDisabled={busy} loading={busy} nextLabel={busy ? "Mengirim…" : "Kirim Laporan"} />
    </section>
  );
}
