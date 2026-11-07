import type { Draft } from "./api";

export interface StepProps {
  draft: Draft;
  patch: (p: Partial<Draft>) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

export function StepNav(props: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex justify-between gap-3">
      {props.onBack ? (
        <button type="button" onClick={props.onBack} className="rounded border border-slate-300 px-4 py-2">
          Kembali
        </button>
      ) : <span />}
      <button
        type="button"
        onClick={props.onNext}
        disabled={props.nextDisabled}
        className="rounded bg-[#2D6CDF] px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {props.nextLabel ?? "Lanjut"}
      </button>
    </div>
  );
}

export function FieldErrors({ errors, keys }: { errors: Record<string, string>; keys: string[] }) {
  const msgs = keys.map((k) => errors[k]).filter(Boolean);
  if (!msgs.length) return null;
  return (
    <div role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
      {msgs.map((m, i) => <p key={i}>{m}</p>)}
    </div>
  );
}

export const STEPS = ["Foto", "Lokasi", "Tinjau", "Laporan Serupa", "Kirim"];

export const FIELD_STEP: Record<string, number> = {
  images: 0, latitude: 1, longitude: 1, address: 1, category_id: 2, description: 2,
  link_to_report_id: 3,
};
