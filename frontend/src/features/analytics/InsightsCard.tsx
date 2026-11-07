import { useState } from "react";
import { ApiError } from "../../lib/api";
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
    <section aria-labelledby="ai-title" className="rounded border bg-white p-4">
      <h2 id="ai-title" className="text-lg font-semibold">Ringkasan AI</h2>
      <button onClick={run} disabled={busy}
        className="mt-2 rounded bg-[#176B5B] px-4 py-2 font-semibold text-white disabled:opacity-60">
        {busy ? "Membuat..." : "Buat Ringkasan"}
      </button>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {data && (
        <div data-testid="insights-result" data-verified={String(data.verified)}
          className={`mt-3 rounded border p-3 ${data.verified ? "border-slate-200" : "border-amber-400 bg-amber-50"}`}>
          {!data.verified && (
            <p role="status" className="mb-2 text-sm font-semibold text-amber-800">
              Ringkasan ini belum terverifikasi terhadap data. Periksa angka dengan teliti.
            </p>
          )}
          <p>{data.summary}</p>
          {data.highlights.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {data.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          )}
          <p className="mt-2 text-xs text-slate-600">
            Dibuat: {new Date(data.generated_at).toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-slate-600">
            Dibuat AI dari statistik di halaman ini. Periksa kembali sebelum digunakan.
          </p>
        </div>
      )}
    </section>
  );
}
