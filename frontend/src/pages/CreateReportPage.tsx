import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../lib/api";
import { SignPlate } from "../components/ui";
import {
  EMPTY_DRAFT, fetchCategories, submitReport, type Category, type Draft,
} from "../features/create-report/api";
import { FIELD_STEP, Stepper, stepIndex, type StepProps } from "../features/create-report/StepNav";
import PhotoStep from "../features/create-report/PhotoStep";
import LocationStep from "../features/create-report/LocationStep";
import ReviewStep from "../features/create-report/ReviewStep";
import DuplicateStep, { type DupCache } from "../features/create-report/DuplicateStep";
import SubmitStep, { SuccessScreen, type Created } from "../features/create-report/SubmitStep";

const LEAVE_MSG = "Laporan belum dikirim. Keluar dari halaman ini?";

export default function CreateReportPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [cats, setCats] = useState<Category[]>([]);
  const [dup, setDup] = useState<DupCache | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);
  const done = useRef(false);
  const dirty = draft.files.length > 0 || draft.loc !== null || draft.description !== "";

  useEffect(() => {
    fetchCategories().then(setCats, () => setCats([]));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const before = (e: BeforeUnloadEvent) => {
      if (done.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const click = (e: MouseEvent) => {
      if (done.current) return;
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (a && a.origin === window.location.origin && !window.confirm(LEAVE_MSG)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);

  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);

  const next = () => { setErrors({}); setStep((s) => Math.min(4, s + 1)); };
  const back = () => {
    setErrors({});
    setStep((s) => {
      // Skip the similar-reports step when it was auto-skipped.
      if (s === 4 && (!dup?.result || dup.result.decision === "low")) return 2;
      return Math.max(0, s - 1);
    });
  };

  async function submit() {
    setBusy(true);
    setErrors({});
    try {
      const r = await submitReport(draft, cats);
      done.current = true;
      setCreated(r);
    } catch (e) {
      if (e instanceof ApiError && e.status === 400 && e.data && typeof e.data === "object") {
        const errs: Record<string, string> = {};
        for (const [k, v] of Object.entries(e.data as Record<string, unknown>)) {
          errs[k] = Array.isArray(v) ? v.join(" ") : String(v);
        }
        setErrors(errs);
        const steps = Object.keys(errs).map((k) => FIELD_STEP[k]).filter((n) => n !== undefined);
        if (steps.length) setStep(Math.min(...steps));
      } else {
        setErrors({ detail: "Gagal mengirim laporan. Coba lagi." });
      }
    } finally {
      setBusy(false);
    }
  }

  const props: StepProps = { draft, patch, onNext: next, onBack: back, errors };

  function again() {
    done.current = false;
    setCreated(null);
    setDraft(EMPTY_DRAFT);
    setDup(null);
    setErrors({});
    setStep(0);
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <SuccessScreen created={created} onAgain={again} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8 md:py-12">
      <SignPlate tone="rambu" level={1}>Buat Laporan</SignPlate>
      <Stepper current={stepIndex(step)} />
      <div>
        {step === 0 && <PhotoStep {...props} />}
        {step === 1 && <LocationStep {...props} />}
        {step === 2 && <ReviewStep {...props} cats={cats} />}
        {step === 3 && <DuplicateStep {...props} cache={dup} setCache={setDup} />}
        {step === 4 && <SubmitStep {...props} onNext={submit} cats={cats} busy={busy} />}
      </div>
    </div>
  );
}
