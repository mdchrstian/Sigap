import { Panel } from "../../components/ui";
import StatusBadge from "../../components/StatusBadge";

export default function SampleTicket() {
  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-marka-soft px-3 py-1 text-sm font-semibold text-ink">Contoh</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-ink">SGP-CONTOH</span>
      </div>
      <div>
        <p className="text-base font-semibold text-ink">Jalan berlubang</p>
        <p className="text-sm text-muted">Jl. Raya Ubud, Gianyar</p>
      </div>
      <div className="rounded-lg bg-ground p-4">
        <p className="text-sm font-semibold text-ink">Draf AI</p>
        <p className="text-sm text-muted">
          Lubang selebar ±40 cm di lajur kiri, tergenang air saat hujan. Berbahaya bagi pengendara motor.
        </p>
      </div>
      <div>
        <StatusBadge status="in_progress" />
      </div>
      <div className="flex items-center" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-1 items-center last:flex-none">
            <span
              className={`size-4 shrink-0 rounded-full border-2 ${
                i < 3 ? "border-rambu bg-rambu" : i === 3 ? "border-ink bg-marka" : "border-line-strong bg-surface"
              }`}
            />
            {i < 4 && <span className="mx-1 h-0 flex-1 border-t-4 border-dashed border-marka" />}
          </div>
        ))}
      </div>
    </Panel>
  );
}
