import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import type { ReportStatus } from "../../lib/status";
import { checkDuplicates, type DupResult, type Draft } from "./api";
import { StepNav, type StepProps } from "./StepNav";

export function dupKey(d: Draft): string {
  return JSON.stringify([d.loc, d.categoryId, d.description]);
}

export interface DupCache { key: string; result: DupResult | null }

const item = "flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface p-4";

export default function DuplicateStep(
  { draft, patch, onNext, onBack, cache, setCache }:
  StepProps & { cache: DupCache | null; setCache: (c: DupCache) => void },
) {
  const key = dupKey(draft);
  const hit = cache && cache.key === key ? cache : null;
  const [res, setRes] = useState<DupResult | null | undefined>(hit ? hit.result : undefined);

  useEffect(() => {
    if (hit) return;
    let live = true;
    checkDuplicates({
      latitude: draft.loc!.lat, longitude: draft.loc!.lng,
      category_id: Number(draft.categoryId), description: draft.description,
    }).then(
      (r) => { if (live) { setCache({ key, result: r }); setRes(r); } },
      () => { if (live) { setCache({ key, result: null }); setRes(null); } },
    );
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = res === null || res?.decision === "low";
  useEffect(() => {
    if (skip) { patch({ linkTo: null }); onNext(); }
    else if (res?.decision === "high" && draft.linkTo === null) {
      patch({ linkTo: res.candidates[0].report_id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res]);

  if (res === undefined) return <p role="status" className="text-muted">Memeriksa laporan serupa…</p>;
  if (skip || !res) return null;

  const high = res.decision === "high";
  const best = res.candidates[0];
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold">Laporan Serupa</h2>
      {high && (
        <p className="mb-4 rounded-lg bg-marka-soft p-4 text-ink">
          Kemungkinan besar sama dengan <strong>{best.code}</strong>. Laporan Anda akan ditautkan ke laporan tersebut.
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {(high ? [best] : res.candidates).map((c) => (
          <li key={c.report_id}>
            <label className={item}>
              <input
                type="radio"
                name="dup"
                className="h-6 w-6 shrink-0"
                checked={draft.linkTo === c.report_id}
                onChange={() => patch({ linkTo: c.report_id })}
              />
              {c.thumbnail_url && (
                <img src={c.thumbnail_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              )}
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <span>
                  <strong className="font-mono font-semibold tabular-nums">{c.code}</strong> · {c.category_name}
                </span>
                <span className="text-sm text-muted">{c.distance_m} m</span>
                <StatusBadge status={c.status as ReportStatus} />
                <span className="text-sm font-semibold text-rambu">Gabungkan ke laporan ini</span>
              </span>
            </label>
          </li>
        ))}
        <li>
          <label className={item}>
            <input
              type="radio"
              name="dup"
              className="h-6 w-6 shrink-0"
              checked={draft.linkTo === null}
              onChange={() => patch({ linkTo: null })}
            />
            Tetap kirim laporan baru
          </label>
        </li>
      </ul>
      <StepNav onBack={onBack} onNext={onNext} />
    </section>
  );
}
