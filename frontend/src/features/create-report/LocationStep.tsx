import LocationPicker from "../../components/LocationPicker";
import { FieldErrors, StepNav, type StepProps } from "./StepNav";

export default function LocationStep({ draft, patch, onNext, onBack, errors }: StepProps) {
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold">Lokasi</h2>
      <p className="mb-4 text-muted">Klik peta atau geser penanda ke lokasi masalah.</p>
      <LocationPicker
        value={draft.loc}
        onChange={(p) => patch({ loc: p, inBali: null, address: "" })}
        onResolved={(r) => patch({ inBali: r ? r.in_bali : true, address: r?.address ?? "" })}
      />
      <FieldErrors errors={errors} keys={["latitude", "longitude", "address"]} />
      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!draft.loc || draft.inBali === null || draft.inBali === false}
      />
    </section>
  );
}
