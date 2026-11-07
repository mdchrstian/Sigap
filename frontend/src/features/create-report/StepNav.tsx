import { Check } from "lucide-react";
import { Button } from "../../components/ui";
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
  loading?: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      {props.onBack ? (
        <Button variant="secondary" size="lg" onClick={props.onBack} className="w-full sm:w-auto">
          Kembali
        </Button>
      ) : (
        <span />
      )}
      <Button
        variant="primary"
        size="lg"
        onClick={props.onNext}
        disabled={props.nextDisabled}
        loading={props.loading}
        className="w-full sm:w-auto"
      >
        {props.nextLabel ?? "Lanjut"}
      </Button>
    </div>
  );
}

export function FieldErrors({ errors, keys }: { errors: Record<string, string>; keys: string[] }) {
  const msgs = keys.map((k) => errors[k]).filter(Boolean);
  if (!msgs.length) return null;
  return (
    <div role="alert" className="mt-3 rounded-lg bg-danger-soft p-3 text-sm text-danger">
      {msgs.map((m, i) => <p key={i}>{m}</p>)}
    </div>
  );
}

/** Visible stepper labels. Internal wizard steps 2 (Tinjau) and 3 (Laporan Serupa) both belong to "Cek draf". */
export const STEPS = ["Foto", "Lokasi", "Cek draf", "Kirim"];
export const stepIndex = (internal: number) => (internal <= 2 ? internal : internal - 1);

export const FIELD_STEP: Record<string, number> = {
  images: 0, latitude: 1, longitude: 1, address: 1, category_id: 2, description: 2,
  link_to_report_id: 3,
};

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex" aria-label="Langkah">
      {STEPS.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li
            key={s}
            aria-current={now ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute -left-1/2 top-4 w-full -translate-y-1/2 border-t-4 border-dashed ${
                  i <= current ? "border-marka" : "border-line-strong"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-rambu text-white"
                  : now
                    ? "bg-marka text-ink ring-2 ring-ink"
                    : "border-2 border-line-strong bg-surface text-muted"
              }`}
            >
              {done ? <Check size={16} aria-hidden="true" /> : i + 1}
            </span>
            <span className={`text-xs ${now ? "font-bold text-ink" : "text-muted"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
