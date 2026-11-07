import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ApiError } from "../../lib/api";
import { Button, Panel } from "../../components/ui";
import { postInsights, UNAVAILABLE_TEXT, type Insights, type Range } from "./analyticsApi";

export default function InsightsCard({ range }: { range: Range }) {
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError("");
    try {
      setData(await postInsights(range));
    } catch (e) {
      setData(null);
      setError(e instanceof ApiError && e.status !== 503
        ? "Gagal membuat ringkasan. Coba lagi." : UNAVAILABLE_TEXT);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel as="section" className="flex flex-col gap-4" >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="ai-title" className="text-lg font-bold">Ringkasan AI</h2>
        <span className="rounded-lg bg-rambu-soft px-2 py-1 text-xs font-semibold text-rambu-dark">AI</span>
      </div>
      <div>
        <Button icon={Sparkles} onClick={run} loading={busy}>
          {busy ? "Membuat..." : "Buat Ringkasan"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-marka-soft p-4 font-semibold text-ink">{error}</p>
      )}
      {data && (
        <div data-testid="insights-result" data-verified={String(data.verified)}
          className={`flex flex-col gap-3 rounded-lg p-4 ${data.verified ? "border border-line" : "bg-marka-soft"}`}>
          {!data.verified && (
            <p role="status" className="text-sm font-semibold text-ink">
              Ringkasan ini belum terverifikasi terhadap data. Periksa angka dengan teliti.
            </p>
          )}
          <p>{data.summary}</p>
          {data.highlights.length > 0 && (
            <ul className="m-0 list-disc pl-6">
              {data.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          )}
          <p className="text-sm text-muted">
            Dibuat: {new Date(data.generated_at).toLocaleString("id-ID")}
          </p>
          <p className="text-sm text-muted">
            Dibuat AI dari statistik di halaman ini. Periksa kembali sebelum digunakan.
          </p>
        </div>
      )}
    </Panel>
  );
}
